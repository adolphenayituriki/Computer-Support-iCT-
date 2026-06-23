import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Contact from './models/Contact.js';
import Suggestion from './models/Suggestion.js';
import TeamApp from './models/TeamApp.js';
import Conversation from './models/Conversation.js';
import { sendResetEmail } from './mailer.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'cshub_ict_secret_key_2026';
const MONGO_URI = process.env.MONGO_URI_CLOUD || process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// ── Serve built frontend ──
app.use(express.static('public'));

// ── API Documentation (Swagger) ──
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info .title { color: #FFCE08 } .swagger-ui .info { margin: 20px 0 }', customSiteTitle: 'CS hub (iCT) API Docs' }));

// ── MongoDB connection ──
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed data
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashed = await bcrypt.hash('password123', 10);
      const adminHashed = await bcrypt.hash('admin123', 10);
      const student = await User.create({ name: 'John Doe', email: 'student@test.com', password: hashed, isAdmin: false });
      await User.create({ name: 'Admin', email: 'admin@cshub.rw', password: adminHashed, isAdmin: true });
      await Ticket.create([
        { userId: student._id, userName: 'John Doe', title: 'Laptop running very slow', description: 'My laptop takes ages to boot and apps keep freezing. Need help cleaning it up.', category: 'hardware', status: 'open' },
        { userId: student._id, userName: 'John Doe', title: 'Need Microsoft Office installed', description: 'I have a school project due next week and need Word and Excel installed.', category: 'software', status: 'open' },
      ]);
      console.log('Test user: student@test.com / password123');
      console.log('Admin user: admin@cshub.rw / admin123');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
})();

// ── Auth middleware ──
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// ── Auth routes ──
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: false } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    const emailTaken = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (emailTaken) return res.status(409).json({ error: 'Email already in use.' });
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/auth/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current password and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with that email.' });
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    try {
      await sendResetEmail(email, token);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }
    res.json({ success: true, message: 'A reset code has been sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with that email.' });
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    try {
      await sendResetEmail(email, token);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }
    res.json({ success: true, message: 'A new reset code has been sent to your email.' });
  } catch (err) {
    console.error('Resend code error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'Email, token, and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    const user = await User.findOne({ email, resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) return res.status(401).json({ error: 'Invalid or expired reset token.' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Support tickets ──
app.post('/api/tickets', authenticate, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    const ticket = await Ticket.create({ userId: req.user.id, userName: req.user.name, title, description, category: category || 'general' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/tickets', authenticate, async (req, res) => {
  try {
    const userTickets = await Ticket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(userTickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/api/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/tickets/:id/messages', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    ticket.messages.push({ sender: 'user', senderName: req.user.name, text });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Contact (public) ──
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });
    await Contact.create({ name, email, message });
    console.log(`New contact from ${name} (${email}): ${message.slice(0, 50)}...`);
    res.status(201).json({ success: true, message: `Thanks, ${name}! We'll get back to you at ${email} shortly.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/contacts', async (_req, res) => {
  try {
    const entries = await Contact.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Suggestions ──
app.post('/api/suggestions', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    await Suggestion.create({ userId: req.user.id, userName: req.user.name, title, description });
    console.log(`New suggestion from ${req.user.name}: ${title}`);
    res.status(201).json({ success: true, message: 'Thanks for your suggestion! We review every idea.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/suggestions', authenticate, async (req, res) => {
  try {
    const userSuggestions = await Suggestion.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(userSuggestions);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/suggestions/:id/messages', authenticate, async (req, res) => {
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
});

// ── Team applications ──
app.post('/api/team/apply', async (req, res) => {
  try {
    const { name, email, phone, education, location, involvement, skills, message } = req.body;
    if (!name || !email || !message || !education || !location) {
      return res.status(400).json({ error: 'Name, email, education, location, and message are required.' });
    }
    await TeamApp.create({ name, email, phone: phone || '', education, location, involvement: involvement || 'member', skills: skills || [], message });
    console.log(`New team application from ${name} (${email}) — ${involvement}`);
    res.status(201).json({ success: true, message: `Thanks, ${name}! We'll review your application and get back to you.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Admin routes ──
app.get('/api/admin/users', authenticate, adminOnly, async (_req, res) => {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/users', authenticate, adminOnly, async (req, res) => {
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
});

app.put('/api/admin/users/:id', authenticate, adminOnly, async (req, res) => {
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
});

app.delete('/api/admin/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Ticket.deleteMany({ userId: req.params.id });
    await Suggestion.deleteMany({ userId: req.params.id });
    await Conversation.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/admin/tickets', authenticate, adminOnly, async (_req, res) => {
  try {
    const all = await Ticket.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/tickets/:id/messages', authenticate, adminOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    ticket.messages.push({ sender: 'admin', senderName: req.user.name, text });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/tickets', authenticate, adminOnly, async (req, res) => {
  try {
    const { userId, title, description, category, status } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    const user = userId ? await User.findById(userId) : null;
    const ticket = await Ticket.create({ userId: user?._id || req.user.id, userName: user?.name || req.user.name, title, description, category: category || 'general', status: status || 'open' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/admin/tickets/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/api/admin/tickets/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/admin/suggestions', authenticate, adminOnly, async (_req, res) => {
  try {
    const all = await Suggestion.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/suggestions/:id/messages', authenticate, adminOnly, async (req, res) => {
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
});

app.put('/api/admin/suggestions/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const sug = await Suggestion.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!sug) return res.status(404).json({ error: 'Suggestion not found.' });
    res.json(sug);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/api/admin/suggestions/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await Suggestion.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/admin/contacts', authenticate, adminOnly, async (_req, res) => {
  try {
    const all = await Contact.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/admin/contacts/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/api/admin/contacts/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/admin/team-apps', authenticate, adminOnly, async (_req, res) => {
  try {
    const all = await TeamApp.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/admin/team-apps/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const app = await TeamApp.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Conversation (direct admin-user chat) ──
app.get('/api/conversations', authenticate, async (req, res) => {
  try {
    const conv = await Conversation.findOne({ userId: req.user.id }).sort({ lastActivity: -1 });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
    conv.messages.push({ sender: 'user', senderName: req.user.name, text });
    await conv.save();
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/admin/conversations', authenticate, adminOnly, async (_req, res) => {
  try {
    const convs = await Conversation.find().sort({ lastActivity: -1 });
    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/conversations', authenticate, adminOnly, async (req, res) => {
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
});

app.post('/api/admin/conversations/:id/messages', authenticate, adminOnly, async (req, res) => {
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
});

app.delete('/api/admin/conversations/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── SPA catch-all — serve frontend for any non-API route ──
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.delete('/api/admin/team-apps/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await TeamApp.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallback = PORT + 1;
    console.log(`Port ${PORT} is in use. Trying ${fallback}...`);
    app.listen(fallback, () => {
      console.log(`Server running on http://localhost:${fallback}`);
    });
  } else {
    console.error('Server error:', err.message);
  }
});
