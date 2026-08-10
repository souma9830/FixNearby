import assert from 'node:assert/strict';
import { buildWorkerComparisonRows } from '../src/utils/workerComparisonExport.js';

const rows = buildWorkerComparisonRows([{
  name: 'Asha Repairs',
  category: 'Electrician',
  price: 450,
  averageRating: 4.9,
  experience: '8 years',
  location: { city: 'Hyderabad' },
  availabilityStatus: 'available',
  verified: true,
  completedJobs: 42,
  slaResponseMins: 15,
}]);

assert.deepEqual(rows, [{
  Name: 'Asha Repairs',
  Category: 'Electrician',
  'Hourly rate': 450,
  Rating: 4.9,
  Experience: '8 years',
  Location: 'Hyderabad',
  Availability: 'available',
  Verified: 'Yes',
  'Completed jobs': 42,
  'Response time': '15 min',
}]);

assert.deepEqual(buildWorkerComparisonRows([{ name: 'Fallback Worker' }]), [{
  Name: 'Fallback Worker',
  Category: 'N/A',
  'Hourly rate': 'N/A',
  Rating: 'N/A',
  Experience: 'N/A',
  Location: 'N/A',
  Availability: 'N/A',
  Verified: 'No',
  'Completed jobs': 0,
  'Response time': 'N/A',
}]);

assert.deepEqual(buildWorkerComparisonRows(), []);
console.log('Worker comparison export verification passed');
