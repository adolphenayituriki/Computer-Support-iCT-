import Contact from '../models/Contact.js';

export async function submitContact(req, res) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });
    await Contact.create({ name, email, message });
    console.log(`New contact from ${name} (${email}): ${message.slice(0, 50)}...`);
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
