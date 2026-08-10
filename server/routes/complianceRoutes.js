import express from 'express';
import * as complianceController from '../controllers/complianceController.js';
import { validateCompliancePayload } from '../middleware/complianceValidationMiddleware.js';

const router = express.Router();

router.post('/insurance', validateCompliancePayload, complianceController.submitInsurance);
router.patch('/background-check', complianceController.updateBackgroundCheck);
router.get('/worker/:workerId', complianceController.getComplianceRecord);

export default router;
