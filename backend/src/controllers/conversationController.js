import Conversation from '../models/Conversation.js';
import { sendAdminNotification } from '../services/mailer.js';

export async function getMyConversation(req, res) {
  try {
    const conv = await Conversation.findOne({ userId: req.user.id }).sort({ lastActivity: -1 });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createConversation(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const existing = await Conversation.findOne({ userId: req.user.id }).sort({ lastActivity: -1 });
    if (existing) {
      existing.messages.push({ sender: 'user', senderName: req.user.name, text });
      await existing.save();
      sendAdminNotification('New User Message', `From: ${req.user.name} (${req.user.email})\n\n${text}`).catch(() => {});
      return res.status(201).json(existing);
    }
    const conv = new Conversation({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      messages: [{ sender: 'user', senderName: req.user.name, text }],
    });
    await conv.save();
    sendAdminNotification('New Conversation', `From: ${req.user.name} (${req.user.email})\n\n${text}`).catch(() => {});
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addUserMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
    conv.messages.push({ sender: 'user', senderName: req.user.name, text });
    await conv.save();
    sendAdminNotification('New User Message', `From: ${req.user.name} (${req.user.email})\n\n${text}`).catch(() => {});
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
