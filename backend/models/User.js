import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpires: { type: Number },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
