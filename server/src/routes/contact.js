import { Router } from 'express';
import * as contactCtrl from '../controllers/contactController.js';

const router = Router();

router.post('/', contactCtrl.submitContact);
router.get('/', contactCtrl.getAllContacts);

export default router;
