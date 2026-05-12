/**
 * Discovery using CORRECT URLs from sidebar link crawl
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

async function waitForModuleContent(page, maxMs = 30000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const tbl = await page.locator('thead th').count().catch(() => 0);
    const newBtn = await page.locator('button:visible').filter({ hasText: /new|add|create|upload/i }).count().catch(() => 0);
    if (tbl > 0 || newBtn > 0) return true;
    await sleep(1000);
  }
  return false;
}

const SKIP_TEXTS = new Set([
  'Home','Logout','Module Management','Sample Management','Customer Relation Management',
  'Support','Purchase & Indent','Quotation & Pricing','Master Library',
  'Document Management System','Quality Document Management System','Reports & COC',
  'Equipment management','Inventory Management','Role Management','Profile Master',
  'Administration','Billing and Invoicing','Training','Quick Sample Entry',
]);

async function getPageInfo(page, label) {
  console.log(`\n${'─'.repeat(60)}\n${label}\n${'─'.repeat(60)}`);

  const h1s = await page.locator('h1:visible, h2:visible').allInnerTexts().catch(() => []);
  const filtered = h1s.filter(t => t && t.trim() && !['YLIMS','Dashboard','Notifications'].includes(t.trim()));
  if (filtered.length) console.log('Headings:', filtered);

  const btns = await page.locator('button:visible').all();
  const btnTxts = [];
  for (const b of btns) {
    let t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
    if (!t || SKIP_TEXTS.has(t) || /^AD\s/.test(t) || /^(All|Unread|Read)\s+\d/.test(t)) continue;
    btnTxts.push(t);
  }
  console.log('Buttons:', btnTxts.slice(0, 25));

  const headers = await page.locator('thead th').allInnerTexts().catch(() => []);
  console.log('Table headers:', headers.map(t => t.trim()).filter(Boolean));

  const tabs = await page.locator('[role="tab"]:visible').allInnerTexts().catch(() => []);
  if (tabs.length) console.log('Tabs:', tabs.map(t => t.trim()).filter(Boolean));

  const labels = await page.locator('label:visible').allInnerTexts().catch(() => []);
  console.log('Labels:', labels.map(t => t.trim()).filter(t => t && t.length < 80).slice(0, 30));

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
  for (const ta of tas) {
    const ph = await ta.getAttribute('placeholder').catch(() => '');
    const nm = await ta.getAttribute('name').catch(() => '');
    console.log(`  textarea name="${nm}" ph="${ph}"`);
  }

  const combos = await page.locator('[role="combobox"]:visible').all();
  console.log(`  comboboxes: ${combos.length}`);
  for (let i = 0; i < Math.min(combos.length, 20); i++) {
    const ph = await combos[i].getAttribute('placeholder').catch(() => '');
    const nm = await combos[i].getAttribute('name').catch(() => '');
    const al = await combos[i].getAttribute('aria-label').catch(() => '');
    console.log(`    combo[${i}] ph="${ph}" name="${nm}" aria="${al}"`);
  }

  const selects = await page.locator('select:visible').all();
  if (selects.length) {
    console.log(`  selects: ${selects.length}`);
    for (const sel of selects) {
      const nm = await sel.getAttribute('name').catch(() => '');
      const id = await sel.getAttribute('id').catch(() => '');
      console.log(`    select name="${nm}" id="${id}"`);
    }
  }

  const fileCnt = await page.locator('input[type="file"]').count().catch(() => 0);
  console.log(`  file inputs: ${fileCnt}`);

  const rows = await page.locator('tbody tr').count().catch(() => 0);
  console.log(`  table rows: ${rows}`);
}

async function discoverModule(page, mod, url) {
  console.log(`\n${'='.repeat(60)}\n${mod}\nURL: ${url}\n${'='.repeat(60)}`);
  await page.goto(BASE_URL + url, { waitUntil: 'commit', timeout: 60000 });
  const ok = await waitForModuleContent(page, 30000);
  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);
  if (finalUrl.endsWith('/dashboard') || finalUrl === BASE_URL + '/dashboard') {
    console.log('REDIRECT TO DASHBOARD - permission issue or wrong URL');
    return;
  }
  if (!ok) console.log('WARNING: Content may not be fully loaded');

  await getPageInfo(page, `${mod}_LIST`);

  // Find create button
  const allBtns = await page.locator('button:visible').all();
  let createBtn = null, createBtnTxt = '';
  for (const b of allBtns) {
    const t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
    if (/new|add|create|upload/i.test(t) && t.length < 60 && !SKIP_TEXTS.has(t)) {
      createBtn = b; createBtnTxt = t; break;
    }
  }

  if (createBtn) {
    console.log(`\n→ Clicking: "${createBtnTxt}"`);
    await createBtn.click({ force: true }).catch(() => {});
    await sleep(5000);
    await getPageInfo(page, `${mod}_FORM`);
    const c = page.locator('button:has-text("Cancel")').first();
    if (await c.isVisible({ timeout: 2000 }).catch(() => false)) await c.click().catch(() => {});
    else await page.keyboard.press('Escape');
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
      { mod: 'ClientProductPricing', url: '/dashboard/client-product-pricing' },
      { mod: 'ClientQuotation',      url: '/dashboard/quotation/client' },
      { mod: 'IndentManage',         url: '/dashboard/purchase/indent' },
      { mod: 'AdminIndent',          url: '/dashboard/purchase/admin-indent' },
      { mod: 'MethodUpload',         url: '/dashboard/method/method-upload' },
      { mod: 'MethodValidation',     url: '/dashboard/method/validation-upload' },
      { mod: 'MethodDevelopment',    url: '/dashboard/method/development' },
    ];

    for (const { mod, url } of modules) {
      await discoverModule(page, mod, url);
    }

  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
  }
  await browser.close();
})();
