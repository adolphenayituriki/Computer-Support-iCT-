import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { sendPaymentReceipt, sendAdminNotification } from '../services/mailer.js';

const FLW_API_BASE = 'https://api.flutterwave.com/v3';
const FLW_OAUTH_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const params = new URLSearchParams();
  params.append('client_id', process.env.FLW_CLIENT_ID);
  params.append('client_secret', process.env.FLW_CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const res = await fetch(FLW_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!data.access_token) {
    console.error('Flutterwave OAuth failed:', res.status, JSON.stringify(data));
    throw new Error(`Failed to obtain Flutterwave access token: ${data.error || data.message || 'unknown'}`);
  }

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function flwPost(endpoint, body) {
  const token = await getAccessToken();
  const res = await fetch(`${FLW_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function flwGet(endpoint) {
  const token = await getAccessToken();
  const res = await fetch(`${FLW_API_BASE}${endpoint}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

function generateTxRef() {
  return `CSH-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

export async function initiatePayment(req, res) {
  try {
    const { courseId, method, phone, email } = req.body;
    if (!courseId || !method) return res.status(400).json({ error: 'courseId and method required.' });
    if (!['momo', 'card'].includes(method)) return res.status(400).json({ error: 'Invalid payment method.' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const existing = await Payment.findOne({ userId: req.user.id, courseId, status: 'successful' });
    if (existing) return res.json({ status: 'already_paid', txRef: existing.txRef });

    const txRef = generateTxRef();
    const amount = course.certificateFee || 1000;
    const userName = user.name || 'Student';
    const userEmail = email || user.email || 'student@cshub.rw';

    const payment = await Payment.create({
      userId: req.user.id,
      courseId,
      amount,
      currency: 'RWF',
      method,
      status: 'pending',
      txRef,
      email: userEmail,
      phone: phone || '',
    });

    if (method === 'momo') {
      if (!phone) return res.status(400).json({ error: 'Phone number required for MoMo.' });

      let formattedPhone = phone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '250' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('250')) {
        formattedPhone = '250' + formattedPhone;
      }

      const result = await flwPost('/charges', {
        tx_ref: txRef,
        amount,
        currency: 'RWF',
        email: userEmail,
        phone_number: formattedPhone,
        fullname: userName,
        network: 'MTN',
      });

      if (result.status === 'success') {
        await Payment.findOneAndUpdate({ txRef }, {
          status: 'processing',
          flutterwaveRef: result.data?.flw_ref || '',
        });
        return res.json({
          status: 'pending',
          txRef,
          message: 'Check your phone to authorize the payment.',
          flwRef: result.data?.flw_ref || '',
        });
      } else {
        console.error('Flutterwave MoMo error:', JSON.stringify(result));
        await Payment.findOneAndUpdate({ txRef }, { status: 'failed' });
        return res.status(400).json({ error: result.message || 'Payment initiation failed.' });
      }
    }

    if (method === 'card') {
      const result = await flwPost('/charges', {
        tx_ref: txRef,
        amount,
        currency: 'RWF',
        email: userEmail,
        fullname: userName,
        redirect_url: `${process.env.FRONTEND_URL}/payment-callback`,
      });

      if (result.status === 'success' && result.data?.link) {
        await Payment.findOneAndUpdate({ txRef }, { status: 'processing' });
        return res.json({
          status: 'redirect',
          txRef,
          redirectUrl: result.data.link,
        });
      } else {
        await Payment.findOneAndUpdate({ txRef }, { status: 'failed' });
        return res.status(400).json({ error: result.message || 'Payment initiation failed.' });
      }
    }
  } catch (e) {
    console.error('Payment initiation error:', e.message, e.stack);
    sendAdminNotification('Payment Initiation Failed', `Error: ${e.message}\n\nStack: ${e.stack}`).catch(() => {});
    res.status(500).json({ error: 'Payment service unavailable.', detail: e.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { txRef } = req.params;
    if (!txRef) return res.status(400).json({ error: 'txRef required.' });

    const payment = await Payment.findOne({ txRef });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });

    if (payment.status === 'successful') {
      return res.json({ status: 'successful', txRef, courseId: payment.courseId });
    }

    const result = await flwGet(`/charges/verify?tx_ref=${encodeURIComponent(txRef)}`);

    if (result.data?.status === 'successful') {
      const updated = await Payment.findOneAndUpdate({ txRef }, {
        status: 'successful',
        verified: true,
        flutterwaveId: result.data.id || '',
      }, { new: true });

      const course = await Course.findById(payment.courseId);
      const user = await User.findById(payment.userId);
      if (user && course) {
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        sendPaymentReceipt(user.email, user.name, course.title, payment.amount, payment.currency, payment.method, txRef, dateStr)
          .catch((e) => console.error('Payment receipt email error:', e.message));
      }

      return res.json({ status: 'successful', txRef, courseId: payment.courseId });
    }

    return res.json({ status: payment.status, txRef });
  } catch (e) {
    console.error('Payment verify error:', e.message);
    sendAdminNotification('Payment Verification Failed', `Error: ${e.message}`).catch(() => {});
    res.status(500).json({ error: 'Verification failed.' });
  }
}

export async function checkPaymentStatus(req, res) {
  try {
    const { courseId } = req.params;
    const payment = await Payment.findOne({ userId: req.user.id, courseId, status: 'successful' });
    res.json({ paid: !!payment });
  } catch (e) {
    res.json({ paid: false });
  }
}

export async function handleWebhook(req, res) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers['flutterwave-signature'];

    if (secretHash && secretHash !== 'your_secret_hash_here' && signature) {
      const hash = crypto.createHmac('sha256', secretHash).update(JSON.stringify(req.body)).digest('base64');
      if (hash !== signature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { type, data } = req.body;

    if (type === 'charge.completed' && data?.status === 'succeeded') {
      const txRef = data.reference || data.tx_ref;
      if (txRef) {
        const payment = await Payment.findOne({ txRef });
        await Payment.findOneAndUpdate({ txRef }, {
          status: 'successful',
          verified: true,
          flutterwaveId: data.id || '',
        });

        if (payment && payment.status !== 'successful') {
          const course = await Course.findById(payment.courseId);
          const user = await User.findById(payment.userId);
          if (user && course) {
            const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            sendPaymentReceipt(user.email, user.name, course.title, payment.amount, payment.currency, payment.method, txRef, dateStr)
              .catch((e) => console.error('Payment receipt email error:', e.message));
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(200).json({ status: 'ok' });
  }
}
