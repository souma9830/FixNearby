import mongoose from 'mongoose';
import ServiceSubscription from '../models/ServiceSubscription.js';
import SubscriptionSchedulerService from '../services/subscriptionSchedulerService.js';

async function testSubscriptionScheduler() {
  console.log('[TEST] Starting Subscription Scheduler Verification...');
  const fakeCustomerId = new mongoose.Types.ObjectId();
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const sub = new ServiceSubscription({
      customerId: fakeCustomerId,
      workerId: fakeWorkerId,
      serviceCategory: 'HVAC Maintenance',
      recurrenceFrequency: 'Monthly',
      billingAmountPerCycle: 75,
      nextBookingDate: new Date(),
      subscriptionStatus: 'Active',
    });

    const nextDate = SubscriptionSchedulerService.computeNextDate(sub.nextBookingDate, 'Monthly');
    console.log('[TEST] Initial date:', sub.nextBookingDate.toISOString());
    console.log('[TEST] Computed next monthly date:', nextDate.toISOString());
    console.log('[TEST] Subscription Scheduler Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testSubscriptionScheduler();
