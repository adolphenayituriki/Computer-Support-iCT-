import Ticket from '../models/Ticket.js';

export async function createTicket(req, res) {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    const ticket = await Ticket.create({ userId: req.user.id, userName: req.user.name, title, description, category: category || 'general' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getMyTickets(req, res) {
  try {
    const userTickets = await Ticket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(userTickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateTicket(req, res) {
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
}

export async function deleteTicket(req, res) {
  try {
    const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function addTicketMessage(req, res) {
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
}
