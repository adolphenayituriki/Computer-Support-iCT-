import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  getProfile, updateProfile, tutorChat, generateQuiz, submitQuiz,
  getQuizHistory, getQuizById, getProgress, getSessions, getSession,
  processTopic, getTopicHistory, getTopicById,
  getNotifications, markNotificationsRead, deleteNotification,
  uploadResource, addLinkResource, getResources, getResourceById, deleteResource,
  generateQuizFromResource, generateFlashcardsFromResource, generateSummaryFromResource,
  chatAboutResource,
  SUBJECTS
} from '../controllers/aiController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/subjects', (req, res) => res.json(SUBJECTS));

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

router.post('/tutor', authenticate, tutorChat);
router.get('/sessions', authenticate, getSessions);
router.get('/sessions/:id', authenticate, getSession);

router.post('/quizzes/generate', authenticate, generateQuiz);
router.post('/quizzes/submit', authenticate, submitQuiz);
router.get('/quizzes/history', authenticate, getQuizHistory);
router.get('/quizzes/:id', authenticate, getQuizById);

router.get('/progress', authenticate, getProgress);

router.post('/topics/process', authenticate, processTopic);
router.get('/topics', authenticate, getTopicHistory);
router.get('/topics/:id', authenticate, getTopicById);

router.get('/notifications', authenticate, getNotifications);
router.post('/notifications/read', authenticate, markNotificationsRead);
router.delete('/notifications/:id', authenticate, deleteNotification);

router.post('/resources/upload', authenticate, upload.single('file'), uploadResource);
router.post('/resources/link', authenticate, addLinkResource);
router.get('/resources', authenticate, getResources);
router.get('/resources/:id', authenticate, getResourceById);
router.delete('/resources/:id', authenticate, deleteResource);
router.post('/resources/:id/quiz', authenticate, generateQuizFromResource);
router.post('/resources/:id/flashcards', authenticate, generateFlashcardsFromResource);
router.post('/resources/:id/summary', authenticate, generateSummaryFromResource);
router.post('/resources/:id/chat', authenticate, chatAboutResource);

export default router;
