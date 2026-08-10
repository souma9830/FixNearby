import Geofence from '../models/Geofence.js';
import Worker from '../models/Worker.js';
import { verifyGeofenceBoundary } from '../services/geofenceAuditorService.js';

export const updateGeofence = async (req, res) => {
  try {
    const { radiusKm, centerAddress, lat, lng, maxTravelTimeMinutes, isActive } = req.body;
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const updateData = { radiusKm, centerAddress };
    if (maxTravelTimeMinutes !== undefined) updateData.maxTravelTimeMinutes = maxTravelTimeMinutes;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (lat && lng) {
      updateData.location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    }

    const geofence = await Geofence.findOneAndUpdate(
      { worker: worker._id },
      updateData,
      { upsert: true, new: true }
    );

    let auditResult = null;
    if (lat && lng && geofence.location?.coordinates) {
      auditResult = verifyGeofenceBoundary(lat, lng, geofence.location.coordinates[1], geofence.location.coordinates[0], (radiusKm || 10) * 1000);
    }

    res.status(200).json({ success: true, geofence, auditResult });
  } catch (error) {
    res.status(500).json({ message: 'Error updating geofence', error: error.message });
  }
};

export const getWorkerGeofence = async (req, res) => {
  try {
    const { workerId } = req.params;
    const geofence = await Geofence.findOne({ worker: workerId });
    res.status(200).json({ success: true, geofence: geofence || { radiusKm: 10 } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching geofence', error: error.message });
  }
};

export default {
  updateGeofence,
  getWorkerGeofence
};
