import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
  getPaymentById,
  requestRefund,
  releaseEscrowFunds,
  getEscrowStatus,
  linkStripeConnectAccount
} from '../controllers/paymentController.js';

const router = express.Router();

// Stripe Webhook (Public, signature-verified)
router.post('/webhook', handleStripeWebhook);

// Protected routes (require user authentication)
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);

// Escrow endpoints with RBAC role authorization
router.post('/escrow/connect-account', requireRole('worker', 'provider', 'admin'), linkStripeConnectAccount);
router.post('/escrow/:bookingId/release', requireRole('customer', 'admin'), releaseEscrowFunds);
router.get('/escrow/status/:bookingId', getEscrowStatus);

router.get('/:id', getPaymentById);
router.post('/:id/refund', requireRole('customer', 'admin'), requestRefund);

// Escrow & Stripe Connect Multi-Party Routing Routes
router.post('/escrow/:bookingId/release', releaseEscrowFunds);
router.get('/escrow/status/:bookingId', getEscrowStatus);
router.post('/escrow/connect-account', linkStripeConnectAccount);

export default router;

