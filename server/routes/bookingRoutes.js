import { bookingRateLimiter, globalApiLimiter } from '../middleware/rateLimiter.js';
import express from 'express';
import {
  createBooking,
  acceptBooking,
  completeBooking,
  cancelBooking,
  getBookings,
  getBookingById,
  rescheduleBooking,
  updateBookingStatusController,
  getBookingTimeline
} from '../controllers/bookingController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { checkBookingOverlap } from '../middleware/bookingValidation.js';
import {
  loadBooking,
  requireBookingParticipant,
  authorizeStatusTransition
} from '../middleware/bookingMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { createBookingReview } from '../controllers/reviewController.js';
import { useIdempotency } from '../middleware/idempotencyMiddleware.js';
import { disputePayloadValidator } from '../middleware/disputeValidationMiddleware.js';

const router = express.Router();

// All booking routes require authentication, rate limiting, and idempotency checks.
router.use(protect, globalApiLimiter, useIdempotency);

router.route('/')
  .post(bookingRateLimiter, checkBookingOverlap, createBooking)
  .get(bookingRateLimiter, getBookings);

router.route('/:id')
  .get(loadBooking, requireBookingParticipant, getBookingById);

// Provider-only status actions (require worker/provider/admin role & valid status transition)
router.route('/:id/accept')
  .patch(requireRole('provider', 'worker', 'admin'), loadBooking, authorizeStatusTransition, acceptBooking);

router.route('/:id/complete')
  .patch(requireRole('provider', 'worker', 'admin'), loadBooking, authorizeStatusTransition, completeBooking);

router.route('/:id/cancel')
  .patch(loadBooking, authorizeStatusTransition, cancelBooking)
  .post(loadBooking, authorizeStatusTransition, cancelBooking);

router.route('/:id/reschedule')
  .patch(loadBooking, rescheduleBooking);

router.route('/:id/status')
  .patch(requireRole('provider', 'worker', 'admin'), loadBooking, authorizeStatusTransition, updateBookingStatusController);

router.route('/:id/timeline')
  .get(loadBooking, requireBookingParticipant, getBookingTimeline);

router.route('/:id/review')
  .post(upload.array('images', 5), createBookingReview);

router.route('/:id/dispute-validate')
  .post(disputePayloadValidator, (req, res) => res.json({ success: true, message: 'Payload validated' }));

router.route('/:id/payment')
  .post(loadBooking, requireBookingParticipant, async (req, res, next) => {
    const { createPaymentIntent } = await import('../controllers/paymentController.js');
    return createPaymentIntent(req, res, next);
  });

export default router;
