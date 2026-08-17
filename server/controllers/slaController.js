import SlaMetric from '../models/SlaMetric.js';
import Worker from '../models/Worker.js';

export const evalSlaForBooking = async ({ bookingId, workerId, customerId, actualResponseTimeMinutes, actualArrivalDelayMinutes, slaTier = 'STANDARD' }) => {
  const maxResponseTime = slaTier === 'EMERGENCY_VIP' ? 15 : slaTier === 'PRIORITY' ? 30 : 60;
  const isViolated = actualResponseTimeMinutes > maxResponseTime || actualArrivalDelayMinutes > 30;

  let penalty = 0;
  if (isViolated) {
    penalty = slaTier === 'EMERGENCY_VIP' ? 25 : 10;
  }

  const slaRecord = await SlaMetric.create({
    bookingId,
    workerId,
    customerId,
    expectedResponseTimeMinutes: maxResponseTime,
    actualResponseTimeMinutes,
    actualArrivalDelayMinutes,
    slaTier,
    isSlaViolated: isViolated,
    penaltyDeductionAmount: penalty,
    resolutionStatus: isViolated ? 'VIOLATED_PENDING_REVIEW' : 'MET'
  });

  if (isViolated && workerId) {
    await Worker.findByIdAndUpdate(workerId, {
      $inc: { slaViolationCount: 1 }
    });
  }

  return slaRecord;
};

export const getWorkerSlaStats = async (req, res) => {
  try {
    const { workerId } = req.params;
    const stats = await SlaMetric.aggregate([
      { $match: { workerId: new SlaMetric.base.Types.ObjectId(workerId) } },
      {
        $group: {
          _id: '$workerId',
          totalJobs: { $sum: 1 },
          violations: { $sum: { $cond: ['$isSlaViolated', 1, 0] } },
          avgResponseTime: { $avg: '$actualResponseTimeMinutes' },
          totalPenalties: { $sum: '$penaltyDeductionAmount' }
        }
      }
    ]);

    const result = stats[0] || { totalJobs: 0, violations: 0, avgResponseTime: 0, totalPenalties: 0 };
    const complianceRate = result.totalJobs > 0 ? (((result.totalJobs - result.violations) / result.totalJobs) * 100).toFixed(1) : 100;

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        complianceRate: parseFloat(complianceRate)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
