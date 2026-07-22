import GroupChat from '../models/GroupChat.js';

export async function getGroupChat(req, res) {
  try {
    let chat = await GroupChat.findOne({ name: 'CS Hub Community' });
    if (!chat) {
      chat = new GroupChat({ name: 'CS Hub Community', messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addGroupMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    let chat = await GroupChat.findOne({ name: 'CS Hub Community' });
    if (!chat) {
      chat = new GroupChat({ name: 'CS Hub Community', messages: [] });
    }
    chat.messages.push({ sender: req.user.id, senderName: req.user.name, text });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
