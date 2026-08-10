import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getWorkerSlaStatus, logSlaViolation } from '../controllers/workerSlaComplianceController.js';

const router = express.Router();

router.get('/:workerId', protect, getWorkerSlaStatus);
router.post('/:workerId/violation', protect, logSlaViolation);

export default router;
