import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['admin', 'user'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
