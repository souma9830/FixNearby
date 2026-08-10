import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getLoyaltyAccount, redeemPointsForVoucher } from '../controllers/customerLoyaltyRewardController.js';

const router = express.Router();

router.get('/account', protect, getLoyaltyAccount);
router.post('/redeem', protect, redeemPointsForVoucher);

export default router;
