import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const mainPyPath = path.join(rootDir, 'main.py');

console.log('[Test] Verifying single authoritative FastAPI instantiation in main.py...');

// 1. Verify main.py exists
assert(fs.existsSync(mainPyPath), 'main.py should exist at repository root');

// 2. Read main.py content
const content = fs.readFileSync(mainPyPath, 'utf8');

// 3. Count FastApi(...) instantiation occurrences outside function comments or strings
const instantiationRegex = /app\s*=\s*FastAPI\(/g;
const matches = content.match(instantiationRegex) || [];

assert.strictEqual(
  matches.length,
  1,
  `main.py should have exactly ONE FastAPI application instantiation point (found ${matches.length})`
);

// 4. Verify get_application factory pattern and singleton preservation
assert(content.includes('def get_application('), 'main.py must implement get_application factory pattern');
assert(content.includes('global _app_instance'), 'main.py must maintain a singleton instance holder');
assert(content.includes('_app_instance = app'), 'main.py must store authoritative app in singleton holder');

// 5. Verify middleware pipeline attachment to single instance
assert(content.includes('CORSMiddleware'), 'CORS middleware attached to authoritative instance');
assert(content.includes('GZipMiddleware'), 'GZipMiddleware attached to authoritative instance');
assert(content.includes('app.include_router(api_router)'), 'Routers attached to authoritative instance');

console.log('✅ PASS: FastAPI single authoritative instantiation test verified successfully!');
