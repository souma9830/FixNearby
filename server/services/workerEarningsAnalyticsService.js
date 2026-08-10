import Booking from '../models/Booking.js';

export class WorkerEarningsTrackingAnalyticsService {
  async getEarningsAnalyticsSummary(workerId) {
    const agg = await Booking.aggregate([
      { $match: { workerId, status: 'Completed' } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$price' },
          completedJobs: { $sum: 1 },
          avgPayout: { $avg: '$price' }
        }
      }
    ]);

    const summary = agg[0] || { grossRevenue: 0, completedJobs: 0, avgPayout: 0 };
    const platformFeeRate = 0.10;
    const netPayout = summary.grossRevenue * (1 - platformFeeRate);

    return {
      workerId,
      grossRevenue: summary.grossRevenue,
      netPayout,
      completedJobs: summary.completedJobs,
      avgPayout: Math.round(summary.avgPayout)
    };
  }
}

export default new WorkerEarningsTrackingAnalyticsService();
