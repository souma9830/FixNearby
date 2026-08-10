import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { submitWarrantyClaim, getClaimsForUser, updateClaimStatus } from '../controllers/serviceWarrantyClaimController.js';

const router = express.Router();

router.post('/', protect, submitWarrantyClaim);
router.get('/', protect, getClaimsForUser);
router.patch('/:claimId/status', protect, updateClaimStatus);

export default router;
