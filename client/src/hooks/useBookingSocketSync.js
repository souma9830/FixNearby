import { useEffect } from 'react';
import { getSocket, onBookingStatusUpdate } from '../services/socketService';

/**
 * React hook to listen for real-time booking status timeline updates via WebSockets.
 * @param {string} bookingId - Target booking ID
 * @param {function} onStatusUpdate - Callback invoked when status changes
 */
export const useBookingSocketSync = (bookingId, onStatusUpdate) => {
  useEffect(() => {
    if (!bookingId) return;

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('join_booking', { bookingId });
    }

    const unsubscribe = onBookingStatusUpdate((data) => {
      if (data?.bookingId === bookingId && typeof onStatusUpdate === 'function') {
        onStatusUpdate(data);
      }
    });

    return () => {
      unsubscribe();
      if (socket?.connected) {
        socket.emit('leave_booking', { bookingId });
      }
    };
  }, [bookingId, onStatusUpdate]);
};

export default useBookingSocketSync;
