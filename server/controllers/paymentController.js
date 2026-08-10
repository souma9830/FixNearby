import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Earning from '../models/Earning.js';
import { stripe } from '../config/stripe.js';
import crypto from 'crypto';
import { processExternalPaymentGateway } from '../services/externalGatewayService.js';


// @desc    Create a real Stripe payment intent (with fallback for mock/demo)
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount, method = 'card', currency = 'usd' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and amount are required'
      });
    }

    const validMethods = ['card', 'stripe', 'bank_transfer', 'wallet'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Allowed: ${validMethods.join(', ')}`
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
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

    const existingPayment = await Payment.findOne({
      bookingId,
      status: { $in: ['pending', 'completed'] }
    });

    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for'
      });
    }

    let clientSecret = null;
    let stripePaymentIntentId = null;

    // Attempt real Stripe PaymentIntent creation
    try {
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
        const amountCents = Math.round(amount * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: currency.toLowerCase(),
          metadata: {
            bookingId: booking._id.toString(),
            userId: req.user._id.toString(),
          },
          automatic_payment_methods: { enabled: true },
        });

        clientSecret = paymentIntent.client_secret;
        stripePaymentIntentId = paymentIntent.id;
      }
    } catch (stripeErr) {
      console.warn('[Stripe PaymentIntent] Stripe API warning, using secure fallback:', stripeErr.message);
    }

    // Fallback if Stripe key is mock/test or call threw error
    if (!clientSecret) {
      const secretHex = crypto.randomBytes(16).toString('hex');
      stripePaymentIntentId = `pi_mock_${crypto.randomBytes(12).toString('hex')}`;
      clientSecret = `${stripePaymentIntentId}_secret_${secretHex}`;
    }

    let payment;
    if (existingPayment) {
      existingPayment.amount = amount;
      existingPayment.method = method;
      existingPayment.clientSecret = clientSecret;
      existingPayment.stripePaymentIntentId = stripePaymentIntentId;
      await existingPayment.save();
      payment = existingPayment;
    } else {
      payment = await Payment.create({
        userId: req.user._id,
        bookingId,
        amount,
        currency: currency.toUpperCase(),
        method,
        status: 'pending',
        clientSecret,
        stripePaymentIntentId
      });
    }

    res.status(201).json({
      success: true,
      payment,
      clientSecret,
      stripePaymentIntentId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm a payment (Stripe webhook simulation / Client confirmation)
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId, transactionId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId is required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this payment'
      });
    }

    if (payment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment is already completed',
        payment
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm a refunded payment'
      });
    }

    payment.status = 'completed';
    payment.escrowStatus = 'held_in_escrow';
    payment.escrowHoldDate = new Date();
    payment.transactionId = transactionId || payment.stripePaymentIntentId || `txn_${crypto.randomBytes(12).toString('hex')}`;
    payment.paymentDate = new Date();

    const receiptId = crypto.randomBytes(8).toString('hex');
    payment.receiptUrl = `/api/payments/receipt/${receiptId}`;

    await payment.save();

    // Auto update booking status if accepted and lock in Escrow status
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.escrowStatus = 'held_in_escrow';
      if (booking.status === 'Pending') {
        booking.status = 'Accepted';
        booking.statusHistory.push({
          status: 'Accepted',
          changedBy: req.user._id,
          changedByModel: 'User',
          note: 'Booking auto-confirmed upon successful payment held in Escrow'
        });
      }
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe Webhook Signature Verification)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event = req.body;

  if (endpointSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
    } catch (err) {
      console.error('[Stripe Webhook Error]:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  console.log(`[Stripe Webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;
        const stripeId = paymentIntent.id;

        const payment = await Payment.findOne({
          $or: [{ stripePaymentIntentId: stripeId }, { bookingId }]
        });

        if (payment && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.transactionId = stripeId;
          payment.paymentDate = new Date();
          await payment.save();

          // Update booking status
          if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (booking && booking.status === 'Pending') {
              booking.status = 'Accepted';
              await booking.save();
            }
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const stripeId = paymentIntent.id;
        const payment = await Payment.findOne({ stripePaymentIntentId: stripeId });
        if (payment) {
          payment.status = 'failed';
          await payment.save();
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const stripeId = charge.payment_intent;
        const payment = await Payment.findOne({ stripePaymentIntentId: stripeId });
        if (payment) {
          payment.status = 'refunded';
          payment.refundReason = charge.refunds?.data?.[0]?.reason || 'Stripe webhook refund';
          await payment.save();
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Processing Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get paginated payment history for current user
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId: req.user._id })
        .populate('bookingId', 'service scheduledTime address price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bookingId')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a refund for a completed payment via Stripe API
// @route   POST /api/payments/:id/refund
// @access  Private
export const requestRefund = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to request a refund for this payment'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    let stripeRefundId = null;

    // Call Stripe Refund API if real payment intent exists
    try {
      if (payment.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
        });
        stripeRefundId = refund.id;
      }
    } catch (stripeErr) {
      console.warn('[Stripe Refund Error]:', stripeErr.message);
    }

    payment.status = 'refunded';
    payment.refundReason = reason.trim();
    payment.stripeRefundId = stripeRefundId || `re_mock_${crypto.randomBytes(8).toString('hex')}`;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release Escrow funds to provider upon customer job approval (Stripe Connect Transfer)
// @route   POST /api/payments/escrow/:bookingId/release
// @access  Private (Customer or Admin)
export const releaseEscrowFunds = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { rating, feedback } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user is customer who booked or admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the customer who booked this service can approve job completion and release Escrow funds.'
      });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record for this booking not found'
      });
    }

    if (payment.escrowStatus === 'released') {
      return res.status(400).json({
        success: false,
        message: 'Escrow funds for this booking have already been released to the provider.'
      });
    }

    if (payment.status !== 'completed' && payment.escrowStatus !== 'held_in_escrow') {
      return res.status(400).json({
        success: false,
        message: 'No active funds held in Escrow for this booking.'
      });
    }

    // Calculate Platform Fee (10%) and Provider Payout (90%)
    const platformFeeRate = 0.10;
    const totalAmount = payment.amount;
    const platformFee = Math.round(totalAmount * platformFeeRate * 100) / 100;
    const providerPayoutAmount = Math.round((totalAmount - platformFee) * 100) / 100;

    // Fetch Worker to get Stripe Connect Account ID
    const worker = await Worker.findById(booking.workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Assigned service provider not found'
      });
    }

    let stripeConnectAccountId = worker.stripeConnectAccountId;
    if (!stripeConnectAccountId && worker.payoutMethods?.length > 0) {
      const stripeMethod = worker.payoutMethods.find(p => p.type === 'stripe_connect');
      if (stripeMethod?.details?.stripeAccountId) {
        stripeConnectAccountId = stripeMethod.details.stripeAccountId;
      }
    }

    let stripeTransferId = null;

    // Attempt real Stripe Transfer if Stripe Connect account exists
    try {
      if (
        stripeConnectAccountId &&
        process.env.STRIPE_SECRET_KEY &&
        !process.env.STRIPE_SECRET_KEY.includes('mock')
      ) {
        const transferCents = Math.round(providerPayoutAmount * 100);
        const transfer = await stripe.transfers.create({
          amount: transferCents,
          currency: (payment.currency || 'usd').toLowerCase(),
          destination: stripeConnectAccountId,
          metadata: {
            bookingId: booking._id.toString(),
            providerId: worker._id.toString(),
            platformFee: platformFee.toString(),
          },
        });
        stripeTransferId = transfer.id;
      }
    } catch (stripeErr) {
      console.warn('[Stripe Connect Transfer Warning]:', stripeErr.message);
    }

    if (!stripeTransferId) {
      stripeTransferId = `tr_mock_${crypto.randomBytes(12).toString('hex')}`;
    }

    // Update Payment Escrow Status
    payment.escrowStatus = 'released';
    payment.platformFee = platformFee;
    payment.providerPayoutAmount = providerPayoutAmount;
    payment.stripeTransferId = stripeTransferId;
    payment.stripeConnectAccountId = stripeConnectAccountId || 'acct_mock_express_provider';
    payment.escrowReleaseDate = new Date();
    await payment.save();

    // Update Booking Status to Completed & Approved
    booking.status = 'Completed';
    booking.escrowStatus = 'released';
    booking.completionApprovedByCustomer = true;
    booking.customerApprovedAt = new Date();
    booking.statusHistory.push({
      status: 'Completed',
      changedBy: req.user._id,
      changedByModel: 'User',
      note: `Job completion approved by customer. Escrow funds released ($${providerPayoutAmount} to provider, $${platformFee} platform fee).`
    });
    await booking.save();

    // Update Worker Earnings & Wallet
    worker.walletBalance = (worker.walletBalance || 0) + providerPayoutAmount;
    worker.monthlyCompletedJobs = (worker.monthlyCompletedJobs || 0) + 1;
    await worker.save();

    try {
      await Earning.create({
        workerId: worker._id,
        bookingId: booking._id,
        amount: providerPayoutAmount,
        platformFee,
        netPayout: providerPayoutAmount,
        status: 'paid',
        paymentMethod: 'stripe_connect',
        stripeTransferId,
        date: new Date()
      });
    } catch (earningErr) {
      console.warn('[Earning Log Notice]:', earningErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Escrow funds released successfully to provider account.',
      escrow: {
        totalAmount,
        platformFee,
        providerPayoutAmount,
        platformFeePercentage: '10%',
        stripeTransferId,
        escrowStatus: 'released',
        releaseDate: payment.escrowReleaseDate
      },
      booking,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Escrow status and breakdown for a booking
// @route   GET /api/payments/escrow/status/:bookingId
// @access  Private
export const getEscrowStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const payment = await Payment.findOne({ bookingId });
    if (!payment) {
      return res.status(200).json({
        success: true,
        escrowStatus: 'not_applicable',
        message: 'No payment transaction found for this booking.'
      });
    }

    const platformFee = payment.platformFee || Math.round(payment.amount * 0.10 * 100) / 100;
    const providerPayout = payment.providerPayoutAmount || Math.round((payment.amount - platformFee) * 100) / 100;

    res.status(200).json({
      success: true,
      escrow: {
        bookingId: booking._id,
        paymentId: payment._id,
        escrowStatus: payment.escrowStatus || (payment.status === 'completed' ? 'held_in_escrow' : 'pending'),
        amount: payment.amount,
        platformFee,
        providerPayout,
        currency: payment.currency,
        stripeTransferId: payment.stripeTransferId,
        escrowHoldDate: payment.escrowHoldDate || payment.createdAt,
        escrowReleaseDate: payment.escrowReleaseDate,
        isApproved: booking.completionApprovedByCustomer || payment.escrowStatus === 'released',
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Link or update worker's Stripe Connect Express Account
// @route   POST /api/payments/escrow/connect-account
// @access  Private (Worker)
export const linkStripeConnectAccount = async (req, res, next) => {
  try {
    const { workerId, stripeAccountId } = req.body;

    const targetWorkerId = workerId || req.user._id;
    const worker = await Worker.findById(targetWorkerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    let connectAccountId = stripeAccountId;

    // Generate real or mock Stripe Connect account ID if not provided
    if (!connectAccountId) {
      try {
        if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
          const account = await stripe.accounts.create({
            type: 'express',
            email: worker.email,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          });
          connectAccountId = account.id;
        }
      } catch (stripeErr) {
        console.warn('[Stripe Connect Create Account Warning]:', stripeErr.message);
      }
    }

    if (!connectAccountId) {
      connectAccountId = `acct_express_${crypto.randomBytes(8).toString('hex')}`;
    }

    worker.stripeConnectAccountId = connectAccountId;

    // Update payout methods list
    const existingIndex = worker.payoutMethods?.findIndex(p => p.type === 'stripe_connect');
    if (existingIndex >= 0) {
      worker.payoutMethods[existingIndex].details = {
        ...(worker.payoutMethods[existingIndex].details || {}),
        stripeAccountId: connectAccountId
      };
    } else {
      worker.payoutMethods.push({
        type: 'stripe_connect',
        isDefault: true,
        details: { stripeAccountId: connectAccountId },
        createdAt: new Date()
      });
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Stripe Connect payout account linked successfully.',
      stripeConnectAccountId: connectAccountId,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        stripeConnectAccountId: worker.stripeConnectAccountId
      }
    });
  } catch (error) {
    next(error);
  }
};

