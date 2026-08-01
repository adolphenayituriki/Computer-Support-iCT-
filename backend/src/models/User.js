import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  phoneVerified: { type: Boolean, default: false },
  password: { type: String, required: false },
  googleId: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  isTeamMember: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpires: { type: Number },
  setupToken: { type: String },
  setupTokenExpires: { type: Number },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string', $gt: '' } } });
userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string', $gt: '' } } });

export default mongoose.model('User', userSchema);
