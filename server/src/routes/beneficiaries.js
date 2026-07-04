import { Router } from 'express';
import * as beneficiaryCtrl from '../controllers/beneficiaryController.js';

const router = Router();

router.get('/', beneficiaryCtrl.getAllBeneficiaries);
router.post('/', beneficiaryCtrl.submitBeneficiary);

export default router;
