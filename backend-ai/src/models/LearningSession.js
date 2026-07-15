import mongoose from 'mongoose';

const learningSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, default: 'general' },
  topic: { type: String, default: '' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  totalMessages: { type: Number, default: 0 },
}, { timestamps: true });

learningSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('LearningSession', learningSessionSchema);
