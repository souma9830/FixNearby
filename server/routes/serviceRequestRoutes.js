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

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/all', protect, getAllRequests);
router.get('/categories', getCategories);
router.get('/:id', getRequestById);
router.patch('/:id/status', protect, updateRequestStatus);
router.post('/:id/upvote', upvoteRequest);

export default router;
