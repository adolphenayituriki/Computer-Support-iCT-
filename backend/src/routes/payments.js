import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { initiatePayment, verifyPayment, checkPaymentStatus, handleWebhook } from '../controllers/paymentController.js';

const router = Router();

router.post('/initiate', authenticate, initiatePayment);
router.get('/verify/:txRef', authenticate, verifyPayment);
router.get('/status/:courseId', authenticate, checkPaymentStatus);
router.post('/webhook', handleWebhook);

export default router;
