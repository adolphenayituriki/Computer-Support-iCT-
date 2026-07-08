import Suggestion from '../models/Suggestion.js';
import { sendAdminNotification } from '../services/mailer.js';

export async function createSuggestion(req, res) {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    await Suggestion.create({ userId: req.user.id, userName: req.user.name, title, description });
    sendAdminNotification('New Suggestion', `From: ${req.user.name} (${req.user.email})\nTitle: ${title}\n\n${description}`).catch(() => {});
    res.status(201).json({ success: true, message: 'Thanks for your suggestion! We review every idea.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getMySuggestions(req, res) {
  try {
    const userSuggestions = await Suggestion.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(userSuggestions);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addSuggestionMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const sug = await Suggestion.findOne({ _id: req.params.id, userId: req.user.id });
    if (!sug) return res.status(404).json({ error: 'Suggestion not found.' });
    sug.messages.push({ sender: 'user', senderName: req.user.name, text });
    await sug.save();
    res.status(201).json(sug);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
