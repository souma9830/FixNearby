import { calculateDynamicPrice } from '../utils/pricingEngine.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Subscription from '../models/Subscription.js';
import PriceMatrix from '../models/PriceMatrix.js';

// @desc    Estimate dynamic surge pricing for a booking request
// @route   POST /api/pricing/estimate
// @access  Public / Private
export const estimateBookingPrice = async (req, res, next) => {
  try {
    const { workerId, distanceKm = 5, category = 'General', complexity = 'medium', urgency = 'standard', estimatedHours = 2 } = req.body;

    let baseHourlyRate = 40;
    if (workerId) {
      const worker = await Worker.findById(workerId);
      if (worker) {
        baseHourlyRate = worker.hourlyRate || 40;
      }
    }

    const matrix = await PriceMatrix.findOne({ category });
    const complexityMult = matrix?.complexityMultipliers?.[complexity] || 1.0;
    const urgencyMult = matrix?.urgencyMultipliers?.[urgency] || 1.0;
    const baseRate = matrix?.baseRate || 35;
    const materialsCost = matrix?.defaultMaterialsEstimate || 20;

    const [activeWorkerCount, pendingDemandCount] = await Promise.all([
      Worker.countDocuments({ availabilityStatus: 'available', category }),
      Booking.countDocuments({ status: 'Pending', service: category })
    ]);

    let userTier = 'free';
    if (req.user) {
      const sub = await Subscription.findOne({ subscriberId: req.user._id, status: 'active' });
      if (sub) userTier = sub.planTier;
    }

    const priceBreakdown = calculateDynamicPrice({
      baseHourlyRate,
      distanceKm: Number(distanceKm),
      activeWorkerCount,
      pendingDemandCount,
      userTier
    });

    const calculatedTotal = Math.round(
      (baseRate + (baseHourlyRate * Number(estimatedHours) * complexityMult) + materialsCost) * urgencyMult
    );

    res.status(200).json({
      success: true,
      category,
      complexity,
      urgency,
      estimatedHours,
      priceBreakdown,
      matrixEstimate: {
        baseRate,
        materialsCost,
        urgencyMultiplier: urgencyMult,
        complexityMultiplier: complexityMult,
        totalEstimate: calculatedTotal
      }
    });
  } catch (error) {
    next(error);
  }
};
