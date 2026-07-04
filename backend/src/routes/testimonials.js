import { Router } from 'express';
import * as testimonialCtrl from '../controllers/testimonialController.js';

const router = Router();

router.get('/', testimonialCtrl.getApprovedTestimonials);
router.post('/', testimonialCtrl.createTestimonial);

export default router;
