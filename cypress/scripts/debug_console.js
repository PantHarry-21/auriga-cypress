/**
 * Debug: capture console errors when navigating to failing modules
 */
const { chromium } = require('playwright');
const BASE_URL = 'https://uat.ylims.com';
const CHROME = 'C:/Users/pantq/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  // Capture failed requests
  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push(`FAILED: ${req.url().substring(0, 100)} - ${req.failure()?.errorText}`);
  });

  // DO NOT stub stimulsoft - see if it loads
  // await page.route('**/stimulsoft**', route => route.fulfill({...}));

  try {
    // Login WITHOUT stimulsoft stub to see if that's the issue
    console.log('=== Testing WITHOUT Stimulsoft stub ===');
    await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.locator('[name="username"]').waitFor({ state: 'visible', timeout: 30000 });
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'Password@123');
    await page.locator('button:has-text("Sign in")').click();

    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const txt = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
      if (txt.includes('Choose your location')) break;
      if (!page.url().includes('/login')) break;
      await sleep(1000);
    }
    const txt = await page.locator('body').innerText().catch(() => '');
    if (txt.includes('Choose your location')) {
      await page.locator('button:has-text("Choose your location")').click();
      await sleep(2000);
      await page.locator('span').filter({ hasText: /Arbro/i }).first().click({ timeout: 8000 });
      await sleep(1000);
      await page.locator('button:has-text("Sign in")').click();
      await sleep(5000);
    }
    console.log('Logged in. URL:', page.url());
    consoleLogs.length = 0; failedRequests.length = 0;

    // Navigate to Method Development
    console.log('\n=== Navigating to Method Development ===');
    await page.goto(BASE_URL + '/dashboard/method/method-development', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(20000);

    console.log('\nConsole errors/warnings:');
    consoleLogs.forEach(l => console.log(' ', l));

    console.log('\nFailed requests (first 20):');
    failedRequests.slice(0, 20).forEach(r => console.log(' ', r));

    // Check the actual DOM structure of main content
    const mainContentInfo = await page.evaluate(() => {
      // Find the main content area (not sidebar, not header)
      const body = document.body;
      const allDivs = body.querySelectorAll('div');
      const info = [];
      for (const div of allDivs) {
        const rect = div.getBoundingClientRect();
        // Main content area should be large and positioned right of sidebar
        if (rect.width > 800 && rect.height > 400 && rect.left > 200) {
          info.push({
            class: div.className?.substring(0, 80),
            id: div.id,
            childCount: div.children.length,
            text: div.innerText?.substring(0, 100),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          });
        }
      }
      return info.slice(0, 10);
    });
    console.log('\nMain content divs:');
    mainContentInfo.forEach(d => console.log('  ', JSON.stringify(d)));

    // Also try clicking sidebar item
    consoleLogs.length = 0; failedRequests.length = 0;
    console.log('\n=== Clicking via sidebar: Document Management System > Method Development ===');
    await page.goto(BASE_URL + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    // Click "Document Management System" in sidebar
    await page.locator('button:has-text("Document Management System")').click({ force: true }).catch(e => console.log('DMS click error:', e.message));
    await sleep(1000);

    // Click "Method development" link
    await page.locator('a:has-text("Method development"), button:has-text("Method development")').first().click({ force: true }).catch(e => console.log('MethodDev click error:', e.message));
    await sleep(15000);

    console.log('URL after sidebar click:', page.url());
    const bodyAfter = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'ERROR');
    // Find content AFTER the sidebar
    const sidebarEnd = bodyAfter.indexOf('Quick Sample Entry');
    const afterSidebar = sidebarEnd > -1 ? bodyAfter.substring(sidebarEnd + 20, sidebarEnd + 1000) : bodyAfter.substring(500, 1500);
    console.log('Content after sidebar:');
    console.log(afterSidebar);

    console.log('\nConsole errors after sidebar nav:');
    consoleLogs.forEach(l => console.log(' ', l));

  } catch (e) {
    console.error('FATAL:', e.message);
  }
  await browser.close();
})();
