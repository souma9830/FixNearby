export class WebSocketHeartbeatPresenceStateMachine {
  constructor() {
    this.sessions = new Map();
  }

  registerConnection(socketId, userId, role) {
    this.sessions.set(socketId, {
      socketId,
      userId,
      role,
      lastHeartbeat: Date.now(),
      status: 'ONLINE'
    });
    return this.sessions.get(socketId);
  }

  processHeartbeatPing(socketId) {
    const session = this.sessions.get(socketId);
    if (!session) return false;
    session.lastHeartbeat = Date.now();
    return true;
  }

  unregisterConnection(socketId) {
    return this.sessions.delete(socketId);
  }

  getOnlineUsersCount() {
    return this.sessions.size;
  }
}

export default new WebSocketHeartbeatPresenceStateMachine();
