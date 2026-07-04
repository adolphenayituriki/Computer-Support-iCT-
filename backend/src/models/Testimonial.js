import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  content: { type: String, required: true },
  avatar: { type: String, default: '' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
