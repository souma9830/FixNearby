import { evaluateExpiredBookings } from '../services/bookingWatchdogService.js';

async function runTests() {
  console.log('Running Booking Watchdog Service Tests...');

  const mockBookings = [
    { _id: 'b1', status: 'Pending', createdAt: new Date(Date.now() - 120 * 60 * 1000), save() { this.saved = true; } },
    { _id: 'b2', status: 'Pending', createdAt: new Date(Date.now() - 10 * 60 * 1000), save() { this.saved = true; } }
  ];

  const MockBookingModel = {
    async find(query) {
      return mockBookings.filter(b => b.status === query.status && b.createdAt <= query.createdAt.$lte);
    }
  };

  const result = await evaluateExpiredBookings(MockBookingModel, { timeoutMinutes: 60 });

  if (result.expiredCount !== 1) {
    throw new Error(`Test 1 Failed: Expected 1 expired booking, got ${result.expiredCount}`);
  }
  if (mockBookings[0].status !== 'Expired') {
    throw new Error('Test 1 Failed: Booking status not updated to Expired');
  }
  console.log('✓ Test 1 Passed: Stale booking correctly identified and expired.');

  console.log('All Booking Watchdog Service tests passed successfully!');
}

runTests();
