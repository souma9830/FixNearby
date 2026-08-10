import express from 'express';
import * as warrantyController from '../controllers/warrantyClaimController.js';
import { validateWarrantyClaimPayload } from '../middleware/warrantyValidationMiddleware.js';

const router = express.Router();

router.post('/file', validateWarrantyClaimPayload, warrantyController.submitClaim);
router.patch('/:claimId/resolve', warrantyController.resolveClaim);
router.get('/customer/:customerId', warrantyController.getCustomerClaims);
router.get('/:claimId', warrantyController.getClaimById);

export default router;
