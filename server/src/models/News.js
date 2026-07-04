import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  mediaType: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  mediaUrl: { type: String, default: '' },
  author: { type: String, default: 'Admin' },
  published: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
}, { timestamps: true });

export default mongoose.model('News', newsSchema);
