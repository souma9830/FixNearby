import assert from 'node:assert/strict';
import { createCivicIssuesGeoJson } from '../src/utils/civicGeoJson.js';

const collection = createCivicIssuesGeoJson([
  {
    _id: 'issue-1',
    title: 'Street light out',
    category: 'Street Light',
    status: 'open',
    upvotes: 8,
    location: { type: 'Point', coordinates: [78.4772, 17.4065] },
    reportedBy: { email: 'private@example.com' },
  },
  { id: 'issue-2', title: 'Pothole', longitude: 78.4, latitude: 17.5 },
  { id: 'invalid', longitude: 999, latitude: 17.5 },
]);

assert.equal(collection.type, 'FeatureCollection');
assert.equal(collection.features.length, 2);
assert.deepEqual(collection.features[0].geometry.coordinates, [78.4772, 17.4065]);
assert.equal(collection.features[1].properties.status, 'open');
assert.equal('reportedBy' in collection.features[0].properties, false);
assert.deepEqual(createCivicIssuesGeoJson(), { type: 'FeatureCollection', features: [] });

console.log('Civic GeoJSON verification passed');
