import Review from '../models/Review.js';

/**
 * Add a worker response/reply to a specific review
 * @route   POST /api/reviews/:reviewId/response
 * @access  Private (Worker owner only)
 */
export const respondToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { responseText, replyText } = req.body;

  const content = responseText || replyText;
  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide response/reply text.'
    });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Verify authorized worker ownership: only the reviewed worker can respond
    if (review.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only respond to reviews left for you.'
      });
    }

    review.replyText = content.trim();
    review.repliedAt = new Date();
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response posted successfully.',
      review
    });
  } catch (err) {
    console.error('Error responding to review:', err);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message
    });
  }
};
