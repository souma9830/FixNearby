import assert from 'node:assert/strict';
import {
  MAX_RECENT_WORKERS,
  RECENT_WORKERS_KEY,
  addRecentWorker,
  clearRecentWorkers,
  getRecentWorkers,
  removeRecentWorker,
} from '../src/utils/recentWorkers.js';

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};

for (let index = 1; index <= MAX_RECENT_WORKERS + 2; index += 1) {
  addRecentWorker({ id: `worker-${index}`, name: `Worker ${index}` }, storage);
}
assert.equal(getRecentWorkers(storage).length, MAX_RECENT_WORKERS);
assert.equal(getRecentWorkers(storage)[0].id, `worker-${MAX_RECENT_WORKERS + 2}`);

addRecentWorker({ id: 'worker-4', name: 'Updated Worker', rating: 4.8 }, storage);
assert.equal(getRecentWorkers(storage)[0].name, 'Updated Worker');
assert.equal(getRecentWorkers(storage).filter(({ id }) => id === 'worker-4').length, 1);

removeRecentWorker('worker-4', storage);
assert.equal(getRecentWorkers(storage).some(({ id }) => id === 'worker-4'), false);

values.set(RECENT_WORKERS_KEY, '{broken-json');
assert.deepEqual(getRecentWorkers(storage), []);
assert.equal(values.has(RECENT_WORKERS_KEY), false);

clearRecentWorkers(storage);
assert.deepEqual(getRecentWorkers(storage), []);
console.log('Recently viewed workers verification passed');
