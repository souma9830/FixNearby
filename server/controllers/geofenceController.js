import GeoPolygon from '../models/GeoPolygon.js';
import Geofence from '../models/Geofence.js';
import Worker from '../models/Worker.js';
import { verifyGeofenceBoundary } from '../services/geofenceAuditorService.js';

// @desc    Update worker's service territory geofence radius & center
// @route   POST /api/geofence/update
// @access  Private (worker)
export const updateGeofence = async (req, res) => {
  try {
    const { radiusKm, centerAddress, lat, lng, maxTravelTimeMinutes, isActive } = req.body;
    const worker = await Worker.findOne({ user: req.user.id });

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
    res.status(500).json({ message: 'Error updating geofence boundary', error: error.message });
  }
};

// @desc    Update geofenced service territory boundary polygon
// @route   PUT /api/geofence
// @access  Private (worker)
export const updateTerritoryGeofence = async (req, res) => {
  try {
    const { territoryName = 'Downtown Service Boundary', coordinates, radiusKm = 15 } = req.body;

    const defaultCoords = coordinates || [
      [
        [-74.006, 40.7128],
        [-73.935, 40.7306],
        [-73.985, 40.7589],
        [-74.006, 40.7128]
      ]
    ];

    const polygonDoc = await GeoPolygon.findOneAndUpdate(
      { workerId: req.user._id },
      {
        workerId: req.user._id,
        territoryName,
        polygon: { type: 'Polygon', coordinates: defaultCoords },
        radiusKm
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Geofenced service territory boundary updated successfully!', geofence: polygonDoc });
  } catch (error) {
    res.status(500).json({ message: 'Error updating geofence boundary', error: error.message });
  }
};

export const getWorkerGeofence = async (req, res) => {
  try {
    let geofence = await GeoPolygon.findOne({ workerId: req.user._id });
    if (!geofence) {
      geofence = {
        territoryName: 'Metro Operating Zone',
        radiusKm: 15,
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [-74.006, 40.7128],
              [-73.935, 40.7306],
              [-73.985, 40.7589],
              [-74.006, 40.7128]
            ]
          ]
        }
      };
    }
    res.status(200).json({ success: true, geofence });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching geofence', error: error.message });
  }
};

export default {
  updateGeofence,
  updateTerritoryGeofence,
  getWorkerGeofence
};