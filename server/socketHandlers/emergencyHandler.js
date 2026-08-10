/**
 * Real-time Emergency SOS Dispatcher WebSocket Handler
 */
export const handleEmergencySosBroadcast = (io, socket, userId) => async (data, callback) => {
  try {
    const { latitude, longitude, category, description } = data || {};

    if (!latitude || !longitude) {
      if (typeof callback === 'function') {
        return callback({ success: false, message: 'Emergency location coordinates are required' });
      }
      return;
    }

    const payload = {
      alertId: `sos_${Date.now()}_${userId}`,
      triggeredBy: userId,
      location: { latitude: Number(latitude), longitude: Number(longitude) },
      category: category || 'General Emergency',
      description: description || 'Immediate assistance required',
      timestamp: new Date().toISOString(),
      priority: 'HIGH'
    };

    // Broadcast to emergency room channel
    io.emit('emergency_sos_alert', payload);
    console.log(`[Emergency Dispatcher] Real-time SOS alert broadcasted from user ${userId}`);

    if (typeof callback === 'function') {
      callback({ success: true, alertId: payload.alertId, broadcastedAt: payload.timestamp });
    }
  } catch (err) {
    console.error('Error handling emergency SOS broadcast:', err);
    if (typeof callback === 'function') {
      callback({ success: false, message: err.message });
    }
  }
};
