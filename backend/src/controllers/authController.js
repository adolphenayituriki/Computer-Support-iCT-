import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendResetEmail, sendUserWelcome, sendAdminNotification } from '../services/mailer.js';
import TeamApp from '../models/TeamApp.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cshub_ict_secret_key_2026';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    sendUserWelcome(email, name).catch((e) => console.log('Email error:', e.message));
    sendAdminNotification('New User Registered', `Name: ${name}\nEmail: ${email}`).catch(() => {});
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: false, isTeamMember: false }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: false, isTeamMember: false } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password -resetToken -resetTokenExpires');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    const emailTaken = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (emailTaken) return res.status(409).json({ error: 'Email already in use.' });
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function changePassword(req, res) {
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
}

export async function forgotPassword(req, res) {
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
}

export async function resendCode(req, res) {
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
}

export async function resetPassword(req, res) {
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
}

export async function setupAccount(req, res) {
  try {
    const { email, name, password, token } = req.body;
    if (!email || !name || !password || !token) {
      return res.status(400).json({ error: 'Email, name, password, and token are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const user = await User.findOne({ email, setupToken: token, setupTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired setup link. Contact support.' });
    }
    user.name = name;
    user.password = await bcrypt.hash(password, 10);
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;
    await user.save();
    const jwtToken = jwt.sign({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isTeamMember: user.isTeamMember } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getTeamStatus(req, res) {
  try {
    const user = await User.findById(req.user.id);
    let app = await TeamApp.findOne({ userId: req.user.id, status: 'approved' });
    if (!app) {
      app = await TeamApp.findOne({ email: req.user.email, status: 'approved' });
      if (app && user) {
        await TeamApp.findByIdAndUpdate(app._id, { userId: user._id });
      }
    }
    const allApps = await TeamApp.find({ $or: [{ userId: req.user.id }, { email: req.user.email }] }).sort({ createdAt: -1 });
    const latestApp = allApps.length > 0 ? allApps[0] : null;
    const Beneficiary = (await import('../models/Beneficiary.js')).default;
    const beneficiaries = app ? await Beneficiary.find({ assignedTo: app._id }).sort({ createdAt: -1 }) : [];
    const isTeamMember = !!app || user?.isTeamMember || false;
    res.json({ isTeamMember, application: latestApp, beneficiaries });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
