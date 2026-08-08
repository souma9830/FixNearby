import Dispute from '../models/Dispute.js';
import Booking from '../models/Booking.js';
import Wallet from '../models/Wallet.js';
import AdminLog from '../models/AdminLog.js';
import crypto from 'crypto';
import { processDisputeEvidence } from '../services/disputeWorkflowService.js';

// @desc    Raise a new customer-worker booking dispute
// @route   POST /api/disputes
// @access  Private (User)
export const createDispute = async (req, res, next) => {
  try {
    const { bookingId, reasonCategory, description, claimAmount, evidenceImages } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only booking customer can file a dispute' });
    }

    const existing = await Dispute.findOne({ bookingId, status: { $ne: 'rejected' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An active dispute is already open for this booking' });
    }

    const processedEvidence = processDisputeEvidence(evidenceUrls || []);

    const dispute = await Dispute.create({
      bookingId,
      raisedBy: req.user._id,
      againstWorker: booking.workerId,
      reasonCategory: reasonCategory || 'service_quality',
      description,
      claimAmount: claimAmount || booking.price || 0,
      evidenceImages: evidenceImages || []
    });

    res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully to arbitration queue',
      dispute
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of open disputes for arbitration
// @route   GET /api/disputes
// @access  Private (Admin / Agent)
export const getDisputes = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('bookingId', 'service price status scheduledTime address notes')
      .populate('raisedBy', 'name email contact')
      .populate('againstWorker', 'name category experience email contact')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Arbitrate & resolve a dispute (Full Refund / Worker Payout / Split)
// @route   PATCH /api/disputes/:id/resolve
// @access  Private (Admin / Agent)
export const resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, refundAmount = 0, payoutAmount = 0, notes = '' } = req.body;

    const dispute = await Dispute.findById(id).populate('bookingId');
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute file not found' });
    }

    const booking = dispute.bookingId;
    const adminId = req.user._id;

    if (action === 'refund') {
      dispute.status = 'resolved_refund';
      dispute.resolutionOutcome = {
        refundAmount: dispute.claimAmount || booking.price || 0,
        payoutAmount: 0,
        notes: notes || 'Full customer refund granted by support arbitration',
        resolvedAt: new Date()
      };
      dispute.resolvedByAdmin = adminId;
      await dispute.save();

      // Execute atomic wallet refund
      if (booking && booking.price > 0) {
        await Wallet.findOneAndUpdate(
          { userId: dispute.raisedBy },
          {
            $inc: { balance: booking.price },
            $push: {
              transactions: {
                transactionId: `TXN_DISPUTE_REFUND_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
                type: 'refund',
                amount: booking.price,
                status: 'completed',
                bookingId: booking._id,
                description: `Dispute arbitration refund for booking #${booking._id}`
              }
            }
          },
          { new: true, upsert: true }
        );
      }

      booking.status = 'Cancelled';
      await booking.save();

    } else if (action === 'payout') {
      dispute.status = 'resolved_payout';
      dispute.resolutionOutcome = {
        refundAmount: 0,
        payoutAmount: booking.price || 0,
        notes: notes || 'Worker claim upheld. Escrow funds released to provider.',
        resolvedAt: new Date()
      };
      dispute.resolvedByAdmin = adminId;
      await dispute.save();

      booking.status = 'Completed';
      await booking.save();

    } else if (action === 'split') {
      dispute.status = 'resolved_split';
      dispute.resolutionOutcome = {
        refundAmount: Number(refundAmount),
        payoutAmount: Number(payoutAmount),
        notes: notes || `Custom split arbitration: $${refundAmount} customer refund / $${payoutAmount} worker payout`,
        resolvedAt: new Date()
      };
      dispute.resolvedByAdmin = adminId;
      await dispute.save();

      if (Number(refundAmount) > 0) {
        await Wallet.findOneAndUpdate(
          { userId: dispute.raisedBy },
          {
            $inc: { balance: Number(refundAmount) },
            $push: {
              transactions: {
                transactionId: `TXN_DISPUTE_SPLIT_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
                type: 'refund',
                amount: Number(refundAmount),
                status: 'completed',
                bookingId: booking._id,
                description: `Partial dispute arbitration refund for booking #${booking._id}`
              }
            }
          },
          { new: true, upsert: true }
        );
      }
    } else {
      dispute.status = 'rejected';
      dispute.resolutionOutcome = {
        notes: notes || 'Dispute rejected by arbitration agent',
        resolvedAt: new Date()
      };
      dispute.resolvedByAdmin = adminId;
      await dispute.save();
    }

    // Log admin audit action
    await AdminLog.create({
      adminId,
      adminName: req.user.name || 'Support Agent',
      role: 'SupportAgent',
      action: `RESOLVE_DISPUTE_${action.toUpperCase()}`,
      targetCategory: 'DisputeArbitration',
      targetId: id,
      details: `Resolved dispute #${id} via ${action}: ${notes}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(200).json({
      success: true,
      message: `Dispute successfully arbitrated with action "${action}"`,
      dispute
    });
  } catch (error) {
    next(error);
  }
};
