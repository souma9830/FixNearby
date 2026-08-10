import express from 'express';
import {
  getWorkerAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  checkSlotAvailability
} from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability/:workerId', getWorkerAvailability);
router.get('/check', checkSlotAvailability);
router.post('/availability/slot', protect, addAvailabilitySlot);
router.delete('/availability/slot/:slotId', protect, removeAvailabilitySlot);
router.put('/settings', protect, (await import('../controllers/calendarController.js')).updateCalendarSettings);

export default router;
