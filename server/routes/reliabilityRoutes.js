import express from 'express';
import * as reliabilityController from '../controllers/reliabilityController.js';
import { validateCancellationReason } from '../middleware/reliabilityValidationMiddleware.js';

const router = express.Router();

router.get('/worker/:workerId', reliabilityController.getReliabilityScore);
router.post('/penalty', validateCancellationReason, reliabilityController.handleCancellationPenalty);
router.post('/completion-bonus', reliabilityController.handleJobCompletionBonus);

export default router;
