import { dbSupervisor } from '../config/dbPoolSupervisor.js';
import os from 'os';

export const getSystemHealthReport = () => {
  const dbMetrics = dbSupervisor.getPoolMetrics();
  const memoryUsage = process.memoryUsage();

  return {
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    status: dbMetrics.isHealthy ? 'HEALTHY' : 'DEGRADED',
    database: dbMetrics,
    system: {
      platform: process.platform,
      arch: process.arch,
      totalMemoryMb: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemoryMb: Math.round(os.freemem() / (1024 * 1024)),
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024))
    }
  };
};
