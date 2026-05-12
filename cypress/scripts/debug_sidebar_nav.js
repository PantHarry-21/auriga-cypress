/**
 * Debug: navigate via sidebar links instead of direct URL
 */
const { chromium } = require('playwright');
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

async function getModuleContent(page, modName) {
  await sleep(10000);
  console.log(`URL: ${page.url()}`);

  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  // Find content area after sidebar/notifications
  const marker = 'Quick Sample Entry';
  const pos = bodyText.indexOf(marker);
  const mainContent = pos > -1 ? bodyText.substring(pos + marker.length, pos + 2000) : bodyText.substring(1500, 3500);
  console.log(`\nMain content for ${modName}:`);
  console.log(mainContent.substring(0, 1000));

  const headers = await page.locator('thead th').allInnerTexts().catch(() => []);
  console.log('Table headers:', headers);

  const btns = await page.locator('button:visible').allInnerTexts().catch(() => []);
  const filtered = btns.map(t => t.trim().replace(/\n/g,' ')).filter(t => t && t.length > 2 && t.length < 50 && !/^(Home|Logout|Module Management|Sample Management|Customer Relation|Support|Purchase|Quotation|Master Library|Document Management|Quality Document|Reports|Equipment|Inventory|Role Management|Profile|Administration|Billing|Training|Unread|Read|All )/.test(t) && !/^AD\s/.test(t));
  console.log('Page buttons:', filtered.slice(0, 20));
}

async function navigateTo(page, parentSection, linkText) {
  console.log(`\n=== Navigating: ${parentSection} > ${linkText} ===`);

  // First try clicking the section header to expand it
  if (parentSection) {
    const sectionBtns = await page.locator(`button`).filter({ hasText: parentSection }).all();
    console.log(`Found ${sectionBtns.length} buttons matching "${parentSection}"`);
    for (const btn of sectionBtns) {
      await btn.click({ force: true }).catch(() => {});
      await sleep(500);
    }
    await sleep(1000);
  }

  // Now find and click the link
  const links = await page.locator('a').filter({ hasText: linkText }).all();
  console.log(`Found ${links.length} links matching "${linkText}"`);
  for (const link of links) {
    const href = await link.getAttribute('href').catch(() => '');
    const visible = await link.isVisible().catch(() => false);
    console.log(`  link href="${href}" visible=${visible}`);
    if (visible) {
      await link.click({ force: true }).catch(() => {});
      await sleep(1000);
      console.log('Clicked! URL now:', page.url());
      return;
    }
  }

  // Fallback: try as button
  const textLinks = await page.locator(`text=${linkText}`).all();
  for (const el of textLinks) {
    const tag = await el.evaluate(e => e.tagName).catch(() => '');
    const visible = await el.isVisible().catch(() => false);
    if (visible) {
      console.log(`Clicking ${tag} with text "${linkText}"`);
      await el.click({ force: true }).catch(() => {});
      return;
    }
  }
  console.log(`Could not find link: ${linkText}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await setupPage(browser);

  try {
    await login(page);

    // Step 1: Get ALL links from dashboard sidebar
    console.log('\n=== Getting all sidebar links ===');
    await page.goto(BASE_URL + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    // Expand all sidebar sections
    const navBtns = await page.locator('nav button, aside button').all();
    console.log(`Found ${navBtns.length} nav buttons, expanding all...`);
    for (const btn of navBtns) {
      await btn.click({ force: true }).catch(() => {});
      await sleep(100);
    }
    await sleep(2000);

    // Get all links
    const allLinks = await page.locator('a[href]').all();
    console.log(`Found ${allLinks.length} links total`);
    for (const link of allLinks) {
      const href = await link.getAttribute('href').catch(() => '');
      const text = (await link.innerText().catch(() => '')).trim().replace(/\n/g,' ');
      if (href && href.includes('/dashboard/')) {
        console.log(`  ${href}  → "${text}"`);
      }
    }

    // Step 2: Try navigating to each module via sidebar links
    const navTargets = [
      { parent: 'Document Management System', link: 'Method development', mod: 'MethodDevelopment' },
      { parent: 'Document Management System', link: 'Method Validation Upload', mod: 'MethodValidation' },
      { parent: 'Quotation & Pricing', link: 'Client Quotation', mod: 'ClientQuotation' },
      { parent: 'Quotation & Pricing', link: 'Client Product Pricing', mod: 'ClientPricing' },
      { parent: 'Purchase & Indent', link: 'Indent Manage', mod: 'IndentManage' },
      { parent: 'Purchase & Indent', link: 'Admin Indent Manage', mod: 'AdminIndent' },
    ];

    for (const { parent, link, mod } of navTargets) {
      // Go back to dashboard first
      await page.goto(BASE_URL + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(2000);
      // Expand sidebar
      const navBtns2 = await page.locator('nav button, aside button').all();
      for (const btn of navBtns2) {
        await btn.click({ force: true }).catch(() => {});
        await sleep(50);
      }
      await sleep(1000);

      await navigateTo(page, parent, link);
      await getModuleContent(page, mod);
    }

  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
  }
  await browser.close();
})();
