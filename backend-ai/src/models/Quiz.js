import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, default: '' },
  level: { type: String, enum: ['primary', 'secondary', 'university'], default: 'secondary' },
  questions: [questionSchema],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  answers: [{ type: Number }],
  timeTaken: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
