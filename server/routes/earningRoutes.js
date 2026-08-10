import express from 'express';
import { getEarningsAnalytics } from '../controllers/earningController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/analytics', getEarningsAnalytics);

export default router;
