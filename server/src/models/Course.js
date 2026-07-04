import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, default: '' },
  category: { type: String, enum: ['general', 'hardware', 'software', 'network', 'virus', 'training'], default: 'general' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedTime: { type: String, default: '' },
  author: { type: String, default: 'Admin' },
  published: { type: Boolean, default: true },
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
