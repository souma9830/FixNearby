import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWorkerAnalytics,
  getWorkerLeaderboard,
  getServiceDemandAnalytics,
} from '../controllers/analyticsController.js';

const router = express.Router();

// GET /worker/me -> protect, getWorkerAnalytics (uses req.user._id)
router.get('/worker/me', protect, getWorkerAnalytics);

// GET /worker/:workerId -> protect, getWorkerAnalytics
router.get('/worker/:workerId', protect, getWorkerAnalytics);

// GET /leaderboard -> getWorkerLeaderboard (public)
router.get('/leaderboard', getWorkerLeaderboard);

// GET /demand -> protect, getServiceDemandAnalytics
router.get('/demand', protect, getServiceDemandAnalytics);

export default router;
