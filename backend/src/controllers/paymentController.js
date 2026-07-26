import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { sendPaymentReceipt, sendAdminNotification } from '../services/mailer.js';

function generateTxRef() {
  return `CSH-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

const MOMO_NUMBER = '0780505948';

export async function initiatePayment(req, res) {
  try {
    const { courseId, phone, receiptImage } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required.' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const existing = await Payment.findOne({ userId: req.user.id, courseId, status: 'approved' });
    if (existing) return res.json({ status: 'already_paid', txRef: existing.txRef });

    const pending = await Payment.findOne({ userId: req.user.id, courseId, status: 'pending_review' });
    if (pending) {
      if (receiptImage) {
        pending.receiptImage = receiptImage;
        pending.phone = phone || pending.phone;
        await pending.save();
      }
      return res.json({ status: 'pending_review', txRef: pending.txRef, message: 'Your payment is under review.' });
    }

    const txRef = generateTxRef();
    const amount = course.certificateFee || 1000;
    const userEmail = user.email || 'student@cshub.rw';

    const payment = await Payment.create({
      userId: req.user.id,
      courseId,
      amount,
      currency: 'RWF',
      method: 'momo',
      status: 'pending_review',
      txRef,
      email: userEmail,
      phone: phone || '',
      receiptImage: receiptImage || '',
    });

    sendAdminNotification(
      'New Certificate Payment Submitted',
      `Student: ${user.name}\nCourse: ${course.title}\nAmount: ${amount} RWF\nTxRef: ${txRef}\n\nPlease review and approve/reject in the admin dashboard.`
    ).catch(() => {});

    res.json({ status: 'pending_review', txRef, message: 'Your payment is under review.' });
  } catch (e) {
    console.error('Payment initiation error:', e.message, e.stack);
    res.status(500).json({ error: 'Payment submission failed.', detail: e.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { txRef } = req.params;
    if (!txRef) return res.status(400).json({ error: 'txRef required.' });

    const payment = await Payment.findOne({ txRef });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });

    return res.json({ status: payment.status, txRef, courseId: payment.courseId });
  } catch (e) {
    console.error('Payment verify error:', e.message);
    res.status(500).json({ error: 'Verification failed.' });
  }
}

export async function checkPaymentStatus(req, res) {
  try {
    const { courseId } = req.params;
    const payment = await Payment.findOne({ userId: req.user.id, courseId, status: 'approved' });
    res.json({ paid: !!payment });
  } catch {
    res.json({ paid: false });
  }
}

export async function getMomoNumber(_req, res) {
  res.json({ momoNumber: MOMO_NUMBER, name: 'NAYITURIKI Adolphe' });
}

export async function getMyPayments(req, res) {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
}
