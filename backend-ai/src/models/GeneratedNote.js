import mongoose from 'mongoose';

const generatedNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, default: 'General' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  sourceText: { type: String, default: '' },
  notes: {
    title: String,
    summary: String,
    headings: [{
      heading: String,
      content: String,
      bulletPoints: [String],
    }],
    definitions: [{
      term: String,
      definition: String,
    }],
    examples: [String],
    keyTakeaways: [String],
  },
  tags: [String],
  references: [{
    title: String,
    authorsVenue: String,
    snippet: String,
    citations: { type: Number, default: 0 },
    url: String,
    pdfUrl: String,
  }],
}, { timestamps: true });

generatedNoteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('GeneratedNote', generatedNoteSchema);
