/**
 * Debug: screenshot + full page source for failing modules
 */
const { chromium } = require('playwright');
const fs = require('fs');
const BASE_URL = 'https://uat.ylims.com';
const CHROME = 'C:/Users/pantq/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setupPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/stimulsoft**', route => {
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub */' });
  });
  return page;
}

async function login(page) {
  await page.goto(BASE_URL + '/login', { waitUntil: 'commit', timeout: 90000 });
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
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await setupPage(browser);

  try {
    await login(page);

    const modules = [
      { mod: 'ClientPricing',    url: '/dashboard/accounts/client-pricing' },
      { mod: 'MethodDevelopment', url: '/dashboard/method/method-development' },
    ];

    for (const { mod, url } of modules) {
      console.log(`\n=== ${mod}: ${url} ===`);
      await page.goto(BASE_URL + url, { waitUntil: 'commit', timeout: 60000 });
      console.log('URL after goto:', page.url());

      // Wait 30 seconds for content
      console.log('Waiting 30 seconds...');
      await sleep(30000);
      console.log('URL after wait:', page.url());

      // Get all visible text
      const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'ERROR');
      console.log('Body text (first 2000 chars):', bodyText.substring(0, 2000));

      // Screenshot
      const screenshotPath = `cypress/scripts/${mod}_debug.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Screenshot saved: ${screenshotPath}`);

      // Check all elements
      const allElements = await page.evaluate(() => {
        const interesting = [];
        document.querySelectorAll('button, table, thead, input, select, h1, h2, h3, [role="tab"], [role="dialog"]').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            interesting.push({
              tag: el.tagName,
              role: el.getAttribute('role'),
              text: el.innerText?.substring(0, 50),
              class: el.className?.substring(0, 50),
            });
          }
        });
        return interesting.slice(0, 50);
      });
      console.log('Visible elements:', JSON.stringify(allElements, null, 2).substring(0, 3000));
    }

  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
  }
  await browser.close();
})();
