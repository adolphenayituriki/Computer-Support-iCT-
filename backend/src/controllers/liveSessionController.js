import LiveSession from '../models/LiveSession.js';

function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'cshub-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function createSession(req, res) {
  try {
    const { title, description, course, scheduledAt, duration, settings } = req.body;
    if (!title || !scheduledAt) return res.status(400).json({ error: 'Title and scheduled time required.' });
    const session = await LiveSession.create({
      title, description, course, host: req.user.id, hostName: req.user.name,
      jitsiRoomId: generateRoomId(), scheduledAt, duration: duration || 60,
      settings: { ...settings },
    });
    res.status(201).json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getSessions(req, res) {
  try {
    const sessions = await LiveSession.find().sort({ scheduledAt: -1 }).populate('host', 'name email').populate('course', 'title');
    res.json(sessions);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getUpcomingSessions(req, res) {
  try {
    const sessions = await LiveSession.find({ status: { $in: ['scheduled', 'live'] } })
      .sort({ scheduledAt: 1 }).populate('host', 'name').populate('course', 'title');
    res.json(sessions);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getSession(req, res) {
  try {
    const session = await LiveSession.findById(req.params.id).populate('host', 'name email').populate('course', 'title');
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function updateSession(req, res) {
  try {
    const session = await LiveSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function deleteSession(req, res) {
  try {
    const session = await LiveSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ message: 'Session deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function startSession(req, res) {
  try {
    const session = await LiveSession.findByIdAndUpdate(req.params.id, { status: 'live' }, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function endSession(req, res) {
  try {
    const session = await LiveSession.findByIdAndUpdate(req.params.id, { status: 'ended' }, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function joinSession(req, res) {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.status !== 'live' && session.status !== 'scheduled') return res.status(400).json({ error: 'Session is not active.' });
    const existing = session.participants.find((p) => p.userId?.toString() === req.user.id && !p.leftAt);
    if (existing) return res.json(session);
    if (session.participants.length >= (session.settings?.maxParticipants || 100)) return res.status(400).json({ error: 'Session is full.' });
    session.participants.push({ userId: req.user.id, name: req.user.name, joinedAt: new Date() });
    await session.save();
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function leaveSession(req, res) {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    const participant = session.participants.find((p) => p.userId?.toString() === req.user.id && !p.leftAt);
    if (participant) { participant.leftAt = new Date(); await session.save(); }
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getParticipants(req, res) {
  try {
    const session = await LiveSession.findById(req.params.id).select('participants status');
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    const active = session.participants.filter((p) => !p.leftAt);
    res.json({ participants: active, total: session.participants.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
