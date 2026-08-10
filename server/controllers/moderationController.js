import Review from '../models/Review.js';
import mongoose from 'mongoose';

// @desc    Get reported/pending reviews with pagination
// @route   GET /api/admin/moderation/reviews
// @access  Private (Admin)
export const getReportedReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      moderationStatus: { $in: ['pending', 'flagged'] }
    };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('worker', 'name')
      .sort({ reportedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reported reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load reported reviews'
    });
  }
};

// @desc    Approve a reported review
// @route   PATCH /api/admin/moderation/reviews/:id/approve
// @access  Private (Admin)
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.moderationStatus = 'approved';
    review.reported = false;
    await review.save();

    // Recalculate the worker's average rating
    await Review.calculateAverageRating(review.worker);

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ success: false, message: 'Failed to approve review' });
  }
};

// @desc    Reject/flag a reported review
// @route   PATCH /api/admin/moderation/reviews/:id/reject
// @access  Private (Admin)
export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.moderationStatus = 'flagged';
    if (adminNote) {
      review.adminNote = adminNote;
    }
    await review.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Review flagged successfully',
      review
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ success: false, message: 'Failed to flag review' });
  }
};

// @desc    Bulk approve or reject multiple reviews
// @route   POST /api/admin/moderation/reviews/bulk
// @access  Private (Admin)
export const bulkAction = async (req, res) => {
  try {
    const { reviewIds, action } = req.body;

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide review IDs' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be "approve" or "reject"' });
    }

    const updateFields = action === 'approve'
      ? { moderationStatus: 'approved', reported: false }
      : { moderationStatus: 'flagged' };

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { $set: updateFields }
    );

    // Recalculate ratings for affected workers
    if (action === 'approve') {
      const reviews = await Review.find({ _id: { $in: reviewIds } }).select('worker');
      const workerIds = [...new Set(reviews.map(r => r.worker.toString()))];
      for (const wid of workerIds) {
        await Review.calculateAverageRating(wid);
      }
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} review(s) ${action === 'approve' ? 'approved' : 'flagged'}`,
      modified: result.modifiedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ success: false, message: 'Bulk action failed' });
  }
};

// @desc    Get moderation statistics
// @route   GET /api/admin/moderation/stats
// @access  Private (Admin)
export const getModerationStats = async (req, res) => {
  try {
    const [stats] = await Review.aggregate([
      {
        $group: {
          _id: '$moderationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = { total: 0, approved: 0, pending: 0, flagged: 0 };

    const allCounts = await Review.aggregate([
      {
        $group: {
          _id: '$moderationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    for (const item of allCounts) {
      result[item._id] = item.count;
      result.total += item.count;
    }

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({ success: false, message: 'Failed to load moderation stats' });
  }
};
