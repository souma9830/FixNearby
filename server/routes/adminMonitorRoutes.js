import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// System performance health monitoring endpoint
router.get('/health-monitor', protect, admin, (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptime),
    memory: {
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    },
    systemMetrics: {
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

export default router;
