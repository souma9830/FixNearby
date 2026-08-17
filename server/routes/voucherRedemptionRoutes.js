import express from 'express';
import { generateVoucher, getUserVouchers } from '../controllers/voucherRedemptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/redeem-points', protect, generateVoucher);
router.get('/my-vouchers', protect, getUserVouchers);

export default router;