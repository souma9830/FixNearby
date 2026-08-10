import express from 'express';
import {
  getReportedReviews,
  approveReview,
  rejectReview,
  bulkAction,
  getModerationStats
} from '../controllers/moderationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All moderation routes require admin auth
router.use(protect);

// Admin check middleware - inline helper since the codebase doesn't have a dedicated one
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

router.use(requireAdmin);

router.get('/reviews', getReportedReviews);
router.patch('/reviews/:id/approve', approveReview);
router.patch('/reviews/:id/reject', rejectReview);
router.post('/reviews/bulk', bulkAction);
router.get('/stats', getModerationStats);

export default router;
