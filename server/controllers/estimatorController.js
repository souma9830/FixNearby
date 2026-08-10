import PriceMatrix from '../models/PriceMatrix.js';

export const calculateEstimate = async (req, res) => {
  try {
    const { category, hours = 1, urgency = 'standard' } = req.body;

    const baseRates = {
      plumbing: { base: 40, hourly: 35 },
      electrical: { base: 50, hourly: 45 },
      carpentry: { base: 35, hourly: 30 },
      cleaning: { base: 25, hourly: 20 }
    };

    const rate = baseRates[category] || { base: 30, hourly: 25 };
    const multiplier = urgency === 'emergency' ? 1.5 : urgency === 'same_day' ? 1.25 : 1.0;

    const total = (rate.base + rate.hourly * hours) * multiplier;
    const low = Math.round(total * 0.9);
    const high = Math.round(total * 1.15);

    res.status(200).json({
      success: true,
      estimate: { low, high, currency: 'USD' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating estimate', error: error.message });
  }
};

export default {
  calculateEstimate
};
