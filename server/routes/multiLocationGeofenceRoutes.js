import express from 'express';
import { addServiceZone, getWorkerZones } from '../controllers/multiLocationGeofenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add-zone', protect, addServiceZone);
router.get('/my-zones', protect, getWorkerZones);

export default router;