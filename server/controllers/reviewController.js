import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { analyzeToxicity } from '../utils/sentiment.js';
import { calculateWorkerQualityMetrics } from '../services/qualityAnalyticsService.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { rating, reviewText, bookingReference } = req.body;

    if (!rating || !reviewText || !bookingReference) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, review text, and booking reference'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingReference)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking reference ID'
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingReference);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Restrict submission to users who completed bookings with that specific worker
    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed bookings'
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only review your own bookings'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingReference });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this booking'
      });
    }

    // AI Sentiment Toxicity & Fraudulence Analysis (#883)
    const toxicity = analyzeToxicity(reviewText);
    const moderationStatus = toxicity.isToxic ? 'pending' : 'approved';

    // Create review
    const review = await Review.create({
      rating,
      reviewText,
      bookingReference,
      user: req.user._id,
      worker: booking.workerId,
      moderationStatus,
      reported: toxicity.isToxic,
      reportReason: toxicity.reason || '',
    });

    const isFlagged = toxicity.isToxic;
    res.status(201).json({
      success: true,
      message: isFlagged
        ? 'Review submitted and held in PENDING_MODERATION by AI sentiment analysis'
        : 'Review submitted successfully',
      flaggedForModeration: isFlagged,
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all reviews (optionally filtered by workerId)
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const { workerId } = req.query;
    let query = {};

    if (workerId) {
      if (!mongoose.Types.ObjectId.isValid(workerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid worker ID'
        });
      }
      query.worker = workerId;
    }

    // Filter out pending or toxic reviews from public rendering (#883)
    if (!req.query.includePending) {
      query.moderationStatus = 'approved';
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('worker', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get specific review by ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(req.params.id)
      .populate('user', 'name email')
      .populate('worker', 'name category');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Owner check
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.reviewText = reviewText;

    await review.save(); // triggers post('save') to recalculate rating

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Owner check
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const workerId = review.worker;
    await review.deleteOne();

    // Recalculate average rating after deletion
    await Review.calculateAverageRating(workerId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Create a review for a completed booking
// @route   POST /api/bookings/:id/review
// @access  Private (User owner only)
export const createBookingReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    if (!rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating and review text'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Gating check: Status must be Completed
    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed bookings'
      });
    }

    // Owner check: Only user who made the booking can review it
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only review your own bookings'
      });
    }

    // Uniqueness check: Already reviewed?
    const existing = await Review.findOne({ bookingReference: id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this booking'
      });
    }

    // Map uploaded files to URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // AI Sentiment Toxicity & Fraudulence Analysis (#883)
    const toxicity = analyzeToxicity(reviewText);
    const moderationStatus = toxicity.isToxic ? 'pending' : 'approved';

    const review = await Review.create({
      rating: Number(rating),
      reviewText,
      bookingReference: id,
      user: req.user._id,
      worker: booking.workerId,
      images,
      isVerified: true,
      moderationStatus,
      reported: toxicity.isToxic,
      reportReason: toxicity.reason || '',
    });

    const isFlagged = toxicity.isToxic;
    res.status(201).json({
      success: true,
      message: isFlagged
        ? 'Review submitted and held in PENDING_MODERATION by AI sentiment analysis'
        : 'Review submitted successfully',
      flaggedForModeration: isFlagged,
      review
    });
  } catch (error) {
    if (next) {
      next(error);
    } else {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// @desc    Report an abusive review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for reporting'
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.reported = true;
    review.reportReason = reason;
    review.reportedAt = new Date();
    review.moderationStatus = 'pending';

    await review.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Review reported successfully for moderation',
      review
    });
  } catch (error) {
    if (next) {
      next(error);
    } else {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
