import mongoose from 'mongoose';

const teamAppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  education: { type: String, default: '' },
  location: { type: String, required: true },
  applicantType: { type: String, enum: ['student', 'teacher', 'entrepreneur', 'employee', 'other'], default: 'student' },
  involvement: { type: String, default: 'member' },
  skills: [{ type: String }],
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('TeamApp', teamAppSchema);
