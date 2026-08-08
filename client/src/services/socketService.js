import { io } from 'socket.io-client';

let socket = null;
let listeners = new Map();
let offlineQueue = [];

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.PROD && typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export const connectSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.debug('[Socket] Connected:', socket.id);
    flushOfflineQueue();
  });

  socket.io.on('reconnect', (attempt) => {
    console.debug('[Socket] Reconnected after', attempt, 'attempts');
    if (socket?.connected) {
      socket.emit('socket_reconnected', { timestamp: new Date().toISOString() });
    }
  });

  socket.on('disconnect', (reason) => {
    console.debug('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error.message);
  });

  return socket;
};

const flushOfflineQueue = () => {
  if (!socket?.connected || offlineQueue.length === 0) return;
  console.debug(`[Socket] Flushing ${offlineQueue.length} queued offline messages...`);
  while (offlineQueue.length > 0) {
    const item = offlineQueue.shift();
    socket.emit(item.event, item.data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    listeners.forEach((handler, event) => {
      socket.off(event, handler);
    });
    listeners.clear();
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const isConnected = () => socket?.connected || false;

export const sendMessage = (data) => {
  if (!socket?.connected) {
    console.warn('[Socket] Disconnected: Queueing message for reconnect send');
    offlineQueue.push({ event: 'send_message', data });
    return false;
  }
  socket.emit('send_message', data);
  return true;
};

export const sendAttachmentMessage = (conversationId, attachment) => {
  if (!socket?.connected) return false;
  socket.emit('send_message', {
    conversationId,
    content: `[Attachment] ${attachment.fileName}`,
    attachment
  });
  return true;
};

export const joinConversation = (conversationId) => {
  if (!socket?.connected) return;
  socket.emit('join_conversation', { conversationId });
};

export const leaveConversation = (conversationId) => {
  if (!socket?.connected) return;
  socket.emit('leave_conversation', { conversationId });
};

export const startTyping = (conversationId, recipientId) => {
  if (!socket?.connected) return;
  socket.emit('typing_start', { conversationId, recipientId });
};

export const stopTyping = (conversationId, recipientId) => {
  if (!socket?.connected) return;
  socket.emit('typing_stop', { conversationId, recipientId });
};

export const onMessage = (handler) => {
  if (!socket) return () => {};
  socket.on('new_message', handler);
  listeners.set('new_message', handler);
  return () => {
    socket.off('new_message', handler);
    listeners.delete('new_message');
  };
};

export const onTyping = (handler) => {
  if (!socket) return () => {};
  socket.on('typing', handler);
  listeners.set('typing', handler);
  return () => {
    socket.off('typing', handler);
    listeners.delete('typing');
  };
};

export const onPresenceUpdate = (handler) => {
  if (!socket) return () => {};
  socket.on('presence_update', handler);
  listeners.set('presence_update', handler);
  return () => {
    socket.off('presence_update', handler);
    listeners.delete('presence_update');
  };
};

export const onConversationUpdate = (handler) => {
  if (!socket) return () => {};
  socket.on('conversation_update', handler);
  listeners.set('conversation_update', handler);
  return () => {
    socket.off('conversation_update', handler);
    listeners.delete('conversation_update');
  };
};

export const joinBooking = (bookingId) => {
  if (!socket?.connected) return;
  socket.emit('join_booking', { bookingId });
};

export const leaveBooking = (bookingId) => {
  if (!socket?.connected) return;
  socket.emit('leave_booking', { bookingId });
};

export const onBookingStatusUpdate = (handler) => {
  if (!socket) return () => {};
  socket.on('booking:statusUpdate', handler);
  listeners.set('booking:statusUpdate', handler);
  return () => {
    socket.off('booking:statusUpdate', handler);
    listeners.delete('booking:statusUpdate');
  };
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  isConnected,
  sendMessage,
  joinConversation,
  leaveConversation,
  joinBooking,
  leaveBooking,
  startTyping,
  stopTyping,
  onMessage,
  onTyping,
  onPresenceUpdate,
  onConversationUpdate,
  onBookingStatusUpdate,
};
