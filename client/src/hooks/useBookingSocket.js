import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  connectSocket,
  getSocket,
  onBookingStatusUpdate,
  joinBooking,
  leaveBooking,
} from '../services/socketService';

/**
 * Play a synthesized multi-tone notification chime using Web Audio API.
 * 
 * @param {boolean} isCritical - Higher pitch & longer chime for critical transitions
 */
export const playNotificationChime = (isCritical = false) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(isCritical ? 880 : 587.33, now); // A5 vs D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(isCritical ? 1174.66 : 880, now + 0.15); // D6 vs A5
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.debug('[UseBookingSocket] Audio chime error:', e);
  }
};

/**
 * Trigger haptic vibration feedback for critical status updates.
 * 
 * @param {boolean} isCritical - Double pulse pattern for critical transitions
 */
export const triggerHapticFeedback = (isCritical = false) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      if (isCritical) {
        // Pattern: vibrate 200ms, pause 100ms, vibrate 200ms
        navigator.vibrate([200, 100, 200]);
      } else {
        navigator.vibrate(150);
      }
    } catch (e) {
      console.debug('[UseBookingSocket] Haptic vibration error:', e);
    }
  }
};

/**
 * Custom React hook to subscribe to real-time booking status events via WebSocket.
 * 
 * @param {object} [options={}]
 * @param {string} [options.bookingId] - Optional specific booking ID to join its room
 * @param {function} [options.onStatusUpdate] - Callback function (eventData) => void
 * @param {boolean} [options.enableNotifications=true] - Play sound/vibration alerts
 */
export const useBookingSocket = (options = {}) => {
  const { bookingId, onStatusUpdate, enableNotifications = true } = options;
  const { token } = useAuth();
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Ensure socket is initialized with auth token if available
    let socket = getSocket();
    if (!socket && token) {
      socket = connectSocket(token);
    } else if (!socket) {
      socket = connectSocket();
    }

    if (socket) {
      setConnected(socket.connected);

      const handleConnect = () => setConnected(true);
      const handleDisconnect = () => setConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [token]);

  // Handle room subscription if bookingId is provided
  useEffect(() => {
    if (bookingId) {
      joinBooking(bookingId);
      return () => {
        leaveBooking(bookingId);
      };
    }
  }, [bookingId]);

  // Handle booking:statusUpdate socket event
  useEffect(() => {
    const handleStatusUpdate = (eventData) => {
      console.log('[UseBookingSocket] Received status update:', eventData);

      // Filter by bookingId if specified
      if (bookingId) {
        const eventBookingId = eventData.bookingId || eventData.booking?._id || eventData.booking?.id;
        if (eventBookingId && String(eventBookingId) !== String(bookingId)) {
          return;
        }
      }

      setLastEvent(eventData);

      const status = eventData?.status;
      const isCritical = ['Technician En Route', 'Technician en route', 'Accepted', 'Confirmed', 'Completed'].includes(status);

      if (enableNotifications) {
        playNotificationChime(isCritical);
        triggerHapticFeedback(isCritical);
      }

      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate(eventData);
      }
    };

    const cleanup = onBookingStatusUpdate(handleStatusUpdate);
    return () => {
      cleanup();
    };
  }, [bookingId, onStatusUpdate, enableNotifications]);

  const manualJoinRoom = useCallback((bId) => {
    if (bId) joinBooking(bId);
  }, []);

  const manualLeaveRoom = useCallback((bId) => {
    if (bId) leaveBooking(bId);
  }, []);

  return {
    lastEvent,
    connected,
    joinBookingRoom: manualJoinRoom,
    leaveBookingRoom: manualLeaveRoom,
  };
};

export default useBookingSocket;
