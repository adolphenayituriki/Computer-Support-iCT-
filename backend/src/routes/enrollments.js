import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  enrollInCourse, unenrollFromCourse, getMyEnrollments,
  getCourseProgress, markSectionComplete, syncLessonProgress, getMyCourseProgress, verifyCertificate,
} from '../controllers/enrollmentController.js';

const router = Router();

router.get('/verify/:code', verifyCertificate);
router.get('/my', authenticate, getMyEnrollments);
router.get('/my-progress', authenticate, getMyCourseProgress);
router.post('/:courseId/enroll', authenticate, enrollInCourse);
router.delete('/:courseId/unenroll', authenticate, unenrollFromCourse);
router.get('/:courseId/progress', authenticate, getCourseProgress);
router.post('/:courseId/complete', authenticate, markSectionComplete);
router.post('/:courseId/lesson-progress', authenticate, syncLessonProgress);

export default router;
