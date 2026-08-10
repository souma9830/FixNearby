import GratuityBonusService from '../services/gratuityBonusService.js';

export const submitTip = async (req, res) => {
  try {
    const customerId = req.user ? req.user.id : req.body.customerId;
    const gratuity = await GratuityBonusService.processTipAndBonus({
      ...req.body,
      customerId,
    });
    return res.status(201).json({
      success: true,
      message: 'Tip and worker bonus processed successfully.',
      data: gratuity,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWorkerGratuityEarnings = async (req, res) => {
  try {
    const workerId = req.params.workerId || (req.user && req.user.id);
    const summary = await GratuityBonusService.getWorkerEarningsSummary(workerId);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGratuityById = async (req, res) => {
  try {
    const gratuity = await GratuityBonusService.getGratuityById(req.params.gratuityId);
    return res.status(200).json({
      success: true,
      data: gratuity,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
