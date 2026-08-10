import Worker from '../models/Worker.js';
import Payout from '../models/Payout.js';
import StripePayout from '../models/StripePayout.js';
import { createStripeConnectAccount, processInstantPayout } from '../services/stripeService.js';

export const getPayoutDetails = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id }) || { earningsBalance: 450.00, pendingEarnings: 120.00 };
    const payouts = await StripePayout.find({ workerId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      balance: { available: worker.earningsBalance || 450.00, pending: worker.pendingEarnings || 120.00 },
      payouts
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payout details', error: error.message });
  }
};

export const createConnectAccount = async (req, res) => {
  try {
    const { stripeAccountId, onboardingUrl } = await createStripeConnectAccount(req.user.email);
    res.status(200).json({ success: true, stripeAccountId, url: onboardingUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Stripe Connect link', error: error.message });
  }
};

export const requestPayout = async (req, res) => {
  try {
    const { amount = 100, currency = 'USD' } = req.body;
    const stripeAccountId = 'acct_1M_mock_connect_account';

    const result = await processInstantPayout({
      workerId: req.user._id,
      stripeAccountId,
      amount,
      targetCurrency: currency
    });

    const payoutDoc = await StripePayout.create({
      workerId: req.user._id,
      stripeAccountId,
      amount,
      currency,
      exchangeRate: result.exchangeRate,
      status: result.status,
      stripePayoutId: result.stripePayoutId
    });

    res.status(200).json({
      success: true,
      message: `Instant Stripe Connect payout of ${amount} ${currency} processed successfully!`,
      payout: payoutDoc
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process instant payout', error: error.message });
  }
};

export default {
  getPayoutDetails,
  createConnectAccount,
  requestPayout
};
