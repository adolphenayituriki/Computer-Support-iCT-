import { Router } from 'express';
import authRoutes from './auth.js';
import ticketRoutes from './tickets.js';
import contactRoutes from './contact.js';
import suggestionRoutes from './suggestions.js';
import teamRoutes from './team.js';
import newsRoutes from './news.js';
import conversationRoutes from './conversations.js';
import groupChatRoutes from './groupChat.js';
import courseRoutes from './courses.js';
import beneficiaryRoutes from './beneficiaries.js';
import testimonialRoutes from './testimonials.js';
import sessionInviteRoutes from './sessionInvites.js';
import liveSessionRoutes from './liveSessions.js';
import enrollmentRoutes from './enrollments.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/contact', contactRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/team', teamRoutes);
router.use('/news', newsRoutes);
router.use('/conversations', conversationRoutes);
router.use('/group-chat', groupChatRoutes);
router.use('/courses', courseRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/session-invites', sessionInviteRoutes);
router.use('/live-sessions', liveSessionRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/admin', adminRoutes);

export default router;
