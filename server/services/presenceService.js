/**
 * Socket Presence Service tracking active client sockets, last active ping, and reconnect queues.
 */

class PresenceService {
  constructor() {
    this.activeSockets = new Map(); // socketId -> metadata
    this.userSockets = new Map();   // userId -> Set(socketId)
  }

  registerSocket(socketId, userId, role = 'user') {
    this.activeSockets.set(socketId, {
      userId,
      role,
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      state: 'CONNECTED'
    });

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socketId);
  }

  recordHeartbeat(socketId) {
    const session = this.activeSockets.get(socketId);
    if (session) {
      session.lastHeartbeat = Date.now();
      session.state = 'ACTIVE';
      return true;
    }
    return false;
  }

  unregisterSocket(socketId) {
    const session = this.activeSockets.get(socketId);
    if (session) {
      const userSet = this.userSockets.get(session.userId);
      if (userSet) {
        userSet.delete(socketId);
        if (userSet.size === 0) {
          this.userSockets.delete(session.userId);
        }
      }
      this.activeSockets.delete(socketId);
    }
  }

  getOnlineUserCount() {
    return this.userSockets.size;
  }
}

export const socketPresenceStore = new PresenceService();
