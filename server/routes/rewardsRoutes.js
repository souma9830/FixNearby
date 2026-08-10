import express from 'express';
import { getUserRewards, redeemCoupon } from '../controllers/rewardsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-rewards', protect, getUserRewards);
router.post('/redeem', protect, redeemCoupon);
router.get('/tier-rules', (req, res) => {
  res.status(200).json({
    tiers: [
      { name: 'Bronze', minPoints: 0, multiplier: 1.0 },
      { name: 'Silver', minPoints: 200, multiplier: 1.25 },
      { name: 'Gold', minPoints: 500, multiplier: 1.5 },
      { name: 'Platinum', minPoints: 1000, multiplier: 2.0 }
    ]
  });
});

export default router;
