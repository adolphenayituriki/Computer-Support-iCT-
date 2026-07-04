import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as newsCtrl from '../controllers/newsController.js';

const router = Router();

router.get('/', newsCtrl.getPublishedNews);
router.get('/:id', newsCtrl.getNewsItem);
router.post('/:id/like', authenticate, newsCtrl.likeNews);
router.post('/:id/comment', authenticate, newsCtrl.commentOnNews);

export default router;
