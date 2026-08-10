import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const mapViewPath = path.join(rootDir, 'client/src/components/MapView.jsx');
const servicesPath = path.join(rootDir, 'client/src/pages/Services.jsx');

console.log('[Test] Verifying Interactive Map View for Available Workers (#831)...');

// 1. Verify files exist
assert(fs.existsSync(mapViewPath), 'MapView.jsx must exist');
assert(fs.existsSync(servicesPath), 'Services.jsx must exist');

// 2. Read MapView.jsx
const mapViewContent = fs.readFileSync(mapViewPath, 'utf8');

// Assert Leaflet dynamic integration
assert(mapViewContent.includes('leaflet@1.9.4'), 'MapView dynamically loads Leaflet.js library');
assert(mapViewContent.includes('window.L.map'), 'MapView initializes Leaflet map instance');
assert(mapViewContent.includes('window.L.marker'), 'MapView renders worker markers/pins on map');
assert(mapViewContent.includes('window.L.circle'), 'MapView renders worker service coverage radius circle');

// Assert Worker Preview Card & Navigation
assert(mapViewContent.includes('activeWorker'), 'MapView maintains state for activeWorker preview card');
assert(mapViewContent.includes('/worker/'), 'MapView includes direct link to worker full profile');
assert(mapViewContent.includes('Service Radius'), 'MapView displays worker service coverage radius in preview card');

// 3. Read Services.jsx
const servicesContent = fs.readFileSync(servicesPath, 'utf8');
assert(servicesContent.includes("viewMode === 'map'"), 'Services page supports interactive map view mode toggle');
assert(servicesContent.includes('<MapView'), 'Services page renders MapView component in map mode');

console.log('✅ PASS: Interactive Map View feature verified successfully (#831)!');
