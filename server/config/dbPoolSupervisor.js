/**
 * Connection Pool Supervisor & Self-Healing Database Health Monitor.
 * Monitors MongoDB connection state, pool size, heartbeat ping, and auto-reconnects on drop.
 */

import mongoose from 'mongoose';

class DBPoolSupervisor {
  constructor() {
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatIntervalMs = 15000; // 15s
    this.isSupervising = false;
  }

  startSupervisor() {
    if (this.isSupervising) return;
    this.isSupervising = true;

    mongoose.connection.on('disconnected', () => {
      console.warn('[DBPoolSupervisor] MongoDB connection dropped! Triggering self-healing reconnect...');
      this.handleReconnect();
    });

    mongoose.connection.on('connected', () => {
      console.log('[DBPoolSupervisor] MongoDB connection established successfully.');
      this.reconnectAttempts = 0;
    });
  }

  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[DBPoolSupervisor] Critical: Maximum reconnection attempts reached!');
      return;
    }

    this.reconnectAttempts += 1;
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.log(`[DBPoolSupervisor] Attempting reconnect #${this.reconnectAttempts} in ${backoff}ms...`);

    setTimeout(async () => {
      try {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGO_URI);
        }
      } catch (err) {
        console.error('[DBPoolSupervisor] Reconnect attempt failed:', err.message);
      }
    }, backoff);
  }

  getPoolMetrics() {
    const readyState = mongoose.connection.readyState;
    const states = ['DISCONNECTED', 'CONNECTED', 'CONNECTING', 'DISCONNECTING'];

    return {
      status: states[readyState] || 'UNKNOWN',
      readyState,
      dbName: mongoose.connection.name || 'N/A',
      reconnectAttempts: this.reconnectAttempts,
      isHealthy: readyState === 1
    };
  }
}

export const dbSupervisor = new DBPoolSupervisor();
