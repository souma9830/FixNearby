import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendReferralInvite,
  getReferralStats,
  claimReferralReward,
  validateReferralCode,
  claimWorkerBonus
} from '../controllers/referralController.js';

const router = express.Router();

// Public route to validate referral links/codes
router.get('/validate/:code', validateReferralCode);

// Protected user & worker referral routes
router.use(protect);

router.post('/invite', sendReferralInvite);
router.get('/stats', getReferralStats);
router.post('/claim', claimReferralReward);
router.post('/worker-bonus/claim', claimWorkerBonus);

export default router;
