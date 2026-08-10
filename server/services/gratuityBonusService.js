import WorkerGratuityBonus from '../models/WorkerGratuityBonus.js';

class GratuityBonusService {
  static async processTipAndBonus(payload) {
    const { bookingId, customerId, workerId, tipAmountUSD, complimentTags = [], isFiveStarReview = false } = payload;

    let bonusMatch = 0;
    if (isFiveStarReview && tipAmountUSD >= 10) {
      bonusMatch = 5; // $5 platform bonus match for great tips with 5-star rating
    }

    const totalPayout = tipAmountUSD + bonusMatch;

    const gratuity = new WorkerGratuityBonus({
      bookingId,
      customerId,
      workerId,
      tipAmountUSD,
      platformBonusMatchUSD: bonusMatch,
      totalPayoutAmountUSD: totalPayout,
      complimentTags,
      payoutStatus: 'Transferred',
    });

    return await gratuity.save();
  }

  static async getWorkerEarningsSummary(workerId) {
    const list = await WorkerGratuityBonus.find({ workerId });
    const totalTips = list.reduce((sum, item) => sum + item.tipAmountUSD, 0);
    const totalBonuses = list.reduce((sum, item) => sum + item.platformBonusMatchUSD, 0);
    return {
      totalTipsUSD: totalTips,
      totalBonusesUSD: totalBonuses,
      grandTotalUSD: totalTips + totalBonuses,
      recordsCount: list.length,
    };
  }
}

export default GratuityBonusService;
