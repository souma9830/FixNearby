import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const ciWorkflowPath = path.join(rootDir, '.github/workflows/ci.yml');

console.log('[Test] Verifying GitHub Action CI Workflow setup (#845)...');

// 1. Verify workflow file exists
assert(fs.existsSync(ciWorkflowPath), '.github/workflows/ci.yml must exist');

// 2. Read workflow content
const content = fs.readFileSync(ciWorkflowPath, 'utf8');

// 3. Verify triggers
assert(content.includes('push:'), 'CI workflow must trigger on push');
assert(content.includes('pull_request:'), 'CI workflow must trigger on pull_request');
assert(content.includes('master') || content.includes('main'), 'CI workflow must target master/main branches');

// 4. Verify pipeline stages
assert(content.includes('actions/checkout@v4'), 'CI workflow must checkout repository code');
assert(content.includes('actions/setup-node@v4'), 'CI workflow must set up Node.js environment');
assert(content.includes('npm install'), 'CI workflow must install dependencies');
assert(content.includes('prettier'), 'CI workflow must verify code formatting');
assert(content.includes('lint'), 'CI workflow must execute linters');
assert(content.includes('node server/tests/'), 'CI workflow must execute test suite');
assert(content.includes('build'), 'CI workflow must execute client build');

console.log('✅ PASS: GitHub Action CI Workflow verified successfully (#845)!');
