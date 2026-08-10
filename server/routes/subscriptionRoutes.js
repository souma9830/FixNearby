import express from 'express';
import { getActiveSubscription, upgradeSubscription, getSubscriptionAnalytics, createSubscription, getCustomerSubscriptions, toggleStatus } from '../controllers/subscriptionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveSubscription);
router.post('/upgrade', upgradeSubscription);
router.get('/analytics', adminOnly, getSubscriptionAnalytics);

router.post('/', createSubscription);
router.get('/customer/:customerId', getCustomerSubscriptions);
router.patch('/:subscriptionId/status', toggleStatus);

export default router;
