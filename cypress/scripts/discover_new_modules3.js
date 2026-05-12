/**
 * Phase 3: Aggressive discovery with longer waits and full-page scroll
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
  await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.locator('[name="username"]').waitFor({ state: 'visible', timeout: 30000 });
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'Password@123');
  await page.locator('button:has-text("Sign in")').click();
  const deadline = Date.now() + 25000;
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
    await sleep(6000);
  }
  console.log('Logged in. URL:', page.url());
}

// Wait for actual module content (not just header/sidebar)
async function waitForModuleContent(page, maxMs = 60000) {
  const deadline = Date.now() + maxMs;
  let lastStatus = '';
  while (Date.now() < deadline) {
    const tbl = await page.locator('thead th').count().catch(() => 0);
    const newBtn = await page.locator('button:visible').filter({ hasText: /new|add|create|upload/i }).count().catch(() => 0);
    const tabs = await page.locator('[role="tab"]:visible').count().catch(() => 0);
    const h1 = await page.locator('h1:visible, h2:visible, h3:visible').count().catch(() => 0);
    const grid = await page.locator('[role="grid"]:visible, [role="table"]:visible').count().catch(() => 0);
    const status = `tbl=${tbl} newBtn=${newBtn} tabs=${tabs} h1=${h1} grid=${grid}`;
    if (status !== lastStatus) { console.log(`  waiting... ${status}`); lastStatus = status; }
    if (tbl > 0 || newBtn > 0 || grid > 0) return true;
    await sleep(1500);
  }
  return false;
}

const SIDEBAR_TEXTS = new Set([
  'Home','Logout','Module Management','Sample Management','Customer Relation Management',
  'Support','Purchase & Indent','Quotation & Pricing','Master Library',
  'Document Management System','Quality Document Management System','Reports & COC',
  'Equipment management','Inventory Management','Role Management','Profile Master',
  'Administration','Billing and Invoicing','Training','Quick Sample Entry',
  'All 0','Unread 0','Read 0',
]);

async function getPageInfo(page, label) {
  console.log(`\n${'─'.repeat(70)}\n${label}\n${'─'.repeat(70)}`);

  // Page title / heading
  const h1s = await page.locator('h1:visible, h2:visible').allInnerTexts().catch(() => []);
  if (h1s.length) console.log('Headings:', h1s.map(t => t.trim()).filter(Boolean));

  // Buttons (excluding sidebar + notification header)
  const btns = await page.locator('button:visible').all();
  const btnTxts = [];
  for (const b of btns) {
    let t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
    // Skip notification/header buttons
    if (!t || SIDEBAR_TEXTS.has(t) || /^AD\s/.test(t) || /^(All|Unread|Read)\s+\d/.test(t)) continue;
    btnTxts.push(t);
  }
  console.log('Page buttons:', btnTxts.slice(0, 30));

  // Table headers
  const headers = await page.locator('thead th').allInnerTexts().catch(() => []);
  console.log('Table headers:', headers.map(t => t.trim()).filter(Boolean));

  // Tabs
  const tabs = await page.locator('[role="tab"]:visible').allInnerTexts().catch(() => []);
  if (tabs.length) console.log('Tabs:', tabs.map(t => t.trim()).filter(Boolean));

  // Labels
  const labels = await page.locator('label:visible').allInnerTexts().catch(() => []);
  console.log('Labels:', labels.map(t => t.trim()).filter(t => t && t.length < 80).slice(0, 30));

  // Inputs
  const inputs = await page.locator('input:visible').all();
  for (const inp of inputs) {
    const type = await inp.getAttribute('type').catch(() => '');
    if (type === 'hidden') continue;
    const ph = await inp.getAttribute('placeholder').catch(() => '');
    const nm = await inp.getAttribute('name').catch(() => '');
    const id = await inp.getAttribute('id').catch(() => '');
    console.log(`  input[${type}] ph="${ph}" name="${nm}" id="${id}"`);
  }

  // Textareas
  const tas = await page.locator('textarea:visible').all();
  for (const ta of tas) {
    const ph = await ta.getAttribute('placeholder').catch(() => '');
    const nm = await ta.getAttribute('name').catch(() => '');
    console.log(`  textarea name="${nm}" ph="${ph}"`);
  }

  // Comboboxes
  const combos = await page.locator('[role="combobox"]:visible').all();
  console.log(`  comboboxes: ${combos.length}`);
  for (let i = 0; i < Math.min(combos.length, 20); i++) {
    const ph = await combos[i].getAttribute('placeholder').catch(() => '');
    const al = await combos[i].getAttribute('aria-label').catch(() => '');
    const nm = await combos[i].getAttribute('name').catch(() => '');
    console.log(`    combo[${i}] ph="${ph}" name="${nm}" aria="${al}"`);
  }

  // Selects
  const selects = await page.locator('select:visible').all();
  console.log(`  selects: ${selects.length}`);
  for (let i = 0; i < Math.min(selects.length, 10); i++) {
    const nm = await selects[i].getAttribute('name').catch(() => '');
    const id = await selects[i].getAttribute('id').catch(() => '');
    console.log(`    select[${i}] name="${nm}" id="${id}"`);
  }

  // File inputs
  const fileCnt = await page.locator('input[type="file"]').count().catch(() => 0);
  console.log(`  file inputs: ${fileCnt}`);

  // Row count
  const rows = await page.locator('tbody tr').count().catch(() => 0);
  console.log(`  table rows: ${rows}`);
}

async function discoverModule(page, mod, url) {
  console.log(`\n${'='.repeat(70)}\n${mod}: ${url}\n${'='.repeat(70)}`);
  await page.goto(BASE_URL + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const ok = await waitForModuleContent(page, 60000);
  if (!ok) console.log('WARNING: Module content may not have loaded');

  await getPageInfo(page, `${mod}_LIST`);

  // Find and click create/new button
  const allBtns = await page.locator('button:visible').all();
  let createBtn = null, createBtnTxt = '';
  for (const b of allBtns) {
    const t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
    if (/^(new|add|create|upload)/i.test(t) && t.length < 60 && !SIDEBAR_TEXTS.has(t)) {
      createBtn = b; createBtnTxt = t; break;
    }
  }
  // Fallback: any button with new/add/create
  if (!createBtn) {
    for (const b of allBtns) {
      const t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
      if (/new|add|create/i.test(t) && t.length < 60 && !SIDEBAR_TEXTS.has(t)) {
        createBtn = b; createBtnTxt = t; break;
      }
    }
  }

  if (createBtn) {
    console.log(`\n→ Clicking create button: "${createBtnTxt}"`);
    await createBtn.click({ force: true }).catch(() => {});
    await sleep(5000);
    await getPageInfo(page, `${mod}_FORM`);

    // Close form
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelBtn.click().catch(() => {});
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(1500);
  } else {
    console.log('No create button found');
  }

  // Row actions
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
    const rowBtns = await firstRow.locator('button').all();
    const rowInfo = [];
    for (const b of rowBtns) {
      const t = (await b.innerText().catch(() => '')).trim();
      const title = await b.getAttribute('title').catch(() => '');
      rowInfo.push({ text: t || title });
    }
    console.log('Row buttons:', JSON.stringify(rowInfo));
    if (rowBtns.length > 0) {
      await rowBtns[rowBtns.length-1].click({ force: true }).catch(() => {});
      await sleep(1500);
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
      { mod: 'ClientPricing',    url: '/dashboard/accounts/client-pricing' },
      { mod: 'ClientQuotation',  url: '/dashboard/accounts/quotation' },
      { mod: 'IndentManagement', url: '/dashboard/inventory/indent-manage' },
      { mod: 'AdminIndent',      url: '/dashboard/inventory/admin-indent' },
      { mod: 'MethodValidation', url: '/dashboard/method/method-validation-upload' },
      { mod: 'MethodDevelopment',url: '/dashboard/method/method-development' },
    ];

    for (const { mod, url } of modules) {
      await discoverModule(page, mod, url);
    }

  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
  }
  await browser.close();
})();
