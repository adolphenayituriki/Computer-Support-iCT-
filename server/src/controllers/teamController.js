import TeamApp from '../models/TeamApp.js';

export async function applyToTeam(req, res) {
  try {
    const { name, email, phone, education, location, applicantType, involvement, skills, message } = req.body;
    if (!name || !email || !message || !location) {
      return res.status(400).json({ error: 'Name, email, location, and message are required.' });
    }
    await TeamApp.create({ name, email, phone: phone || '', education: education || '', location, applicantType: applicantType || 'student', involvement: involvement || 'member', skills: skills || [], message, userId: req.user?.id || null });
    console.log(`New team application from ${name} (${email}) — ${involvement}`);
    res.status(201).json({ success: true, message: `Thanks, ${name}! We'll review your application and get back to you.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
