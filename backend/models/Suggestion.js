import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'implemented'], default: 'pending' },
  adminResponse: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Suggestion', suggestionSchema);
