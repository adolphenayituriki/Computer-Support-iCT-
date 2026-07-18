import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { createSessionInvite, getSessionInvites, updateSessionInviteStatus, deleteSessionInvite, resendSessionEmail, resendAllSessionEmails, sendCustomEmailToAll } from '../controllers/sessionInviteController.js';

const router = Router();

router.post('/', createSessionInvite);
router.get('/', authenticate, adminOnly, getSessionInvites);
router.put('/:id/status', authenticate, adminOnly, updateSessionInviteStatus);
router.post('/:id/resend-email', authenticate, adminOnly, resendSessionEmail);
router.post('/resend-all', authenticate, adminOnly, resendAllSessionEmails);
router.post('/send-custom-email', authenticate, adminOnly, sendCustomEmailToAll);
router.delete('/:id', authenticate, adminOnly, deleteSessionInvite);

export default router;
