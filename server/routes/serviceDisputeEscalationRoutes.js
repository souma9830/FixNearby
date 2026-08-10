import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createDisputeEscalation,
  getDisputeEscalations,
  updateDisputeStatus,
} from '../controllers/serviceDisputeEscalationController.js';

const router = express.Router();

router.post('/escalate', protect, createDisputeEscalation);
router.get('/', protect, getDisputeEscalations);
router.patch('/:disputeId/status', protect, updateDisputeStatus);

export default router;

