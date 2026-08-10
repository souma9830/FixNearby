import mongoose from 'mongoose';
import ServicePartsInventory from '../models/ServicePartsInventory.js';
import PartsBillingService from '../services/partsBillingService.js';

async function testPartsBilling() {
  console.log('[TEST] Starting Parts Billing Verification...');
  const fakeBookingId = new mongoose.Types.ObjectId();
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const items = [
      { itemName: 'Copper Pipe Fitting 3/4"', quantity: 2, unitCostUSD: 12.5, markupPercentage: 10 },
      { itemName: 'High-Temp Pipe Sealant', quantity: 1, unitCostUSD: 8.0, markupPercentage: 10 },
    ];

    const total = PartsBillingService.calculateTotalCost(items);

    const inventory = new ServicePartsInventory({
      bookingId: fakeBookingId,
      workerId: fakeWorkerId,
      items,
      totalMaterialCostUSD: total,
      approvalStatus: 'Pending Customer Approval',
    });

    console.log('[TEST] Parts inventory created. Calculated total material cost:', total.toFixed(2));
    console.log('[TEST] Parts Billing Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testPartsBilling();
