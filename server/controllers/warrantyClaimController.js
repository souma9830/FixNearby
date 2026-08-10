import WarrantyClaimService from '../services/warrantyClaimService.js';

export const submitClaim = async (req, res) => {
  try {
    const customerId = req.user ? req.user.id : req.body.customerId;
    const claim = await WarrantyClaimService.fileClaim({
      ...req.body,
      customerId,
    }, req.body.jobCompletionDate);
    return res.status(201).json({
      success: true,
      message: 'Warranty claim filed successfully under 30-day guarantee.',
      data: claim,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resolveClaim = async (req, res) => {
  try {
    const { resolutionSummary, status } = req.body;
    const claim = await WarrantyClaimService.resolveClaim(req.params.claimId, resolutionSummary, status);
    return res.status(200).json({
      success: true,
      message: 'Warranty claim status updated.',
      data: claim,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerClaims = async (req, res) => {
  try {
    const customerId = req.params.customerId || (req.user && req.user.id);
    const claims = await WarrantyClaimService.getClaimsByCustomer(customerId);
    return res.status(200).json({
      success: true,
      data: claims,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getClaimById = async (req, res) => {
  try {
    const claim = await WarrantyClaimService.getClaimById(req.params.claimId);
    return res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
