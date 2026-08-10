import express from 'express';
import {
  getPayoutDetails,
  createConnectAccount,
  requestPayout
} from '../controllers/payoutController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireRole('provider', 'worker', 'admin'));

router.get('/details', getPayoutDetails);
router.post('/stripe-connect', createConnectAccount);
router.post('/request', requestPayout);

export default router;
