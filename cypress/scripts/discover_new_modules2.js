/**
 * Phase 2: Deeper discovery for modules that loaded partially
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

// Wait for page-specific content (not just sidebar)
async function waitForPage(page, maxMs = 20000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    // Look for things that indicate a MODULE page loaded (not just sidebar)
    const tbl = await page.locator('thead th').count().catch(() => 0);
    const newBtnCount = await page.locator('button:visible').filter({ hasText: /new|add|create/i }).count().catch(() => 0);
    const tabCount = await page.locator('[role="tab"]:visible').count().catch(() => 0);
    const mainContent = await page.locator('main table, main form, main [role="grid"], .content table').count().catch(() => 0);
    if (tbl > 0 || newBtnCount > 0 || tabCount > 2 || mainContent > 0) return true;
    await sleep(800);
  }
  return false;
}

async function getInfo(page, label) {
  console.log(`\n${'─'.repeat(60)}\n${label}\n${'─'.repeat(60)}`);
  // Only buttons not in sidebar
  const btns = await page.locator('button:visible').all();
  const btnTxts = [];
  for (const b of btns) {
    const t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
    if (t && !['Home','Logout','Module Management','Sample Management','Customer Relation Management','Support','Purchase & Indent','Quotation & Pricing','Master Library','Document Management System','Quality Document Management System','Reports & COC','Equipment management','Inventory Management','Role Management','Profile Master','Administration','Billing and Invoicing','Training'].includes(t)) {
      btnTxts.push(t);
    }
  }
  console.log('Page buttons:', btnTxts.slice(0,25));
  const headers = await page.locator('thead th').allInnerTexts().catch(() => []);
  console.log('Table headers:', headers.map(t => t.trim()).filter(Boolean));
  const tabs = await page.locator('[role="tab"]:visible').allInnerTexts().catch(() => []);
  if (tabs.length) console.log('Tabs:', tabs.map(t => t.trim()).filter(Boolean));
  const labels = await page.locator('label:visible').allInnerTexts().catch(() => []);
  console.log('Labels:', labels.map(t => t.trim()).filter(t => t && t.length < 80).slice(0,25));
  const inputs = await page.locator('input:visible').all();
  for (const inp of inputs) {
    const type = await inp.getAttribute('type').catch(() => '');
    if (type === 'hidden') continue;
    const ph = await inp.getAttribute('placeholder').catch(() => '');
    const nm = await inp.getAttribute('name').catch(() => '');
    const id = await inp.getAttribute('id').catch(() => '');
    console.log(`  input[${type}] ph="${ph}" name="${nm}" id="${id}"`);
  }
  const tas = await page.locator('textarea:visible').all();
  for (const ta of tas) console.log('  textarea ph:', await ta.getAttribute('placeholder').catch(() => ''));
  const combos = await page.locator('[role="combobox"]:visible').all();
  console.log(`  comboboxes: ${combos.length}`);
  for (let i = 0; i < Math.min(combos.length, 15); i++) {
    const ph = await combos[i].getAttribute('placeholder').catch(() => '');
    const al = await combos[i].getAttribute('aria-label').catch(() => '');
    console.log(`    combo[${i}] ph="${ph}" aria="${al}"`);
  }
  const fileCnt = await page.locator('input[type="file"]').count().catch(() => 0);
  console.log(`  file inputs: ${fileCnt}`);
  // Row count
  const rows = await page.locator('tbody tr').count().catch(() => 0);
  console.log(`  table rows: ${rows}`);
}

async function discoverModule(page, mod, url) {
  console.log(`\n${'='.repeat(60)}\n${mod}: ${url}\n${'='.repeat(60)}`);
  await page.goto(BASE_URL + url, { waitUntil: 'commit', timeout: 60000 });
  const ok = await waitForPage(page, 20000);
  if (!ok) {
    console.log('WARNING: Page may not have loaded fully');
  }
  await getInfo(page, `${mod}_LIST`);

  // Find create button
  const allBtns = await page.locator('button:visible').all();
  let createBtn = null;
  let createBtnTxt = '';
  for (const b of allBtns) {
    const t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
    if (/new|add|create/i.test(t) && t.length < 60 && !['Home','Logout'].includes(t)) {
      createBtn = b; createBtnTxt = t; break;
    }
  }
  if (createBtn) {
    console.log(`\n→ Clicking "${createBtnTxt}"`);
    await createBtn.click({ force: true }).catch(() => {});
    await sleep(4000);
    await getInfo(page, `${mod}_FORM`);
    const c = page.locator('button:has-text("Cancel")').first();
    if (await c.isVisible({ timeout: 2000 }).catch(() => false)) await c.click();
    else await page.keyboard.press('Escape');
    await sleep(1000);
  }

  // Row actions
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.isVisible({ timeout: 2000 }).catch(() => false)) {
    const rowBtns = await firstRow.locator('button').all();
    const rowInfo = [];
    for (const b of rowBtns) {
      const t = (await b.innerText().catch(() => '')).trim();
      const title = await b.getAttribute('title').catch(() => '');
      rowInfo.push({ text: t || title });
    }
    console.log('Row actions:', JSON.stringify(rowInfo));
    // Click last button (actions menu)
    if (rowBtns.length > 0) {
      await rowBtns[rowBtns.length-1].click({ force: true }).catch(() => {});
      await sleep(1000);
      const menuItems = await page.locator('[role="menuitem"]:visible, [role="option"]:visible').all();
      const mTxts = [];
      for (const m of menuItems) { const t = (await m.innerText().catch(() => '')).trim(); if (t) mTxts.push(t); }
      if (mTxts.length) console.log('Menu items:', mTxts);
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await setupPage(browser);

  try {
    await login(page);

    const modules = [
      { mod: 'ClientPricing', url: '/dashboard/accounts/client-pricing' },
      { mod: 'ClientQuotation', url: '/dashboard/accounts/quotation' },
      { mod: 'IndentManagement', url: '/dashboard/inventory/indent-manage' },
      { mod: 'AdminIndent', url: '/dashboard/inventory/admin-indent' },
      { mod: 'MethodUpload', url: '/dashboard/method/method-upload' },
      { mod: 'MethodValidation', url: '/dashboard/method/method-validation-upload' },
      { mod: 'MethodDevelopment', url: '/dashboard/method/method-development' },
    ];

    for (const { mod, url } of modules) {
      await discoverModule(page, mod, url);
    }

  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
  }
  await browser.close();
})();
