import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['book', 'link'], required: true },
  subject: { type: String, default: 'General' },
  description: { type: String, default: '' },
  filePath: { type: String },
  fileOriginalName: { type: String },
  linkUrl: { type: String },
  content: { type: String, default: '' },
  contentLength: { type: Number, default: 0 },
  status: { type: String, enum: ['processing', 'ready', 'error'], default: 'processing' },
  errorMessage: { type: String },
  tags: [{ type: String }],
  quizzesGenerated: { type: Number, default: 0 },
  flashcardsGenerated: { type: Number, default: 0 },
}, { timestamps: true });

resourceSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Resource', resourceSchema);
