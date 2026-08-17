import express from 'express';
import { protectWorker } from '../middleware/authMiddleware.js';
import { workerCheckIn, workerCheckOut, getBookingTelemetry } from '../controllers/telemetryController.js';

const router = express.Router();

router.post('/check-in', protectWorker, workerCheckIn);
router.post('/check-out', protectWorker, workerCheckOut);
router.get('/:bookingId', protectWorker, getBookingTelemetry);

export default router;
