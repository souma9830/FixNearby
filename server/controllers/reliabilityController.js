import ReliabilityCalculationService from '../services/reliabilityCalculationService.js';

export const getReliabilityScore = async (req, res) => {
  try {
    const workerId = req.params.workerId || (req.user && req.user.id);
    const score = await ReliabilityCalculationService.getOrInitScore(workerId);
    return res.status(200).json({
      success: true,
      data: score,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleCancellationPenalty = async (req, res) => {
  try {
    const workerId = req.user ? req.user.id : req.body.workerId;
    const { isLateCancellation } = req.body;
    const updatedScore = await ReliabilityCalculationService.recordCancellation(workerId, isLateCancellation);
    return res.status(200).json({
      success: true,
      message: 'Cancellation penalty recorded and reliability score updated.',
      data: updatedScore,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleJobCompletionBonus = async (req, res) => {
  try {
    const workerId = req.body.workerId;
    const updatedScore = await ReliabilityCalculationService.recordCompletion(workerId);
    return res.status(200).json({
      success: true,
      message: 'Job completion recorded.',
      data: updatedScore,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
