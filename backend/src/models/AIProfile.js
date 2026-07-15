import mongoose from 'mongoose';

const aiProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  level: { type: String, enum: ['primary', 'secondary', 'university'], default: 'secondary' },
  grade: { type: String, default: '' },
  subjects: [{ type: String }],
  language: { type: String, enum: ['en', 'rw', 'fr'], default: 'en' },
  dailyGoalMinutes: { type: Number, default: 30 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  totalPoints: { type: Number, default: 0 },
  badges: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('AIProfile', aiProfileSchema);
