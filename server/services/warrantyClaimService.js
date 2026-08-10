import ServiceWarrantyClaim from '../models/ServiceWarrantyClaim.js';

class WarrantyClaimService {
  static async fileClaim(payload, jobCompletionDate) {
    const warrantyDurationMs = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const completionTime = new Date(jobCompletionDate || Date.now());

    if (now - completionTime > warrantyDurationMs) {
      throw new Error('Warranty period (30 days) has expired for this booking.');
    }

    const existing = await ServiceWarrantyClaim.findOne({
      bookingId: payload.bookingId,
      claimStatus: { $ne: 'Claim Rejected' },
    });

    if (existing) {
      throw new Error('A warranty claim has already been filed for this booking.');
    }

    const claim = new ServiceWarrantyClaim({
      bookingId: payload.bookingId,
      customerId: payload.customerId,
      originalWorkerId: payload.originalWorkerId,
      claimDescription: payload.claimDescription,
      defectPhotos: payload.defectPhotos || [],
      claimStatus: 'Claim Filed',
    });

    return await claim.save();
  }

  static async resolveClaim(claimId, resolutionSummary, status = 'Claim Resolved') {
    const claim = await ServiceWarrantyClaim.findById(claimId);
    if (!claim) throw new Error('Warranty claim not found');

    claim.claimStatus = status;
    claim.resolutionSummary = resolutionSummary;
    return await claim.save();
  }

  static async getClaimsByCustomer(customerId) {
    return await ServiceWarrantyClaim.find({ customerId }).sort({ createdAt: -1 });
  }
}

export default WarrantyClaimService;
