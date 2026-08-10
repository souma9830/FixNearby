import express from 'express';
import {
  getWorkerSchedule,
  getWorkerScheduleById,
  setRecurringAvailability,
  blockTimeSlot,
  getBlockedSlots,
  removeBlockedSlot,
} from '../controllers/scheduleController.js';
import { protectWorker, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Customer-facing worker schedule lookup
router.get('/worker/:id', getWorkerScheduleById);

// Worker-protected management routes (requires worker/provider/admin role)
router.use(protectWorker, requireRole('provider', 'worker', 'admin'));
router.get('/', getWorkerSchedule);
router.post('/set-recurring', setRecurringAvailability);
router.post('/recurring', setRecurringAvailability);
router.post('/block', blockTimeSlot);
router.get('/blocked', getBlockedSlots);
router.delete('/block/:id', removeBlockedSlot);

export default router;
