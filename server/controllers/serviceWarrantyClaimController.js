import ServiceWarrantyClaim from '../models/ServiceWarrantyClaim.js';
import WarrantyClaimResolutionAudit from '../models/WarrantyClaimResolutionAudit.js';

export const submitWarrantyClaim = async (req, res, next) => {
  try {
    const { bookingId, workerId, warrantyPeriodDays, issueDescription } = req.body;
    const userId = req.user._id || req.user.id;

    const claim = await ServiceWarrantyClaim.create({
      bookingId,
      userId,
      workerId,
      warrantyPeriodDays,
      issueDescription,
      claimStatus: 'submitted',
    });

    res.status(201).json({ success: true, message: 'Warranty claim filed successfully', data: claim });
  } catch (error) {
    next(error);
  }
};

export const getClaimsForUser = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const claims = await ServiceWarrantyClaim.find({ userId }).populate('bookingId').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    next(error);
  }
};

export const updateClaimStatus = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { claimStatus, scheduledRevisitDate, resolutionSummary } = req.body;

    const existingClaim = await ServiceWarrantyClaim.findById(claimId);
    if (!existingClaim) {
      return res.status(404).json({ success: false, message: 'Warranty claim not found' });
    }

    const previousStatus = existingClaim.claimStatus;
    existingClaim.claimStatus = claimStatus || existingClaim.claimStatus;
    if (scheduledRevisitDate) existingClaim.scheduledRevisitDate = scheduledRevisitDate;
    await existingClaim.save();

    await WarrantyClaimResolutionAudit.create({
      claimId: existingClaim._id,
      actionTakenBy: req.user._id || req.user.id,
      previousClaimStatus: previousStatus,
      newClaimStatus: existingClaim.claimStatus,
      resolutionSummary: resolutionSummary || `Status updated from ${previousStatus} to ${existingClaim.claimStatus}`,
      dispatchedWorkerRevisitId: existingClaim.workerId,
    });

    res.status(200).json({ success: true, message: 'Claim status updated and resolution audit recorded', data: existingClaim });
  } catch (error) {
    next(error);
  }
};

