import News from '../models/News.js';

export async function getPublishedNews(_req, res) {
  try {
    const all = await News.find({ published: true }).sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getNewsItem(req, res) {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'News not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function likeNews(req, res) {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'News not found.' });
    const userId = req.user.id;
    const idx = item.likes.findIndex((id) => id.toString() === userId);
    if (idx === -1) {
      item.likes.push(userId);
    } else {
      item.likes.splice(idx, 1);
    }
    await item.save();
    res.json({ likes: item.likes, likesCount: item.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function commentOnNews(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text is required.' });
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'News not found.' });
    item.comments.push({ userId: req.user.id, userName: req.user.name, text: text.trim() });
    await item.save();
    res.status(201).json({ comments: item.comments });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
