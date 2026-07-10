import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as courseCtrl from '../controllers/courseController.js';

const router = Router();

router.get('/', courseCtrl.getPublishedCourses);
router.get('/:id', courseCtrl.getCourse);
router.post('/:id/like', authenticate, courseCtrl.likeCourse);
router.post('/:id/comment', authenticate, courseCtrl.commentOnCourse);

export default router;
