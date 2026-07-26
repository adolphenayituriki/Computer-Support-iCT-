import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { initiatePayment, verifyPayment, checkPaymentStatus, getMomoNumber, getMyPayments } from '../controllers/paymentController.js';

const router = Router();

router.post('/initiate', authenticate, initiatePayment);
router.get('/verify/:txRef', authenticate, verifyPayment);
router.get('/status/:courseId', authenticate, checkPaymentStatus);
router.get('/momo-number', getMomoNumber);
router.get('/my-payments', authenticate, getMyPayments);

export default router;
