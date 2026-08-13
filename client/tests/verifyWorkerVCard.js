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

const baseWorker = {
  name: 'Ravi Kumar',
  profession: 'Plumber',
  rating: 4.2,
  verificationStatus: 'verified',
};

assert.doesNotMatch(createWorkerVCard(baseWorker, 'https://fixnearby.example/worker/1'), /ADR:/,
  'missing location must not emit an ADR line');
assert.doesNotMatch(createWorkerVCard({ ...baseWorker, location: null }, 'https://fixnearby.example/worker/2'), /ADR:/,
  'null location must not emit an ADR line');
assert.doesNotMatch(createWorkerVCard({ ...baseWorker, location: {} }, 'https://fixnearby.example/worker/3'), /ADR:/,
  'empty object location must not emit an ADR line');
assert.match(createWorkerVCard({ ...baseWorker, location: 'Bengaluru' }, 'https://fixnearby.example/worker/4'),
  /ADR:;;Bengaluru;;;;/, 'string location must be used verbatim');
assert.match(createWorkerVCard({
  ...baseWorker,
  location: { address: '10/2 MG Road', city: 'Pune' },
}, 'https://fixnearby.example/worker/5'),
  /ADR:;;10\/2 MG Road\\, Pune;;;;/, 'partial location must join only present fields');

console.log('Worker vCard verification passed');
