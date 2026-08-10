import os from 'os';
import mongoose from 'mongoose';

export class DbPoolHealthSupervisorEngine {
  constructor() {
    this.reconnectAttempts = 0;
  }

  getDbMetrics() {
    const readyState = mongoose.connection.readyState;
    const states = { 0: 'DISCONNECTED', 1: 'CONNECTED', 2: 'CONNECTING', 3: 'DISCONNECTING' };
    return {
      status: states[readyState] || 'UNKNOWN',
      readyState,
      dbName: mongoose.connection.name || 'N/A',
      reconnectAttempts: this.reconnectAttempts,
      isHealthy: readyState === 1
    };
  }

  generateSystemReport() {
    return {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      status: mongoose.connection.readyState === 1 ? 'HEALTHY' : 'DEGRADED',
      database: this.getDbMetrics(),
      system: {
        platform: process.platform,
        totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
        freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    };
  }
}

export default new DbPoolHealthSupervisorEngine();
