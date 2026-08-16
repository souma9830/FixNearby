import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  upvoteRequest,
  getCategories
} from '../controllers/serviceRequestController.js';
import { responseCache, invalidateCache } from '../middleware/responseCacheMiddleware.js';

const router = express.Router();

router.post('/', protect, invalidateCache('GET:/api/service-requests/categories:*'), createRequest);
router.get('/my', protect, getMyRequests);
router.get('/all', protect, getAllRequests);
router.get('/categories', responseCache(300), getCategories);
router.get('/:id', getRequestById);
router.patch('/:id/status', protect, updateRequestStatus);
router.post('/:id/upvote', upvoteRequest);

export default router;
