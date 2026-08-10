import Subscription from '../models/Subscription.js';
import Wallet from '../models/Wallet.js';
import crypto from 'crypto';
import SubscriptionSchedulerService from '../services/subscriptionSchedulerService.js';
import ServiceSubscription from '../models/ServiceSubscription.js';

// @desc    Get active subscription details and tier perks
// @route   GET /api/subscriptions/active
// @access  Private
export const getActiveSubscription = async (req, res, next) => {
  try {
    const subscriberId = req.user._id;
    let subscription = await Subscription.findOne({ subscriberId, status: 'active' });

    if (!subscription) {
      subscription = await Subscription.create({
        subscriberId,
        subscriberModel: 'User',
        planTier: 'free',
        price: 0,
        perks: {
          zeroBookingFees: false,
          priorityDispatch: false,
          reducedCommissionPct: 10,
          goldVerificationBadge: false
        }
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade subscription tier (Customer Plus / Worker Pro)
// @route   POST /api/subscriptions/upgrade
// @access  Private
export const upgradeSubscription = async (req, res, next) => {
  try {
    const { planTier, billingCycle = 'monthly' } = req.body;
    const subscriberId = req.user._id;

    let price = 0;
    let perks = {
      zeroBookingFees: false,
      priorityDispatch: false,
      reducedCommissionPct: 10,
      goldVerificationBadge: false
    };

    if (planTier === 'customer_plus') {
      price = billingCycle === 'annual' ? 99 : 12;
      perks = {
        zeroBookingFees: true,
        priorityDispatch: true,
        reducedCommissionPct: 0,
        goldVerificationBadge: false
      };
    } else if (planTier === 'worker_pro') {
      price = billingCycle === 'annual' ? 249 : 29;
      perks = {
        zeroBookingFees: true,
        priorityDispatch: true,
        reducedCommissionPct: 5,
        goldVerificationBadge: true
      };
    } else if (planTier === 'worker_elite') {
      price = billingCycle === 'annual' ? 499 : 59;
      perks = {
        zeroBookingFees: true,
        priorityDispatch: true,
        reducedCommissionPct: 3,
        goldVerificationBadge: true
      };
    }

    const subscription = await Subscription.findOneAndUpdate(
      { subscriberId },
      {
        subscriberId,
        subscriberModel: 'User',
        planTier,
        billingCycle,
        price,
        status: 'active',
        perks,
        currentPeriodEnd: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 3600 * 1000)
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${planTier.toUpperCase().replace('_', ' ')}!`,
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial MRR/ARR analytics summary for admin
// @route   GET /api/subscriptions/analytics
// @access  Private (Admin)
export const getSubscriptionAnalytics = async (req, res, next) => {
  try {
    const activeSubs = await Subscription.find({ status: 'active' });
    const mrr = activeSubs.reduce((sum, s) => sum + (s.billingCycle === 'annual' ? s.price / 12 : s.price), 0);
    const arr = mrr * 12;

    res.status(200).json({
      success: true,
      activeSubscribers: activeSubs.length,
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      churnRatePct: 2.1
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res) => {
  try {
    const customerId = req.user ? req.user.id : req.body.customerId;
    const sub = await SubscriptionSchedulerService.createSubscription(customerId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Service subscription created.',
      data: sub,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerSubscriptions = async (req, res) => {
  try {
    const customerId = req.params.customerId || (req.user && req.user.id);
    const subs = await ServiceSubscription.find({ customerId });
    return res.status(200).json({
      success: true,
      data: subs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await SubscriptionSchedulerService.updateSubscriptionStatus(req.params.subscriptionId, status);
    return res.status(200).json({
      success: true,
      message: `Subscription ${status.toLowerCase()}.`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
