import express from 'express';
import { createEmergencyDispatch, acceptEmergencyDispatch, escalateEmergencyBroadcast } from '../controllers/emergencyPriorityDispatchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createEmergencyDispatch);
router.post('/accept/:ticketId', protect, acceptEmergencyDispatch);
router.post('/escalate/:ticketId', protect, escalateEmergencyBroadcast);

export default router;
