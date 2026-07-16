import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { createSessionInvite, getSessionInvites, updateSessionInviteStatus, deleteSessionInvite } from '../controllers/sessionInviteController.js';

const router = Router();

router.post('/', createSessionInvite);
router.get('/', authenticate, adminOnly, getSessionInvites);
router.put('/:id/status', authenticate, adminOnly, updateSessionInviteStatus);
router.delete('/:id', authenticate, adminOnly, deleteSessionInvite);

export default router;
