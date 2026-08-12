import WorkerEquipmentPartsBilling from '../models/WorkerEquipmentPartsBilling.js';
import PartsInventoryReorderLog from '../models/PartsInventoryReorderLog.js';

export const createPartsBillingInvoice = async (req, res, next) => {
  try {
    const { bookingId, partsUsed } = req.body;
    const workerId = req.user._id || req.user.id;

    const subtotalPartsCost = (partsUsed || []).reduce((acc, part) => {
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

    // Check for low stock items and log reorder triggers
    if (partsUsed && partsUsed.length > 0) {
      for (const part of partsUsed) {
        if (part.remainingQuantity !== undefined && part.remainingQuantity < 5) {
          await PartsInventoryReorderLog.create({
            workerId,
            partName: part.partName,
            partNumber: part.partNumber || 'AUTO-PN',
            currentStockLevel: part.remainingQuantity,
            reorderThreshold: 5,
            recommendedRestockQty: 20,
            autoReorderTriggered: true,
          });
        }
      }
    }

    res.status(201).json({ success: true, message: 'Parts billing invoice created and inventory threshold evaluated', data: invoice });
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

