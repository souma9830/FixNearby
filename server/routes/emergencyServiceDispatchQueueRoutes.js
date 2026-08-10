import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  dispatchEmergencyTicket,
  getActiveEmergencyDispatches,
  updateDispatchStatus,
} from '../controllers/emergencyServiceDispatchQueueController.js';

const router = express.Router();

router.post('/dispatch', protect, dispatchEmergencyTicket);
router.get('/active', protect, getActiveEmergencyDispatches);
router.patch('/:ticketId/status', protect, updateDispatchStatus);

export default router;
