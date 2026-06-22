import mongoose from 'mongoose';

const teamAppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  education: { type: String, required: true },
  location: { type: String, required: true },
  involvement: { type: String, default: 'member' },
  skills: [{ type: String }],
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('TeamApp', teamAppSchema);
