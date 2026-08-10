import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const prettierRcPath = path.join(rootDir, '.prettierrc');
const prettierIgnorePath = path.join(rootDir, '.prettierignore');
const rootPkgPath = path.join(rootDir, 'package.json');

console.log('[Test] Verifying Prettier setup and configuration (#844)...');

// 1. Verify .prettierrc exists and has valid configuration
assert(fs.existsSync(prettierRcPath), '.prettierrc must exist at repository root');
const prettierConfig = JSON.parse(fs.readFileSync(prettierRcPath, 'utf8'));
assert.strictEqual(prettierConfig.semi, true, '.prettierrc must configure semi: true');
assert.strictEqual(prettierConfig.singleQuote, true, '.prettierrc must configure singleQuote: true');
assert.strictEqual(prettierConfig.tabWidth, 2, '.prettierrc must configure tabWidth: 2');
assert.strictEqual(prettierConfig.printWidth, 100, '.prettierrc must configure printWidth: 100');
console.log('✅ PASS: .prettierrc configuration verified!');

// 2. Verify .prettierignore exists and excludes build/dependency artifacts
assert(fs.existsSync(prettierIgnorePath), '.prettierignore must exist at repository root');
const ignoreContent = fs.readFileSync(prettierIgnorePath, 'utf8');
assert(ignoreContent.includes('node_modules/'), '.prettierignore must ignore node_modules/');
assert(ignoreContent.includes('coverage/'), '.prettierignore must ignore coverage/');
assert(ignoreContent.includes('package-lock.json'), '.prettierignore must ignore package-lock.json');
console.log('✅ PASS: .prettierignore configuration verified!');

// 3. Verify format and format:check scripts in root package.json
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
assert(rootPkg.scripts && rootPkg.scripts.format, 'package.json must contain format script');
assert(rootPkg.scripts && rootPkg.scripts['format:check'], 'package.json must contain format:check script');
console.log('✅ PASS: npm format scripts verified in package.json!');

console.log('🎉 PRETTIER INTEGRATION TESTS PASSED SUCCESSFULLY (#844)!');
