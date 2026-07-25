import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'RWF' },
  method: { type: String, enum: ['momo', 'card'], required: true },
  status: { type: String, enum: ['pending', 'processing', 'successful', 'failed'], default: 'pending' },
  flutterwaveId: { type: String, default: '' },
  flutterwaveRef: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  txRef: { type: String, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ txRef: 1 }, { unique: true });
paymentSchema.index({ flutterwaveId: 1 });

export default mongoose.model('Payment', paymentSchema);
