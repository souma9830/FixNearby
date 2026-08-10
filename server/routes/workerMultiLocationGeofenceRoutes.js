import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWorkerGeofences,
  addServiceZone,
  updateGeofenceSettings,
} from '../controllers/workerMultiLocationGeofenceController.js';

const router = express.Router();

router.get('/:workerId', protect, getWorkerGeofences);
router.post('/:workerId/zones', protect, addServiceZone);
router.patch('/:workerId/settings', protect, updateGeofenceSettings);

export default router;
