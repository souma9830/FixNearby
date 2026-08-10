import express from 'express';
import { previewEstimate, confirmEstimate, getEstimateById, downloadEstimatePdf } from '../controllers/estimateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All estimate routes require authentication
router.use(protect);

router.post('/preview', previewEstimate);
router.post('/confirm', confirmEstimate);
router.get('/:id', getEstimateById);
router.get('/:id/download', downloadEstimatePdf);

export default router;
