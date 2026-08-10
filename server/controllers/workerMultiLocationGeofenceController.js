import WorkerMultiLocationGeofence from '../models/WorkerMultiLocationGeofence.js';
import GeofenceBoundaryViolationLog from '../models/GeofenceBoundaryViolationLog.js';

export const getWorkerGeofences = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    let config = await WorkerMultiLocationGeofence.findOne({ workerId });

    if (!config) {
      config = await WorkerMultiLocationGeofence.create({
        workerId,
        primaryCity: 'Default Zone',
        serviceZones: [],
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

export const addServiceZone = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { zoneName, lat, lng, radiusKm } = req.body;

    let config = await WorkerMultiLocationGeofence.findOne({ workerId });
    if (!config) {
      config = new WorkerMultiLocationGeofence({ workerId, primaryCity: zoneName, serviceZones: [] });
    }

    config.serviceZones.push({
      zoneName,
      centerCoordinates: { lat, lng },
      radiusKm,
      activeStatus: true,
    });

    await config.save();

    res.status(201).json({ success: true, message: 'Service zone added successfully', data: config });
  } catch (error) {
    next(error);
  }
};

export const updateGeofenceSettings = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { maxTravelRadiusKm, travelSurchargePerKm, primaryCity } = req.body;

    const config = await WorkerMultiLocationGeofence.findOneAndUpdate(
      { workerId },
      { maxTravelRadiusKm, travelSurchargePerKm, primaryCity },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Geofence settings updated', data: config });
  } catch (error) {
    next(error);
  }
};

export const logBoundaryViolation = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { lat, lng, bookingId, distanceExcessKm, nearestZoneName } = req.body;

    const violation = await GeofenceBoundaryViolationLog.create({
      workerId,
      bookingId: bookingId || null,
      detectedLocation: { lat, lng },
      nearestZoneName: nearestZoneName || 'Out of Zone',
      distanceExcessKm: distanceExcessKm || 0,
      autoAlertTriggered: true,
    });

    res.status(201).json({
      success: true,
      message: 'Geofence boundary breach logged and real-time alert dispatched',
      data: violation,
    });
  } catch (error) {
    next(error);
  }
};

