import { generateTaxReportData } from '../services/taxReportService.js';

// @desc    Get worker earnings analytics breakdown
// @route   GET /api/earnings/analytics
// @access  Private (Worker)
export const getEarningsAnalytics = async (req, res, next) => {
  try {
    const report = generateTaxReportData(req.user.name || 'Worker', 2026);

    res.status(200).json({
      success: true,
      analytics: report
    });
  } catch (error) {
    next(error);
  }
};
