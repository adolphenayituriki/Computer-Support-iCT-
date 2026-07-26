import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'RWF' },
  method: { type: String, default: 'momo' },
  status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  txRef: { type: String, required: true },
  receiptImage: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ txRef: 1 }, { unique: true });

export default mongoose.model('Payment', paymentSchema);
