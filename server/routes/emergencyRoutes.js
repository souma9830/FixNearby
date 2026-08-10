import express from 'express';
import {
  broadcastEmergencyAlert,
  getActiveEmergencyAlerts,
  acceptEmergencyDispatch
} from '../controllers/emergencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/broadcast', protect, broadcastEmergencyAlert);
router.get('/active', protect, getActiveEmergencyAlerts);
router.post('/accept/:alertId', protect, acceptEmergencyDispatch);

export default router;
