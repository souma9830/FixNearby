import express from 'express';
import { scanDamagePhoto, getDamageHistory } from '../controllers/aiDiagnosticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/scan', scanDamagePhoto);
router.get('/history', getDamageHistory);

export default router;
