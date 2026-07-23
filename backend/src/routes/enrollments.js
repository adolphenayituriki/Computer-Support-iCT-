import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  enrollInCourse, unenrollFromCourse, getMyEnrollments,
  getCourseProgress, markSectionComplete, getMyCourseProgress,
} from '../controllers/enrollmentController.js';

const router = Router();

router.get('/my', authenticate, getMyEnrollments);
router.get('/my-progress', authenticate, getMyCourseProgress);
router.post('/:courseId/enroll', authenticate, enrollInCourse);
router.delete('/:courseId/unenroll', authenticate, unenrollFromCourse);
router.get('/:courseId/progress', authenticate, getCourseProgress);
router.post('/:courseId/complete', authenticate, markSectionComplete);

export default router;
