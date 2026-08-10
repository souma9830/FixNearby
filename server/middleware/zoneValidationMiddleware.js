export const validateServiceZonePayload = (req, res, next) => {
  const { zoneName, centerCoordinates, serviceRadiusKm } = req.body;

  if (!zoneName || typeof zoneName !== 'string' || zoneName.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Zone name is required (min 2 chars).' });
  }

  if (!centerCoordinates || typeof centerCoordinates.latitude !== 'number' || typeof centerCoordinates.longitude !== 'number') {
    return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required.' });
  }

  if (typeof serviceRadiusKm !== 'number' || serviceRadiusKm < 1 || serviceRadiusKm > 100) {
    return res.status(400).json({ success: false, message: 'Service radius must be between 1 and 100 km.' });
  }

  next();
};
