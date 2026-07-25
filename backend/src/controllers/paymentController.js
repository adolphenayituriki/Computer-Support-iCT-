import Flutterwave from 'flutterwave-node-v3';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

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
    const amount = 1000;
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

      const payload = {
        tx_ref: txRef,
        amount,
        currency: 'RWF',
        email: userEmail,
        phone_number: phone,
        fullname: userName,
        network: 'MTN',
      };

      const response = await flw.MobileMoney.rw(payload);

      if (response.status === 'success') {
        await Payment.findOneAndUpdate({ txRef }, {
          status: 'processing',
          flutterwaveRef: response.data?.flw_ref || '',
        });
        return res.json({
          status: 'pending',
          txRef,
          message: 'Check your phone to authorize the payment.',
          flwRef: response.data?.flw_ref || '',
        });
      } else {
        await Payment.findOneAndUpdate({ txRef }, { status: 'failed' });
        return res.status(400).json({ error: response.message || 'Payment initiation failed.' });
      }
    }

    if (method === 'card') {
      const payload = {
        tx_ref: txRef,
        amount,
        currency: 'RWF',
        email: userEmail,
        fullname: userName,
        redirect_url: `${process.env.FRONTEND_URL}/payment-callback`,
      };

      const response = await flw.Charges.card(payload);

      if (response.status === 'success' && response.data?.link) {
        await Payment.findOneAndUpdate({ txRef }, { status: 'processing' });
        return res.json({
          status: 'redirect',
          txRef,
          redirectUrl: response.data.link,
        });
      } else {
        await Payment.findOneAndUpdate({ txRef }, { status: 'failed' });
        return res.status(400).json({ error: response.message || 'Payment initiation failed.' });
      }
    }
  } catch (e) {
    console.error('Payment initiation error:', e.message);
    res.status(500).json({ error: 'Payment service unavailable.' });
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

    const response = await flw.Charges.verify({ tx_ref: txRef });

    if (response.data?.status === 'successful') {
      await Payment.findOneAndUpdate({ txRef }, {
        status: 'successful',
        verified: true,
        flutterwaveId: response.data.id || '',
      });
      return res.json({ status: 'successful', txRef, courseId: payment.courseId });
    }

    return res.json({ status: payment.status, txRef });
  } catch (e) {
    console.error('Payment verify error:', e.message);
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

    if (secretHash && signature) {
      const hash = crypto.createHmac('sha256', secretHash).update(JSON.stringify(req.body)).digest('base64');
      if (hash !== signature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { type, data } = req.body;

    if (type === 'charge.completed' && data?.status === 'succeeded') {
      const txRef = data.reference || data.tx_ref;
      if (txRef) {
        await Payment.findOneAndUpdate({ txRef }, {
          status: 'successful',
          verified: true,
          flutterwaveId: data.id || '',
        });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(200).json({ status: 'ok' });
  }
}
