import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../../docs/screenshots');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

// First load base url
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

// Inject admin mock user
await page.evaluate(() => {
  const mockAdmin = {
    _id: 'admin-user-999',
    name: 'System Admin',
    email: 'admin@fixnearby.com',
    role: 'admin',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItOTk5Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.mock_signature'
  };
  localStorage.setItem('fixnearby_user', JSON.stringify(mockAdmin));
});

// Navigate to admin moderation
await page.goto('http://localhost:5173/admin/moderation', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// Capture the admin moderation panel screenshot
await page.screenshot({ path: path.join(outDir, 'admin_moderation_panel.png'), fullPage: false });
console.log('✅ Screenshot captured: admin_moderation_panel.png');

await browser.close();
