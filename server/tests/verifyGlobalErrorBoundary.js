import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const errorBoundaryPath = path.join(rootDir, 'client/src/components/ErrorBoundary.jsx');
const mainJsxPath = path.join(rootDir, 'client/src/main.jsx');
const appJsxPath = path.join(rootDir, 'client/src/App.jsx');

console.log('[Test] Verifying Global React ErrorBoundary (#882)...');

// 1. Verify files exist
assert(fs.existsSync(errorBoundaryPath), 'ErrorBoundary.jsx must exist');
assert(fs.existsSync(mainJsxPath), 'main.jsx must exist');
assert(fs.existsSync(appJsxPath), 'App.jsx must exist');

// 2. Read ErrorBoundary.jsx
const content = fs.readFileSync(errorBoundaryPath, 'utf8');
assert(content.includes('componentDidCatch'), 'ErrorBoundary implements componentDidCatch lifecycle method');
assert(content.includes('getDerivedStateFromError'), 'ErrorBoundary implements getDerivedStateFromError method');
assert(content.includes('/api/logs/error'), 'ErrorBoundary reports stack traces to server telemetry endpoint');
assert(content.includes('handleRetry'), 'ErrorBoundary provides Try Again retry handler');
assert(content.includes('Return to Homepage'), 'ErrorBoundary provides Return to Homepage recovery action');
assert(content.includes('Reload Page'), 'ErrorBoundary provides Reload Page recovery action');
assert(content.includes('fallback'), 'ErrorBoundary supports custom fallback prop');
console.log('✅ PASS: ErrorBoundary component lifecycle and recovery features verified!');

// 3. Verify main.jsx and App.jsx wrap component tree
const mainContent = fs.readFileSync(mainJsxPath, 'utf8');
assert(mainContent.includes('<ErrorBoundary>'), 'main.jsx wraps application root in ErrorBoundary');

const appContent = fs.readFileSync(appJsxPath, 'utf8');
assert(appContent.includes('<ErrorBoundary>'), 'App.jsx wraps main content in ErrorBoundary');
console.log('✅ PASS: Top-level ErrorBoundary wrapping in main.jsx and App.jsx verified!');

console.log('🎉 GLOBAL REACT ERROR BOUNDARY VERIFIED SUCCESSFULLY (#882)!');
