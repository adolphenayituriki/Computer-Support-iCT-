import mongoose from 'mongoose';

const topicSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, default: '' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
  lesson: {
    summary: String,
    sections: [{
      heading: String,
      content: String,
    }],
  },
  image: {
    url: String,
    prompt: String,
    alt: String,
  },
  video: {
    url: String,
    title: String,
    duration: String,
  },
  audio: {
    url: String,
    transcript: String,
    duration: String,
  },
  quiz: [{
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
  }],
  flashcards: [{
    front: String,
    back: String,
  }],
  tags: [String],
}, { timestamps: true });

topicSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('TopicSession', topicSessionSchema);
