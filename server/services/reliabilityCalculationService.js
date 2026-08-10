import WorkerReliabilityScore from '../models/WorkerReliabilityScore.js';

class ReliabilityCalculationService {
  static async getOrInitScore(workerId) {
    let record = await WorkerReliabilityScore.findOne({ workerId });
    if (!record) {
      record = await WorkerReliabilityScore.create({ workerId });
    }
    return record;
  }

  static async recordCancellation(workerId, isLateCancellation = false) {
    const record = await this.getOrInitScore(workerId);
    record.totalBookingsAccepted += 1;
    record.canceledBookingsCount += 1;

    let penalty = 10;
    if (isLateCancellation) {
      record.lateCancellationsCount += 1;
      penalty = 25;
    }

    record.reliabilityIndexScore = Math.max(0, record.reliabilityIndexScore - penalty);
    record.lastPenaltyAppliedAt = new Date();

    // Evaluate Tier
    if (record.reliabilityIndexScore >= 90) {
      record.reliabilityTier = 'Gold';
      record.dispatchPenaltyMultiplier = 1.0;
    } else if (record.reliabilityIndexScore >= 75) {
      record.reliabilityTier = 'Silver';
      record.dispatchPenaltyMultiplier = 0.9;
    } else if (record.reliabilityIndexScore >= 60) {
      record.reliabilityTier = 'Bronze';
      record.dispatchPenaltyMultiplier = 0.7;
    } else {
      record.reliabilityTier = 'Probation';
      record.dispatchPenaltyMultiplier = 0.4;
    }

    return await record.save();
  }

  static async recordCompletion(workerId) {
    const record = await this.getOrInitScore(workerId);
    record.totalBookingsAccepted += 1;
    record.completedBookingsCount += 1;

    // Small bonus for completed jobs
    record.reliabilityIndexScore = Math.min(100, record.reliabilityIndexScore + 2);

    if (record.reliabilityIndexScore >= 90) {
      record.reliabilityTier = 'Gold';
      record.dispatchPenaltyMultiplier = 1.0;
    } else if (record.reliabilityIndexScore >= 75) {
      record.reliabilityTier = 'Silver';
      record.dispatchPenaltyMultiplier = 0.9;
    } else if (record.reliabilityIndexScore >= 60) {
      record.reliabilityTier = 'Bronze';
      record.dispatchPenaltyMultiplier = 0.7;
    }

    return await record.save();
  }
}

export default ReliabilityCalculationService;
