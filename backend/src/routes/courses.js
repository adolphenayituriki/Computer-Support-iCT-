import { Router } from 'express';
import * as courseCtrl from '../controllers/courseController.js';

const router = Router();

router.get('/', courseCtrl.getPublishedCourses);
router.get('/:id', courseCtrl.getCourse);

export default router;
