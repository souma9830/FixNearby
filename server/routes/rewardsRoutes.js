import express from 'express';
import { getLoyaltyProfile, redeemVoucher } from '../controllers/rewardsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getLoyaltyProfile);
router.post('/redeem', redeemVoucher);

export default router;
