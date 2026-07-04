import Contact from '../models/Contact.js';
import { sendContactAutoReply, sendAdminNotification } from '../services/mailer.js';

export async function submitContact(req, res) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });
    await Contact.create({ name, email, message });
    sendContactAutoReply(email, name).catch((e) => console.log('Email error:', e.message));
    sendAdminNotification('New Contact Message', `From: ${name} (${email})\n\n${message}`).catch(() => {});
    res.status(201).json({ success: true, message: `Thanks, ${name}! We'll get back to you at ${email} shortly.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getAllContacts(_req, res) {
  try {
    const entries = await Contact.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
