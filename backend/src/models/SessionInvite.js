import mongoose from 'mongoose';

const sessionInviteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '' },
  level: { type: String, enum: ['student', 'professional', 'beginner'], required: true },
  interests: [{ type: String }],
  suggestion: { type: String, default: '' },
  heardFrom: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'confirmed'], default: 'new' },
  emailSent: { type: Boolean, default: false },
}, { timestamps: true });

sessionInviteSchema.index({ email: 1 });
sessionInviteSchema.index({ createdAt: -1 });

export default mongoose.model('SessionInvite', sessionInviteSchema);
