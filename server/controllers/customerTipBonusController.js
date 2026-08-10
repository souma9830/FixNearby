import CustomerTipBonus from '../models/CustomerTipBonus.js';
import WorkerGratuityPayoutAudit from '../models/WorkerGratuityPayoutAudit.js';
import Worker from '../models/Worker.js';

export const sendCustomerTip = async (req, res, next) => {
  try {
    const { bookingId, workerId, tipAmount, bonusType, customerMessage } = req.body;
    const userId = req.user._id || req.user.id;

    const newTip = await CustomerTipBonus.create({
      bookingId,
      userId,
      workerId,
      tipAmount,
      bonusType,
      customerMessage,
      paymentStatus: 'succeeded',
    });

    // Credit worker wallet and record payout audit log
    await Worker.findByIdAndUpdate(workerId, { $inc: { walletBalance: tipAmount } });
    await WorkerGratuityPayoutAudit.create({
      tipBonusId: newTip._id,
      workerId,
      netGratuityAmount: tipAmount,
      platformFeeDeducted: 0,
      payoutBatchId: `BATCH-TIP-${Date.now()}`,
      transferStatus: 'completed',
    });

    res.status(201).json({
      success: true,
      message: 'Gratuity tip transferred to worker successfully and credited to wallet balance',
      data: newTip,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerTipsHistory = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const tips = await CustomerTipBonus.find({ workerId }).sort({ createdAt: -1 });

    const totalTips = tips.reduce((acc, curr) => acc + curr.tipAmount, 0);

    res.status(200).json({
      success: true,
      totalTips,
      count: tips.length,
      data: tips,
    });
  } catch (error) {
    next(error);
  }
};

