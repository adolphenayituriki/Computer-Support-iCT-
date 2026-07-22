import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as groupCtrl from '../controllers/groupChatController.js';

const router = Router();

router.get('/', authenticate, groupCtrl.getGroupChat);
router.post('/messages', authenticate, groupCtrl.addGroupMessage);

export default router;
