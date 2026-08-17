import express from 'express';
import { getWorkerSlaStats } from '../controllers/slaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/worker/:workerId', protect, getWorkerSlaStats);

export default router;