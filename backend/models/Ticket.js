import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
