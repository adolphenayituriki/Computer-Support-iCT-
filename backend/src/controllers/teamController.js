import TeamApp from '../models/TeamApp.js';
import { sendTeamApplicationReceived, sendAdminNotification } from '../services/mailer.js';

export async function applyToTeam(req, res) {
  try {
    const { name, email, phone, education, location, applicantType, involvement, skills, message } = req.body;
    if (!name || !email || !message || !location) {
      return res.status(400).json({ error: 'Name, email, location, and message are required.' });
    }
    await TeamApp.create({ name, email, phone: phone || '', education: education || '', location, applicantType: applicantType || 'student', involvement: involvement || 'member', skills: skills || [], message, userId: req.user?.id || null });

    sendTeamApplicationReceived(email, name).catch((e) => console.log('Email error:', e.message));
    sendAdminNotification(
      `New Team Application — ${name}`,
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nLocation: ${location}\nType: ${applicantType || 'student'}\nInvolvement: ${involvement || 'member'}\nSkills: ${(skills || []).join(', ') || '—'}\nMessage: ${message}`
    ).catch((e) => console.log('Admin email error:', e.message));

    console.log(`New team application from ${name} (${email}) — ${involvement}`);
    res.status(201).json({ success: true, message: `Thanks, ${name}! We'll review your application and get back to you.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
