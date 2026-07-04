import { Router } from 'express';
import { authenticateOptional } from '../middleware/auth.js';
import * as teamCtrl from '../controllers/teamController.js';

const router = Router();

router.post('/apply', authenticateOptional, teamCtrl.applyToTeam);

export default router;
