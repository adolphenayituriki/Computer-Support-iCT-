import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const learningSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, default: 'general' },
  topic: { type: String, default: '' },
  messages: [messageSchema],
  totalMessages: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('LearningSession', learningSessionSchema);
