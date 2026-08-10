import GeoPolygon from '../models/GeoPolygon.js';

export const updateGeofence = async (req, res) => {
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
  getWorkerGeofence
};
