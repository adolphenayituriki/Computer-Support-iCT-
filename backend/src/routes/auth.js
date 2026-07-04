import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';

const router = Router();

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', authenticate, authCtrl.getMe);
router.put('/profile', authenticate, authCtrl.updateProfile);
router.put('/password', authenticate, authCtrl.changePassword);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/resend-code', authCtrl.resendCode);
router.post('/reset-password', authCtrl.resetPassword);
router.get('/team-status', authenticate, authCtrl.getTeamStatus);

export default router;
