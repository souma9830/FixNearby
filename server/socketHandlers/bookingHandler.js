import { getIo } from '../socket.js';

/**
 * Emit a booking:statusUpdate event to relevant socket rooms and channels.
 * 
 * @param {object} io - Socket.io server instance (optional, falls back to getIo())
 * @param {object} booking - Booking document
 * @param {object} [extraData={}] - Additional details (oldStatus, note, actor, etc.)
 */
export const emitBookingStatusUpdate = (io, booking, extraData = {}) => {
  const ioServer = io || getIo();
  if (!ioServer) {
    console.warn('[BookingSocket] Socket.io instance not initialized, skipping event emission');
    return;
  }

  if (!booking) return;

  const bookingId = (booking._id || booking.id || '').toString();
  const userId = booking.userId ? (booking.userId._id || booking.userId).toString() : null;
  const workerId = booking.workerId ? (booking.workerId._id || booking.workerId).toString() : null;

  const payload = {
    bookingId,
    status: booking.status,
    oldStatus: extraData.oldStatus || null,
    booking,
    note: extraData.note || '',
    timestamp: new Date().toISOString(),
  };

  console.log(`[BookingSocket] Emitting booking:statusUpdate for booking ${bookingId} -> status: ${booking.status}`);

  // Emit to user personal room if available
  if (userId) {
    ioServer.to(userId).emit('booking:statusUpdate', payload);
  }

  // Emit to worker personal room if available
  if (workerId) {
    ioServer.to(workerId).emit('booking:statusUpdate', payload);
  }

  // Emit to specific booking room
  ioServer.to(`booking:${bookingId}`).emit('booking:statusUpdate', payload);

  // General broadcast fallback for global listeners
  ioServer.emit('booking:statusUpdate', payload);
};

/**
 * Socket.IO listeners for client socket subscriptions to booking rooms & live GPS tracking.
 */
export const registerBookingHandlers = (io, socket) => {
  socket.on('join_booking', (data) => {
    const bookingId = typeof data === 'object' ? data?.bookingId : data;
    if (bookingId) {
      const room = `booking:${bookingId}`;
      socket.join(room);
      console.log(`[BookingSocket] Socket ${socket.id} joined room ${room}`);
      if (typeof data === 'object' && typeof data.callback === 'function') {
        data.callback({ success: true, room });
      }
    }
  });

  socket.on('leave_booking', (data) => {
    const bookingId = typeof data === 'object' ? data?.bookingId : data;
    if (bookingId) {
      const room = `booking:${bookingId}`;
      socket.leave(room);
      console.log(`[BookingSocket] Socket ${socket.id} left room ${room}`);
    }
  });

  // Real-time Provider GPS Location Tracking Listener (#874)
  const handleLocationUpdate = (data) => {
    if (!data) return;
    const { bookingId, lat, lng, latitude, longitude, userId, workerId } = data;
    const resolvedLat = typeof lat === 'number' ? lat : latitude;
    const resolvedLng = typeof lng === 'number' ? lng : longitude;

    if (typeof resolvedLat !== 'number' || typeof resolvedLng !== 'number') return;

    const payload = {
      bookingId,
      lat: resolvedLat,
      lng: resolvedLng,
      workerId,
      timestamp: new Date().toISOString(),
    };

    if (bookingId) {
      io.to(`booking:${bookingId}`).emit('provider:location_update', payload);
      io.to(`booking:${bookingId}`).emit('tracking:location', payload);
    }

    if (userId) {
      io.to(userId).emit('provider:location_update', payload);
      io.to(userId).emit('tracking:location', payload);
    }
  };

  socket.on('provider:location_update', handleLocationUpdate);
  socket.on('tracking:location', handleLocationUpdate);
};
