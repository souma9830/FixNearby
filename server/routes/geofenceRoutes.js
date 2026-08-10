import express from 'express';
import { updateGeofence, getWorkerGeofence } from '../controllers/geofenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update', protect, updateGeofence);
router.get('/my-geofence', protect, async (req, res, next) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const Geofence = (await import('../models/Geofence.js')).default;
    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found' });
    const geofence = await Geofence.findOne({ worker: worker._id });
    res.status(200).json({ success: true, geofence: geofence || { radiusKm: 10, maxTravelTimeMinutes: 45, isActive: true } });
  } catch (err) {
    next(err);
  }
});
router.get('/:workerId', getWorkerGeofence);

export default router;
