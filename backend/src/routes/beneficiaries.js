import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as beneficiaryCtrl from '../controllers/beneficiaryController.js';

const router = Router();

router.get('/', beneficiaryCtrl.getAllBeneficiaries);
router.post('/', beneficiaryCtrl.submitBeneficiary);
router.put('/:id', authenticate, beneficiaryCtrl.updateBeneficiary);

export default router;
