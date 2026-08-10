import PartsBillingService from '../services/partsBillingService.js';

export const addPartsInvoice = async (req, res) => {
  try {
    const workerId = req.user ? req.user.id : req.body.workerId;
    const inventory = await PartsBillingService.submitPartsInvoice(workerId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Itemized parts invoice submitted for customer approval.',
      data: inventory,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateApproval = async (req, res) => {
  try {
    const { bookingId, approvalStatus } = req.body;
    const inventory = await PartsBillingService.respondApproval(bookingId, approvalStatus);
    return res.status(200).json({
      success: true,
      message: `Parts invoice ${approvalStatus.toLowerCase()}.`,
      data: inventory,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getParts = async (req, res) => {
  try {
    const inventory = await PartsBillingService.getPartsForBooking(req.params.bookingId);
    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePartsInvoice = async (req, res) => {
  try {
    const inventory = await PartsBillingService.deletePartsInvoice(req.params.bookingId);
    return res.status(200).json({
      success: true,
      message: 'Parts invoice removed',
      data: inventory
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
