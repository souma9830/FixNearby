import assert from 'node:assert/strict';
import { createWorkerVCard } from '../src/utils/workerVCard.js';

const card = createWorkerVCard({
  name: 'Asha; Rao',
  profession: 'Electrical, Repair',
  rating: 4.9,
  verificationStatus: 'verified',
  location: { address: '12 Main Road', city: 'Hyderabad', country: 'India' },
  email: 'private@example.com',
  phone: '+91-0000000000',
}, 'https://fixnearby.example/worker/42');

assert.ok(card.startsWith('BEGIN:VCARD\r\nVERSION:3.0'));
assert.match(card, /FN:Asha\\; Rao/);
assert.match(card, /TITLE:Electrical\\, Repair/);
assert.match(card, /ADR:;;12 Main Road\\, Hyderabad\\, India;;;;/);
assert.match(card, /URL:https:\/\/fixnearby\.example\/worker\/42/);
assert.match(card, /NOTE:FixNearby Electrical\\, Repair\. Rating: 4\.9\/5\. Verified professional/);
assert.doesNotMatch(card, /private@example\.com/);
assert.doesNotMatch(card, /0000000000/);
assert.ok(card.endsWith('\r\n'));
assert.throws(() => createWorkerVCard({}), /Worker name is required/);

console.log('Worker vCard verification passed');
