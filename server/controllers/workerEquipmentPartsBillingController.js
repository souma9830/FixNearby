import WorkerEquipmentPartsBilling from '../models/WorkerEquipmentPartsBilling.js';

export const createPartsBillingInvoice = async (req, res, next) => {
  try {
    const { bookingId, partsUsed } = req.body;
    const workerId = req.user.id;

    const subtotalPartsCost = partsUsed.reduce((acc, part) => {
      const price = part.unitPrice * (1 + (part.markupPercentage || 0) / 100);
      return acc + price * part.quantity;
    }, 0);

    const invoice = await WorkerEquipmentPartsBilling.create({
      workerId,
      bookingId,
      partsUsed,
      subtotalPartsCost,
      billingStatus: 'submitted',
    });

    res.status(201).json({ success: true, message: 'Parts billing invoice created', data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getPartsInvoiceByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const invoice = await WorkerEquipmentPartsBilling.findOne({ bookingId }).populate('workerId');

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};
