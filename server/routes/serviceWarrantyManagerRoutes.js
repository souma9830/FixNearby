import express from 'express';
import { issueWarranty, getUserWarranties } from '../controllers/serviceWarrantyManagerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/issue', protect, issueWarranty);
router.get('/my-warranties', protect, getUserWarranties);

export default router;