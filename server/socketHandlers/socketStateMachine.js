import { socketPresenceStore } from '../services/presenceService.js';

export const handleSocketStateMachine = (socket) => {
  const userId = socket.user?._id || socket.id;
  socketPresenceStore.registerSocket(socket.id, userId);

  socket.on('heartbeat_ping', (data, ackFn) => {
    socketPresenceStore.recordHeartbeat(socket.id);
    if (typeof ackFn === 'function') {
      ackFn({ status: 'PONG', serverTime: Date.now() });
    }
  });

  socket.on('disconnect', () => {
    socketPresenceStore.unregisterSocket(socket.id);
  });
};
