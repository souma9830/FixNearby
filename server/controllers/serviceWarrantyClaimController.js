import ServiceWarrantyClaim from '../models/ServiceWarrantyClaim.js';

export const submitWarrantyClaim = async (req, res, next) => {
  try {
    const { bookingId, workerId, warrantyPeriodDays, issueDescription } = req.body;
    const userId = req.user.id;

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
    const userId = req.user.id;
    const claims = await ServiceWarrantyClaim.find({ userId }).populate('bookingId').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    next(error);
  }
};

export const updateClaimStatus = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { claimStatus, scheduledRevisitDate } = req.body;

    const claim = await ServiceWarrantyClaim.findByIdAndUpdate(
      claimId,
      { claimStatus, scheduledRevisitDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Claim status updated', data: claim });
  } catch (error) {
    next(error);
  }
};
