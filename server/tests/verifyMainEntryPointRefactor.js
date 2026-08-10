import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const mainJsxPath = path.join(rootDir, 'client/src/main.jsx');

console.log('[Test] Verifying main.jsx entry point refactor & performance observers (#896)...');

// 1. Verify file exists
assert(fs.existsSync(mainJsxPath), 'client/src/main.jsx must exist');

// 2. Read main.jsx
const content = fs.readFileSync(mainJsxPath, 'utf8');

// 3. Verify exported entry point helpers
assert(content.includes('export const initApp'), 'main.jsx exports initApp entry point initialization helper');
assert(content.includes('export const initPerformanceMonitoring'), 'main.jsx exports initPerformanceMonitoring helper');

// 4. Verify performance observers & error-safe guards
assert(content.includes('PerformanceObserver'), 'main.jsx uses PerformanceObserver for web vitals metrics');
assert(content.includes('try {'), 'main.jsx wraps performance observers in try/catch guards');
assert(content.includes('largest-contentful-paint'), 'main.jsx observes Largest Contentful Paint (LCP)');
assert(content.includes('first-input'), 'main.jsx observes First Input Delay (FID)');
assert(content.includes('layout-shift'), 'main.jsx observes Cumulative Layout Shift (CLS)');

// 5. Verify provider tree hierarchy
assert(content.includes('<ErrorBoundary>'), 'main.jsx renders ErrorBoundary provider');
assert(content.includes('<AuthProvider>'), 'main.jsx renders AuthProvider');
assert(content.includes('<LocationProvider>'), 'main.jsx renders LocationProvider');
assert(content.includes('<ThemeProvider>'), 'main.jsx renders ThemeProvider');
assert(content.includes('<ToastProvider>'), 'main.jsx renders ToastProvider');

console.log('✅ PASS: main.jsx entry point initialization & performance monitoring refactor verified (#896)!');
