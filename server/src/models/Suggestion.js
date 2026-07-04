import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['admin', 'user'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const suggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'implemented'], default: 'pending' },
  adminResponse: { type: String, default: '' },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('Suggestion', suggestionSchema);
