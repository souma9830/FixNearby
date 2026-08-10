import logger from './logger.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
const PING_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Socket lifecycle manager
 * Periodically sends ping frames to connected sockets and disconnects un-acknowledged sockets.
 */
export class SocketLifecycleManager {
  constructor(io) {
    this.io = io;
    this.timer = null;
    this.activeSockets = new Map();
  }

  start() {
    if (this.timer) return;

    logger.info('[SocketLifecycle] Starting connection lifecycle heartbeat monitor');

    this.timer = setInterval(() => {
      this.checkConnections();
    }, HEARTBEAT_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('[SocketLifecycle] Stopped connection lifecycle monitor');
    }
  }

  registerSocket(socket) {
    socket.isAlive = true;
    socket.lastPingTime = Date.now();

    socket.on('pong_heartbeat', async () => {
      socket.isAlive = true;
      socket.lastPingTime = Date.now();
      
      // Update DB lastActive timestamp on heartbeat pong
      try {
        const userId = socket.user?._id;
        const userType = socket.userType;
        if (userId) {
          const lastActive = new Date();
          if (userType === 'Worker') {
            await Worker.findByIdAndUpdate(userId, { lastActive });
          } else {
            await User.findByIdAndUpdate(userId, { lastActive });
          }
        }
      } catch (err) {
        logger.error('[SocketLifecycle] Failed to touch lastActive timestamp:', err);
      }
    });

    this.activeSockets.set(socket.id, socket);
  }

  unregisterSocket(socketId) {
    this.activeSockets.delete(socketId);
  }

  checkConnections() {
    this.activeSockets.forEach((socket, socketId) => {
      if (socket.isAlive === false) {
        logger.warn(`[SocketLifecycle] Pruning dead socket connection: ${socketId} (User: ${socket.user?._id})`);
        this.unregisterSocket(socketId);
        socket.disconnect(true);
        return;
      }

      socket.isAlive = false;
      socket.emit('ping_heartbeat', { timestamp: Date.now() });
    });
  }

  getMetrics() {
    return {
      activeSocketsCount: this.activeSockets.size,
      monitoredSockets: Array.from(this.activeSockets.keys())
    };
  }
}

let lifecycleInstance = null;

export const initSocketLifecycle = (io) => {
  lifecycleInstance = new SocketLifecycleManager(io);
  lifecycleInstance.start();
  return lifecycleInstance;
};

export const getSocketLifecycle = () => lifecycleInstance;
