import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as suggestionCtrl from '../controllers/suggestionController.js';

const router = Router();

router.post('/', authenticate, suggestionCtrl.createSuggestion);
router.get('/', authenticate, suggestionCtrl.getMySuggestions);
router.post('/:id/messages', authenticate, suggestionCtrl.addSuggestionMessage);

export default router;
