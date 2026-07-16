import SessionInvite from '../models/SessionInvite.js';
import { sendSessionInviteConfirmation, sendSessionInviteAdminNotification, sendSessionStatusUpdate } from '../services/mailer.js';

export async function createSessionInvite(req, res) {
  try {
    const { name, email, phone, level, interests, suggestion, heardFrom } = req.body;
    if (!name || !email || !level) {
      return res.status(400).json({ error: 'Name, email, and level are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existing = await SessionInvite.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered. We\'ll be in touch!' });
    }

    const invite = await SessionInvite.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      level,
      interests: interests || [],
      suggestion: suggestion || '',
      heardFrom: heardFrom || '',
    });

    let emailSent = false;
    try {
      await sendSessionInviteConfirmation(email, name, level, suggestion || '');
      emailSent = true;
      invite.emailSent = true;
      await invite.save();
    } catch (emailErr) {
      console.error('Session invite email error:', emailErr.message);
    }

    try {
      await sendSessionInviteAdminNotification(invite);
    } catch {}

    res.status(201).json({
      message: 'Registration successful!',
      invite: { id: invite._id, name: invite.name, email: invite.email },
      emailSent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSessionInvites(req, res) {
  try {
    const invites = await SessionInvite.find({}).sort({ createdAt: -1 });
    const stats = {
      total: invites.length,
      new: invites.filter((i) => i.status === 'new').length,
      contacted: invites.filter((i) => i.status === 'contacted').length,
      confirmed: invites.filter((i) => i.status === 'confirmed').length,
    };
    res.json({ invites, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSessionInviteStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'confirmed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const invite = await SessionInvite.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!invite) return res.status(404).json({ error: 'Invite not found.' });

    if (status !== 'new') {
      try {
        await sendSessionStatusUpdate(invite.email, invite.name, status, invite.suggestion || '');
      } catch (emailErr) {
        console.error('Session status email error:', emailErr.message);
      }
    }

    res.json(invite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteSessionInvite(req, res) {
  try {
    await SessionInvite.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resendSessionEmail(req, res) {
  try {
    const invite = await SessionInvite.findById(req.params.id);
    if (!invite) return res.status(404).json({ error: 'Invite not found.' });

    if (invite.status === 'new') {
      await sendSessionInviteConfirmation(invite.email, invite.name, invite.level, invite.suggestion || '');
    } else {
      await sendSessionStatusUpdate(invite.email, invite.name, invite.status, invite.suggestion || '');
    }

    invite.emailSent = true;
    await invite.save();
    res.json({ success: true, message: 'Email sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
