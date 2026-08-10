const MultiLocationGeofence = require('../models/MultiLocationGeofence');

exports.addServiceZone = async (req, res) => {
  try {
    const { zoneName, centerCoordinates, radiusKm } = req.body;
    const zone = await MultiLocationGeofence.create({
      workerId: req.user._id,
      zoneName,
      centerCoordinates,
      radiusKm
    });

    return res.status(201).json({ success: true, message: 'Geofenced service zone added', data: zone });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkerZones = async (req, res) => {
  try {
    const zones = await MultiLocationGeofence.find({ workerId: req.user._id, isActive: true });
    return res.status(200).json({ success: true, data: zones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
