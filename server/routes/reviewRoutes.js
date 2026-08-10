import { respondToReview } from '../controllers/reviewResponseController.js';
import express from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  reportReview
} from '../controllers/reviewController.js';
import { getWorkerReviews } from '../controllers/workerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.get('/worker/:id', getWorkerReviews);
router.post('/', protect, createReview);

router.post('/:id/report', protect, reportReview);

router.get('/:id', getReviewById);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:reviewId/response', protect, respondToReview);

export default router;
