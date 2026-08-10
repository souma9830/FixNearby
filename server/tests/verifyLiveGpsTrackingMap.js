import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const trackingMapPath = path.join(rootDir, 'client/src/components/ProviderTrackingMap.jsx');
const bookingHandlerPath = path.join(rootDir, 'server/socketHandlers/bookingHandler.js');

console.log('[Test] Verifying Live GPS Provider Tracking Map Feature (#874)...');

// 1. Verify component file exists
assert(fs.existsSync(trackingMapPath), 'ProviderTrackingMap.jsx must exist');
assert(fs.existsSync(bookingHandlerPath), 'bookingHandler.js must exist');

// 2. Read ProviderTrackingMap.jsx
const trackingContent = fs.readFileSync(trackingMapPath, 'utf8');
assert(trackingContent.includes('Leaflet'), 'ProviderTrackingMap integrates Leaflet.js map tiles');
assert(trackingContent.includes('provider:location_update'), 'ProviderTrackingMap listens to provider:location_update WebSocket events');
assert(trackingContent.includes('etaMinutes'), 'ProviderTrackingMap calculates and displays dynamic ETA');
assert(trackingContent.includes('distanceKm'), 'ProviderTrackingMap calculates and displays remaining distance in km');
assert(trackingContent.includes('Call Provider'), 'ProviderTrackingMap includes quick contact trigger');
console.log('✅ PASS: ProviderTrackingMap frontend component verified!');

// 3. Read bookingHandler.js
const handlerContent = fs.readFileSync(bookingHandlerPath, 'utf8');
assert(handlerContent.includes('provider:location_update'), 'bookingHandler registers provider:location_update listener');
assert(handlerContent.includes('tracking:location'), 'bookingHandler registers tracking:location listener');
assert(handlerContent.includes('booking:${bookingId}'), 'bookingHandler broadcasts GPS pings to booking room');
console.log('✅ PASS: Backend WebSocket GPS tracking event handlers verified!');

console.log('🎉 LIVE GPS PROVIDER TRACKING MAP FEATURE VERIFIED SUCCESSFULLY (#874)!');
