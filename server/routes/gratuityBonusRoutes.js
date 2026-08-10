import express from 'express';
import * as gratuityController from '../controllers/gratuityBonusController.js';
import { validateGratuityPayload } from '../middleware/gratuityBonusValidation.js';

const router = express.Router();

router.post('/tip', validateGratuityPayload, gratuityController.submitTip);
router.get('/worker-summary/:workerId', gratuityController.getWorkerGratuityEarnings);
router.get('/:gratuityId', gratuityController.getGratuityById);

export default router;
