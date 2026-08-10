import ServicePartsInventory from '../models/ServicePartsInventory.js';

class PartsBillingService {
  static calculateTotalCost(items) {
    return items.reduce((total, item) => {
      const markup = item.markupPercentage || 10;
      const finalUnitCost = item.unitCostUSD * (1 + markup / 100);
      return total + finalUnitCost * item.quantity;
    }, 0);
  }

  static async submitPartsInvoice(workerId, payload) {
    const totalCost = this.calculateTotalCost(payload.items);

    let inventory = await ServicePartsInventory.findOne({ bookingId: payload.bookingId });
    if (!inventory) {
      inventory = new ServicePartsInventory({
        bookingId: payload.bookingId,
        workerId,
      });
    }

    inventory.items = payload.items;
    inventory.totalMaterialCostUSD = totalCost;
    inventory.receiptUrl = payload.receiptUrl || null;
    inventory.approvalStatus = 'Pending Customer Approval';

    return await inventory.save();
  }

  static async respondApproval(bookingId, approvalStatus) {
    const inventory = await ServicePartsInventory.findOne({ bookingId });
    if (!inventory) throw new Error('Parts inventory record not found');

    const validStatuses = ['Approved', 'Rejected'];
    if (!validStatuses.includes(approvalStatus)) throw new Error('Invalid approval status');

    inventory.approvalStatus = approvalStatus;
    return await inventory.save();
  }

  static async getPartsForBooking(bookingId) {
    return await ServicePartsInventory.findOne({ bookingId });
  }
}

export default PartsBillingService;
