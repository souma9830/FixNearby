/**
 * WebSocket Offline Event Queue Manager
 * Buffers socket events when connection is lost, persisting to LocalStorage and auto-flushing on reconnect.
 */

const STORAGE_KEY = 'fixnearby_socket_offline_queue';

export const enqueueOfflineEvent = (eventName, data) => {
  const queue = getOfflineQueue();
  queue.push({
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    eventName,
    data,
    timestamp: new Date().toISOString()
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to store offline socket event:', err);
  }
};

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const flushOfflineQueue = (socket) => {
  if (!socket || !socket.connected) return 0;
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  queue.forEach(item => {
    socket.emit(item.eventName, item.data);
  });

  clearOfflineQueue();
  return queue.length;
};
