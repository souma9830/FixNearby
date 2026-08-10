/**
 * WebSocket Idle Connection Watchdog & Stale Socket Garbage Collector
 */
const IDLE_TIMEOUT_MS = 60000; // 60 seconds idle threshold

export const initSocketTimeoutWatchdog = (io, userSocketsMap) => {
  const socketActivityMap = new Map();

  const updateActivity = (socketId) => {
    socketActivityMap.set(socketId, Date.now());
  };

  const removeSocket = (socketId) => {
    socketActivityMap.delete(socketId);
  };

  // Watchdog cleanup timer running every 30 seconds
  const intervalId = setInterval(() => {
    const now = Date.now();
    let purgedCount = 0;

    socketActivityMap.forEach((lastActive, socketId) => {
      if (now - lastActive > IDLE_TIMEOUT_MS) {
        const targetSocket = io.sockets.sockets.get(socketId);
        if (targetSocket) {
          console.debug(`[Watchdog] Disconnecting stale idle socket: ${socketId}`);
          targetSocket.emit('idle_timeout', { message: 'Connection closed due to inactivity' });
          targetSocket.disconnect(true);
          purgedCount++;
        }
        socketActivityMap.delete(socketId);
      }
    });

    if (purgedCount > 0) {
      console.log(`[Watchdog] Purged ${purgedCount} idle socket connection(s).`);
    }
  }, 30000);

  return {
    updateActivity,
    removeSocket,
    stopWatchdog: () => clearInterval(intervalId)
  };
};
