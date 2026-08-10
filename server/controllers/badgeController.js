import BadgeRequest from '../models/BadgeRequest.js';
import Worker from '../models/Worker.js';
import { verifyBadgeEligibility } from '../services/badgeAccreditationService.js';

export const getPendingBadgeRequests = async (req, res) => {
  try {
    const requests = await BadgeRequest.find({ status: 'pending' })
      .populate('worker', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching badge requests', error: error.message });
  }
};

export const submitBadgeRequest = async (req, res) => {
  try {
    const { badgeType, documentNumber, documentUrl } = req.body;
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const eligibility = verifyBadgeEligibility(worker.completedJobsCount || 0, worker.rating || 0, worker.isVerified || false);

    const newReq = new BadgeRequest({
      worker: worker._id,
      badgeType: req.sanitizedBadge?.badgeType || badgeType,
      documentNumber,
      documentUrl
    });

    await newReq.save();
    res.status(201).json({ success: true, request: newReq, eligibility });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting badge request', error: error.message });
  }
};

export const reviewBadgeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reviewNotes } = req.body;

    const request = await BadgeRequest.findByIdAndUpdate(
      requestId,
      { status, reviewNotes, reviewedBy: req.user.id },
      { new: true }
    );

    if (status === 'approved' && request) {
      await Worker.findByIdAndUpdate(request.worker, {
        $addToSet: { badges: request.badgeType }
      });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing badge request', error: error.message });
  }
};

export default {
  getPendingBadgeRequests,
  submitBadgeRequest,
  reviewBadgeRequest
};
