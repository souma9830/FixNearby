import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendCustomerTip, getWorkerTipsHistory } from '../controllers/customerTipBonusController.js';

const router = express.Router();

router.post('/send', protect, sendCustomerTip);
router.get('/worker/:workerId', protect, getWorkerTipsHistory);

export default router;
