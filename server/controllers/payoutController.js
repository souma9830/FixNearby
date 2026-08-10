import Worker from '../models/Worker.js';
import Payout from '../models/Payout.js';
import { calculatePayoutSplit } from '../services/payoutSplitService.js';

export const getPayoutDetails = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const payouts = await Payout.find({ worker: worker._id }).sort({ createdAt: -1 });
    const available = worker.earningsBalance || 0;
    const pending = worker.pendingEarnings || 0;

    res.status(200).json({
      balance: { available, pending },
      payouts
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payout details', error: error.message });
  }
};

export const createConnectAccount = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    // Return dummy onboarding URL if stripe is not configured in dev
    const url = process.env.STRIPE_SECRET_KEY
      ? `https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}`
      : 'https://dashboard.stripe.com/test/connect/onboarding';

    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Stripe Connect link', error: error.message });
  }
};

export const requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    if (!amount || amount <= 0 || amount > (worker.earningsBalance || 0)) {
      return res.status(400).json({ message: 'Invalid payout amount' });
    }

    const splitInfo = calculatePayoutSplit(amount);

    const payout = new Payout({
      worker: worker._id,
      amount: splitInfo.netWorkerPayout || amount,
      status: 'completed',
      stripeTransferId: `tr_mock_${Date.now()}`
    });

    await payout.save();
    worker.earningsBalance = (worker.earningsBalance || 0) - amount;
    await worker.save();

    res.status(200).json({ success: true, payout, splitInfo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process payout', error: error.message });
  }
};

export default {
  getPayoutDetails,
  createConnectAccount,
  requestPayout
};
