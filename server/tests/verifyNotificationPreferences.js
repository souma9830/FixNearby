import assert from 'node:assert/strict';
import { normalizeNotificationPreferences } from '../controllers/authController.js';

assert.deepEqual(normalizeNotificationPreferences({ email: false }), { email: false });
assert.deepEqual(
  normalizeNotificationPreferences({ email: true, sms: false, push: true, ignored: true }),
  { email: true, sms: false, push: true },
);

for (const invalid of [null, [], {}, { email: 'yes' }]) {
  assert.throws(() => normalizeNotificationPreferences(invalid), TypeError);
}

console.log('Notification preference validation tests passed.');
