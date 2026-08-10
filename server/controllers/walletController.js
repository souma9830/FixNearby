import Wallet from '../models/Wallet.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import crypto from 'crypto';

/**
 * Helper to ensure a wallet document exists for a user
 */
const getOrCreateUserWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: 100, // Initial bonus welcome balance for testing/demo
      currency: 'USD',
      transactions: [{
        transactionId: `TXN_W_WELCOME_${Date.now()}`,
        type: 'cashback',
        amount: 100,
        status: 'completed',
        description: 'Welcome Wallet Credit Bonus'
      }]
    });
  }
  return wallet;
};

// @desc    Get user wallet balance and recent transactions
// @route   GET /api/wallet/balance
// @access  Private (User)
export const getWalletBalance = async (req, res, next) => {
  try {
    const wallet = await getOrCreateUserWallet(req.user._id);

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      transactions: wallet.transactions.slice(-10).reverse() // Recent 10
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Top up wallet balance
// @route   POST /api/wallet/topup
// @access  Private (User)
export const topupWallet = async (req, res, next) => {
  try {
    const { amount, method = 'card', stripePaymentIntentId } = req.body;
    const { validateWalletAmount, sanitizeWalletDescription } = await import('../services/walletVerificationService.js');
    const check = validateWalletAmount(amount);

    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.reason
      });
    }
    const numAmount = check.amount;

    const wallet = await getOrCreateUserWallet(req.user._id);

    const transactionId = `TXN_W_TOPUP_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Atomic MongoDB balance update and transaction append to prevent lost update race conditions
    const updatedWallet = await Wallet.findOneAndUpdate(
      { _id: wallet._id },
      {
        $inc: { balance: numAmount },
        $push: {
          transactions: {
            transactionId,
            type: 'topup',
            amount: numAmount,
            status: 'completed',
            stripePaymentIntentId: stripePaymentIntentId || null,
            description: `Wallet top-up via ${method.toUpperCase()}`
          }
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully topped up $${numAmount.toFixed(2)} to your wallet!`,
      balance: updatedWallet.balance,
      transactionId,
      transactions: updatedWallet.transactions.slice(-10).reverse()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay for booking checkout directly using wallet balance (1-click checkout)
// @route   POST /api/wallet/pay
// @access  Private (User)
export const payWithWallet = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;
    const numAmount = Number(amount);

    if (!bookingId || !numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and valid amount are required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Check existing payment
    const existingPayment = await Payment.findOne({
      bookingId,
      status: 'completed'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for'
      });
    }

    const wallet = await getOrCreateUserWallet(req.user._id);

    const transactionId = `TXN_W_PAY_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Atomic MongoDB balance deduction & balance check to prevent concurrent race conditions
    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        _id: wallet._id,
        balance: { $gte: numAmount }
      },
      {
        $inc: { balance: -numAmount },
        $push: {
          transactions: {
            transactionId,
            type: 'payment',
            amount: numAmount,
            status: 'completed',
            bookingId,
            description: `Payment for service (${booking.service || 'Booking'})`
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance or concurrent transaction in progress. Required: $${numAmount.toFixed(2)}`
      });
    }

    // Create / Update Payment document
    const payment = await Payment.create({
      userId: req.user._id,
      bookingId,
      amount: numAmount,
      method: 'wallet',
      status: 'completed',
      transactionId,
      paymentDate: new Date(),
      receiptUrl: `/api/payments/receipt/${crypto.randomBytes(8).toString('hex')}`
    });

    // Update booking status to Accepted
    if (booking.status === 'Pending') {
      booking.status = 'Accepted';
      booking.statusHistory.push({
        status: 'Accepted',
        changedBy: req.user._id,
        changedByModel: 'User',
        note: 'Booking confirmed via instant Wallet payment'
      });
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully using your wallet balance!',
      payment,
      newBalance: updatedWallet.balance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private (User)
export const getWalletTransactions = async (req, res, next) => {
  try {
    const wallet = await getOrCreateUserWallet(req.user._id);
    const { type } = req.query;

    let txns = wallet.transactions || [];
    if (type) {
      txns = txns.filter((t) => t.type === type);
    }

    // Sort newest first
    txns = [...txns].reverse();

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transactions: txns
    });
  } catch (error) {
    next(error);
  }
};
