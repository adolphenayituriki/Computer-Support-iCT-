import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  issue: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamApp', default: null },
  assignedToName: { type: String, default: '' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Beneficiary', beneficiarySchema);
