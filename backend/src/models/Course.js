import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const resourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['book', 'link', 'video', 'file'], default: 'link' },
  title: { type: String, required: true },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: true, timestamps: true });

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
  thumbnail: { type: String, default: '' },
  introVideo: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  resources: [resourceSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
