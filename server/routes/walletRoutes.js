import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWalletBalance,
  topupWallet,
  payWithWallet,
  getWalletTransactions,
} from '../controllers/walletController.js';

const router = express.Router();

// Require user authentication
router.use(protect);

router.get('/balance', getWalletBalance);
router.post('/topup', topupWallet);
router.post('/pay', payWithWallet);
router.get('/transactions', getWalletTransactions);

export default router;
