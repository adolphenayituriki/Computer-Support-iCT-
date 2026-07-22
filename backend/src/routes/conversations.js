import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as convCtrl from '../controllers/conversationController.js';

const router = Router();

router.get('/', authenticate, convCtrl.getMyConversation);
router.post('/', authenticate, convCtrl.createConversation);
router.post('/:id/messages', authenticate, convCtrl.addUserMessage);

export default router;
