import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  completedLessons: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  totalStudyMinutes: { type: Number, default: 0 },
  topicsCovered: [{ type: String }],
  lastStudied: { type: Date },
}, { timestamps: true });

learningProgressSchema.index({ userId: 1, subject: 1 }, { unique: true });

export default mongoose.model('LearningProgress', learningProgressSchema);
