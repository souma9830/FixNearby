import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../../docs/screenshots');

// Ensure the output directory exists before saving screenshots
fs.mkdirSync(outDir, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // First load the base URL so we can set localStorage on the right origin
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Inject a mock auth token so the chat page renders without redirecting to login
  await page.evaluate(() => {
    const mockUser = {
      _id: 'demo-user-001',
      name: 'Demo User',
      email: 'demo@fixnearby.com',
      role: 'user',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8tdXNlci0wMDEiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.mock_signature'
    };
    localStorage.setItem('fixnearby_user', JSON.stringify(mockUser));
  });

  // Now navigate to chat page
  await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);

  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('PAGE BODY (first 300 chars):', bodyText.slice(0, 300));

  // ── Screenshot 1: Chat window with Leave Feedback button visible ──
  await page.screenshot({ path: path.join(outDir, 'chat_leave_feedback_button.png'), fullPage: false });
  console.log('✅ Screenshot 1: Chat window captured');

  // ── Click Leave Feedback button ──
  const feedbackBtn = page.getByRole('button', { name: /leave feedback/i });
  const count = await feedbackBtn.count();
  console.log(`Leave Feedback buttons found: ${count}`);

  if (count > 0) {
    await feedbackBtn.first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, 'chat_feedback_modal_open.png'), fullPage: false });
    console.log('✅ Screenshot 2: Feedback modal open captured');

    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    if (await cancelBtn.count() > 0) await cancelBtn.first().click();
    else await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } else {
    console.log('⚠️  Button not found, checking all buttons:');
    const allBtns = await page.getByRole('button').allInnerTexts();
    console.log(allBtns.slice(0, 15));
    await page.screenshot({ path: path.join(outDir, 'chat_feedback_modal_open.png'), fullPage: false });
  }

  // ── Click Rating Pill → Reputation Card ──
  const ratingPill = page.getByRole('button', { name: /4\.8/i });
  if (await ratingPill.count() > 0) {
    await ratingPill.first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, 'chat_reputation_card.png'), fullPage: false });
    console.log('✅ Screenshot 3: Reputation Card captured');
  } else {
    await page.screenshot({ path: path.join(outDir, 'chat_reputation_card.png'), fullPage: false });
    console.log('⚠️  Rating pill not found');
  }

  console.log('All done!');
} catch (error) {
  console.error('❌ Screenshot script failed:', error);
  process.exitCode = 1;
} finally {
  // Always close the browser, even when the automation fails midway
  if (browser) {
    await browser.close().catch(() => {});
  }
}