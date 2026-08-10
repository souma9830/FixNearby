import ServiceSubscription from '../models/ServiceSubscription.js';

class SubscriptionSchedulerService {
  static computeNextDate(currentDate, frequency) {
    const next = new Date(currentDate);
    if (frequency === 'Weekly') next.setDate(next.getDate() + 7);
    else if (frequency === 'Bi-Weekly') next.setDate(next.getDate() + 14);
    else if (frequency === 'Monthly') next.setMonth(next.getMonth() + 1);
    else if (frequency === 'Quarterly') next.setMonth(next.getMonth() + 3);
    return next;
  }

  static async createSubscription(customerId, data) {
    const startDate = new Date(data.startDate);
    const sub = new ServiceSubscription({
      customerId,
      workerId: data.workerId,
      serviceCategory: data.serviceCategory,
      recurrenceFrequency: data.recurrenceFrequency,
      billingAmountPerCycle: data.billingAmountPerCycle,
      nextBookingDate: startDate,
      subscriptionStatus: 'Active',
    });
    return await sub.save();
  }

  static async processDueSubscriptions() {
    const now = new Date();
    const dueSubscriptions = await ServiceSubscription.find({
      nextBookingDate: { $lte: now },
      subscriptionStatus: 'Active',
    });

    const processed = [];
    for (const sub of dueSubscriptions) {
      sub.nextBookingDate = this.computeNextDate(sub.nextBookingDate, sub.recurrenceFrequency);
      await sub.save();
      processed.push(sub._id);
    }
    return processed;
  }

  static async updateSubscriptionStatus(subscriptionId, status) {
    const sub = await ServiceSubscription.findById(subscriptionId);
    if (!sub) throw new Error('Subscription not found');
    sub.subscriptionStatus = status;
    return await sub.save();
  }
}

export default SubscriptionSchedulerService;
