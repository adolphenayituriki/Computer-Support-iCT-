import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSession, getSessions, getUpcomingSessions, getSession,
  updateSession, deleteSession, startSession, endSession,
  joinSession, leaveSession, getParticipants,
} from '../controllers/liveSessionController.js';

const router = Router();

router.get('/', authenticate, getUpcomingSessions);
router.get('/:id', authenticate, getSession);
router.post('/:id/join', authenticate, joinSession);
router.post('/:id/leave', authenticate, leaveSession);
router.get('/:id/participants', authenticate, getParticipants);

export default router;
