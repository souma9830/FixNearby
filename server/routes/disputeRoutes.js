import express from 'express';
import { createDispute, getDisputes, resolveDispute } from '../controllers/disputeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createDispute);
router.get('/', getDisputes);
router.patch('/:id/resolve', resolveDispute);

export default router;
