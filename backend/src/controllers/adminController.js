import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Suggestion from '../models/Suggestion.js';
import Contact from '../models/Contact.js';
import TeamApp from '../models/TeamApp.js';
import News from '../models/News.js';
import Conversation from '../models/Conversation.js';
import Course from '../models/Course.js';
import { sendTicketReplyNotification, sendTeamStatusUpdate, sendAdminNotification } from '../services/mailer.js';
// ── Users ──

export async function getUsers(_req, res) {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, isAdmin } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, isAdmin: isAdmin || false });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { name, email, isAdmin } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    const emailTaken = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (emailTaken) return res.status(409).json({ error: 'Email already in use.' });
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, isAdmin: isAdmin ?? undefined }, { new: true }).select('-password -resetToken -resetTokenExpires');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteUser(req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Ticket.deleteMany({ userId: req.params.id });
    await Suggestion.deleteMany({ userId: req.params.id });
    await Conversation.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── Tickets ──

export async function getAllTickets(_req, res) {
  try {
    const all = await Ticket.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addTicketMessageAdmin(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    ticket.messages.push({ sender: 'admin', senderName: req.user.name, text });
    await ticket.save();
    const user = await User.findById(ticket.userId);
    if (user) sendTicketReplyNotification(user.email, user.name, ticket, text).catch((e) => console.log('Email error:', e.message));
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createTicketAdmin(req, res) {
  try {
    const { userId, title, description, category, status } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    const user = userId ? await User.findById(userId) : null;
    const ticket = await Ticket.create({ userId: user?._id || req.user.id, userName: user?.name || req.user.name, title, description, category: category || 'general', status: status || 'open' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateTicketAdmin(req, res) {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteTicketAdmin(req, res) {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── Suggestions ──

export async function getAllSuggestions(_req, res) {
  try {
    const all = await Suggestion.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addSuggestionMessageAdmin(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const sug = await Suggestion.findById(req.params.id);
    if (!sug) return res.status(404).json({ error: 'Suggestion not found.' });
    sug.messages.push({ sender: 'admin', senderName: req.user.name, text });
    await sug.save();
    res.status(201).json(sug);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateSuggestionAdmin(req, res) {
  try {
    const sug = await Suggestion.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!sug) return res.status(404).json({ error: 'Suggestion not found.' });
    res.json(sug);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteSuggestionAdmin(req, res) {
  try {
    await Suggestion.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── Contacts ──

export async function getAllContactsAdmin(_req, res) {
  try {
    const all = await Contact.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateContactAdmin(req, res) {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteContactAdmin(req, res) {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── Team Applications ──

export async function getAllTeamApps(_req, res) {
  try {
    const all = await TeamApp.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateTeamAppAdmin(req, res) {
  try {
    const prev = await TeamApp.findById(req.params.id);
    const app = await TeamApp.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    if (req.body.status && req.body.status !== prev.status) {
      sendTeamStatusUpdate(app.email, app.name, app.status, app).catch((e) => console.log('Email error:', e.message));
      sendAdminNotification(
        `Team Application ${app.status}`,
        `${app.name} (${app.email}) — ${app.status}\n\n${app.message || ''}`
      ).catch((e) => console.log('Admin email error:', e.message));
      if (app.status === 'approved') {
        const user = await User.findOne({ email: app.email });
        if (user) {
          await User.findByIdAndUpdate(user._id, { isTeamMember: true });
          await TeamApp.findByIdAndUpdate(app._id, { userId: user._id });
        }
      } else if (prev.status === 'approved') {
        await User.findOneAndUpdate({ email: app.email }, { isTeamMember: false });
      }
    }
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteTeamAppAdmin(req, res) {
  try {
    await TeamApp.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getOrCreateTeamAppConversation(req, res) {
  try {
    const app = await TeamApp.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    let user = app.userId ? await User.findById(app.userId) : null;
    if (!user) {
      user = await User.findOne({ email: app.email });
    }
    if (!user) {
      const genPwd = Math.random().toString(36).slice(2, 10) + 'A1!';
      const hashed = await bcrypt.hash(genPwd, 10);
      user = await User.create({ name: app.name, email: app.email, password: hashed, isAdmin: false });
    }
    app.userId = user._id;
    await app.save();
    let conv = await Conversation.findOne({ userId: user._id });
    if (!conv) {
      conv = await Conversation.create({ userId: user._id, userName: user.name, userEmail: user.email });
    }
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── News (Admin) ──

export async function getAllNewsAdmin(_req, res) {
  try {
    const all = await News.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createNewsAdmin(req, res) {
  try {
    const { title, content, mediaType, mediaUrl, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const item = await News.create({
      title,
      content: content || '',
      mediaType: mediaType || 'text',
      mediaUrl: mediaUrl || '',
      author: req.user.name,
      published: published !== undefined ? published : true,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateNewsAdmin(req, res) {
  try {
    const item = await News.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) return res.status(404).json({ error: 'News not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteNewsAdmin(req, res) {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── Conversations (Admin) ──

export async function getAllConversationsAdmin(_req, res) {
  try {
    const convs = await Conversation.find().sort({ lastActivity: -1 });
    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createConversationAdmin(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });
    const existing = await Conversation.findOne({ userId });
    if (existing) return res.json(existing);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const conv = await Conversation.create({ userId: user._id, userName: user.name, userEmail: user.email });
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addConversationMessageAdmin(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
    conv.messages.push({ sender: 'admin', senderName: req.user.name, text });
    await conv.save();
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteConversationAdmin(req, res) {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

// ── Courses (Admin) ──

export async function getAllCoursesAdmin(_req, res) {
  try {
    const all = await Course.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function createCourseAdmin(req, res) {
  try {
    const { title, description, content, category, difficulty, estimatedTime, published, tags } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    const course = await Course.create({
      title, description,
      content: content || '',
      category: category || 'general',
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || '',
      author: req.user.name,
      published: published !== undefined ? published : true,
      tags: tags || [],
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateCourseAdmin(req, res) {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteCourseAdmin(req, res) {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}


