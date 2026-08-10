import express from 'express';
import { calculateEstimate } from '../controllers/estimatorController.js';

const router = express.Router();

router.post('/calculate', calculateEstimate);

export default router;
