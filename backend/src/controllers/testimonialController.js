import Testimonial from '../models/Testimonial.js';
import { sendAdminNotification } from '../services/mailer.js';

export async function getApprovedTestimonials(_req, res) {
  try {
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createTestimonial(req, res) {
  try {
    const { name, role, content, avatar, rating } = req.body;
    if (!name || !content) return res.status(400).json({ error: 'Name and content are required.' });
    const testimonial = await Testimonial.create({ name, role, content, avatar, rating, approved: false });
    sendAdminNotification('New Testimonial', `From: ${name}${role ? ` (${role})` : ''}\nRating: ${rating || 'N/A'}\n\n${content}`).catch(() => {});
    res.status(201).json({ message: 'Testimonial submitted and awaiting approval.', id: testimonial._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getAllTestimonials(_req, res) {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function approveTestimonial(req, res) {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteTestimonial(req, res) {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json({ message: 'Testimonial deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
