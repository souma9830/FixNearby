import assert from 'node:assert/strict';
import { normalizeWorkerRating } from '../controllers/favoriteController.js';

assert.equal(normalizeWorkerRating(0), 0);
assert.equal(normalizeWorkerRating(4.7), 4.7);
assert.equal(normalizeWorkerRating(null), 0);
assert.equal(normalizeWorkerRating(undefined), 0);

console.log('Favorite worker rating normalization tests passed.');
