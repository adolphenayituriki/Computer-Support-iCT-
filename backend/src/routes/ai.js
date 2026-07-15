import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getProfile, updateProfile, tutorChat, generateQuiz, submitQuiz,
  getQuizHistory, getProgress, getSessions, getSession,
  processTopic, getTopicHistory, getTopicById,
  getNotifications, markNotificationsRead, deleteNotification,
  SUBJECTS
} from '../controllers/aiController.js';

const router = Router();

router.get('/subjects', (req, res) => res.json(SUBJECTS));

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

router.post('/tutor', authenticate, tutorChat);
router.get('/sessions', authenticate, getSessions);
router.get('/sessions/:id', authenticate, getSession);

router.post('/quizzes/generate', authenticate, generateQuiz);
router.post('/quizzes/submit', authenticate, submitQuiz);
router.get('/quizzes/history', authenticate, getQuizHistory);

router.get('/progress', authenticate, getProgress);

router.post('/topics/process', authenticate, processTopic);
router.get('/topics', authenticate, getTopicHistory);
router.get('/topics/:id', authenticate, getTopicById);

router.get('/notifications', authenticate, getNotifications);
router.post('/notifications/read', authenticate, markNotificationsRead);
router.delete('/notifications/:id', authenticate, deleteNotification);

export default router;
