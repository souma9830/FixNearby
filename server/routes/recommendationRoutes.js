import express from 'express';
import { getRecommendedWorkers } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/workers', getRecommendedWorkers);

export default router;
