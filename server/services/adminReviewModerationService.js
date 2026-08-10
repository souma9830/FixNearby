import Review from '../models/Review.js';

export class AdminReviewModerationPanelService {
  async getFlaggedReviews(page = 1, limit = 10) {
    return await Review.find({ moderationStatus: { $in: ['pending', 'flagged'] } })
      .populate('userId', 'name email')
      .populate('workerId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async moderateReview(reviewId, action, reason = '') {
    const statusMap = { approve: 'approved', reject: 'rejected', flag: 'flagged' };
    const newStatus = statusMap[action] || 'pending';
    return await Review.findByIdAndUpdate(
      reviewId,
      { moderationStatus: newStatus, moderationNote: reason },
      { new: true }
    );
  }
}

export default new AdminReviewModerationPanelService();
