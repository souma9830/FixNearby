import User from '../models/User.js';
import Worker from '../models/Worker.js';

export const handlePresenceUpdate = (io, socket, userId, userType) => async (data, callback) => {
  try {
    const allowed = ['available', 'online', 'busy', 'offline'];
    const { status } = data;
    if (!allowed.includes(status)) {
      if (callback) callback({ success: false, error: 'Invalid presence status' });
      return;
    }

    const lastActive = new Date();

    // Update DB based on user type
    if (userType === 'Worker') {
      const dbStatus = status === 'online' ? 'available' : status;
      await Worker.findByIdAndUpdate(userId, { availabilityStatus: dbStatus, lastActive });
    } else {
      const dbStatus = status === 'available' ? 'online' : status;
      await User.findByIdAndUpdate(userId, { status: dbStatus, lastActive });
    }

    const payload = { userId, status, userType, lastActive };
    io.emit('user-presence', payload);
    io.emit('presence_update', payload);

    if (callback) callback({ success: true, presence: payload });
  } catch (err) {
    if (callback) callback({ success: false, error: err.message });
  }
};
