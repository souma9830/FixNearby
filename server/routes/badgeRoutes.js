import express from 'express';
import {
  getPendingBadgeRequests,
  submitBadgeRequest,
  reviewBadgeRequest
} from '../controllers/badgeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending', protect, getPendingBadgeRequests);
router.post('/request', protect, submitBadgeRequest);
router.put('/review/:requestId', protect, reviewBadgeRequest);
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await BadgeRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
