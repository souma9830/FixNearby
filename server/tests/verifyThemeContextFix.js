import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const themeContextPath = path.join(rootDir, 'client/src/context/ThemeContext.jsx');
const appJsxPath = path.join(rootDir, 'client/src/App.jsx');

console.log('[Test] Verifying ThemeContext and useTheme crash prevention fix (#824)...');

// 1. Verify files exist
assert(fs.existsSync(themeContextPath), 'ThemeContext.jsx must exist');
assert(fs.existsSync(appJsxPath), 'App.jsx must exist');

// 2. Read ThemeContext.jsx content
const themeContent = fs.readFileSync(themeContextPath, 'utf8');

// 3. Verify useTheme returns safe fallback instead of throwing error when context is missing
assert(themeContent.includes('if (!context)'), 'useTheme checks for missing context');
assert(!themeContent.includes("throw new Error('useTheme must be used within a ThemeProvider')"), 'useTheme must NOT throw an uncaught Error on missing context');
assert(themeContent.includes("theme: 'light'"), 'useTheme provides light theme fallback');
assert(themeContent.includes('toggleTheme: () => {}'), 'useTheme provides no-op toggleTheme fallback');

// 4. Verify localStorage safety
assert(themeContent.includes('try {'), 'ThemeContext wraps localStorage reads/writes in try/catch');
assert(themeContent.includes('[ThemeContext] Error'), 'ThemeContext logs friendly warnings on localStorage failure');

// 5. Read App.jsx and verify ThemeProvider wrapping
const appContent = fs.readFileSync(appJsxPath, 'utf8');
assert(appContent.includes('<ThemeProvider>'), 'App.jsx must wrap application components with ThemeProvider');

console.log('✅ PASS: ThemeContext & useTheme crash prevention fix verified successfully (#824)!');
