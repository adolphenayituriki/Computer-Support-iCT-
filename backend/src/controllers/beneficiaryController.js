import Beneficiary from '../models/Beneficiary.js';
import { sendAdminNotification } from '../services/mailer.js';

export async function submitBeneficiary(req, res) {
  try {
    const { name, email, phone, location, issue } = req.body;
    if (!name || !issue) return res.status(400).json({ error: 'Name and issue description are required.' });
    const item = await Beneficiary.create({ name, email: email || '', phone: phone || '', location: location || '', issue });
    sendAdminNotification('New Beneficiary Request', `Name: ${name}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\nLocation: ${location || 'N/A'}\nIssue: ${issue}`).catch(() => {});
    res.status(201).json({ success: true, message: 'Your request has been submitted. We will assign someone to help you.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getAllBeneficiaries(_req, res) {
  try {
    const all = await Beneficiary.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateBeneficiary(req, res) {
  try {
    const item = await Beneficiary.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) return res.status(404).json({ error: 'Beneficiary not found.' });
    if (req.body.status) {
      sendAdminNotification('Beneficiary Status Updated', `Name: ${item.name}\nID: ${item._id}\nNew Status: ${req.body.status}`).catch(() => {});
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function deleteBeneficiary(req, res) {
  try {
    await Beneficiary.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
