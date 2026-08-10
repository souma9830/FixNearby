import CustomerTipBonus from '../models/CustomerTipBonus.js';

export const sendCustomerTip = async (req, res, next) => {
  try {
    const { bookingId, workerId, tipAmount, bonusType, customerMessage } = req.body;
    const userId = req.user.id;

    const newTip = await CustomerTipBonus.create({
      bookingId,
      userId,
      workerId,
      tipAmount,
      bonusType,
      customerMessage,
      paymentStatus: 'succeeded',
    });

    res.status(201).json({
      success: true,
      message: 'Gratuity tip transferred to worker successfully',
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
