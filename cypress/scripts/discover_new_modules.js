/**
 * Discovery script for 7 new modules
 * Mocks stimulsoft with empty stubs so they don't block rendering
 */
const { chromium } = require('playwright');
const BASE_URL = 'https://uat.ylims.com';
const CHROME = 'C:/Users/pantq/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setupPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // Return empty stubs for all stimulsoft scripts
  await page.route('**/stimulsoft**', route => {
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub */' });
  });
  return page;
}

async function waitForContent(page, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const btnCount = await page.locator('button:visible').count().catch(() => 0);
    if (btnCount > 0) return true;
    await sleep(500);
  }
  return false;
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

async function goTo(page, url) {
  await page.goto(BASE_URL + url, { waitUntil: 'commit', timeout: 60000 });
  await waitForContent(page, 12000);
}

async function tryUrl(page, url) {
  try {
    await page.goto(BASE_URL + url, { waitUntil: 'commit', timeout: 20000 });
    await sleep(3000);
    if (page.url().includes('/login')) return false;
    const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    if (/404|page not found/i.test(body)) return false;
    return true;
  } catch { return false; }
}

async function getInfo(page, label) {
  console.log(`\n${'─'.repeat(60)}\n${label}\n${'─'.repeat(60)}`);
  const btns = await page.locator('button:visible').allInnerTexts().catch(() => []);
  console.log('Buttons:', btns.map(t => t.trim().replace(/\n/g,' ')).filter(Boolean).slice(0,20));
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
  for (let i = 0; i < Math.min(combos.length, 10); i++) {
    const ph = await combos[i].getAttribute('placeholder').catch(() => '');
    const al = await combos[i].getAttribute('aria-label').catch(() => '');
    console.log(`    combo[${i}] ph="${ph}" aria-label="${al}"`);
  }
  const fileCnt = await page.locator('input[type="file"]').count().catch(() => 0);
  console.log(`  file inputs: ${fileCnt}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await setupPage(browser);

  try {
    await login(page);

    // Sidebar crawl for URLs
    console.log('\n=== SIDEBAR LINK CRAWL ===');
    await goTo(page, '/dashboard');
    const navBtns = await page.locator('nav button, aside button').all();
    for (const btn of navBtns) {
      await btn.click({ force: true }).catch(() => {});
      await sleep(200);
    }
    await sleep(2000);
    const links = await page.locator('a[href]').all();
    const linkMap = {};
    for (const link of links) {
      const href = await link.getAttribute('href').catch(() => '');
      const text = (await link.innerText().catch(() => '')).trim().replace(/\n/g, ' ');
      if (href && href.startsWith('/dashboard') && href.length > 11) linkMap[href] = text;
    }
    console.log('All links:');
    for (const [h, t] of Object.entries(linkMap)) console.log(`  ${h}  → "${t}"`);

    // URL probing
    const candidates = {
      ClientPricing:    ['/dashboard/accounts/client-pricing','/dashboard/accounts/price-list','/dashboard/accounts/pricing','/dashboard/billing/client-pricing','/dashboard/crm/client-pricing'],
      ClientQuotation:  ['/dashboard/accounts/quotation','/dashboard/accounts/client-quotation','/dashboard/crm/quotation','/dashboard/crm/client-quotation','/dashboard/samples/quotation','/dashboard/billing/quotation'],
      IndentManage:     ['/dashboard/inventory/indent-manage','/dashboard/inventory/indent','/dashboard/inventory/indent-management'],
      AdminIndent:      ['/dashboard/inventory/admin-indent','/dashboard/inventory/admin-indent-manage','/dashboard/inventory/indent-admin','/dashboard/admin/indent-manage','/dashboard/inventory/indent-approval'],
      MethodUpload:     ['/dashboard/method/method-upload','/dashboard/testing/method-upload','/dashboard/methods/upload','/dashboard/method/upload'],
      MethodValidation: ['/dashboard/method/method-validation-upload','/dashboard/method/method-validation','/dashboard/method/validation-upload','/dashboard/testing/method-validation-upload'],
      MethodDev:        ['/dashboard/method/method-development','/dashboard/method/development','/dashboard/testing/method-development','/dashboard/methods/development'],
    };

    const found = {};
    console.log('\n=== URL PROBE ===');
    for (const [mod, urls] of Object.entries(candidates)) {
      let resolved = false;
      for (const url of urls) {
        const ok = await tryUrl(page, url);
        console.log(`  ${ok?'✓':'✗'} ${mod} ${url}`);
        if (ok) { found[mod] = url; resolved = true; break; }
      }
      if (!resolved) console.log(`  ✗ ${mod}: NOT FOUND`);
    }

    console.log('\n=== CONFIRMED URLS ===');
    for (const [m, u] of Object.entries(found)) console.log(`  ${m}: ${u}`);

    // Detailed discovery
    console.log('\n=== DETAILED DISCOVERY ===');
    for (const [mod, url] of Object.entries(found)) {
      await goTo(page, url);
      await getInfo(page, `${mod}_LIST`);

      // Find create button
      const allBtns = await page.locator('button:visible').all();
      let createBtn = null;
      for (const b of allBtns) {
        const t = (await b.innerText().catch(() => '')).trim().replace(/\n/g,' ');
        if (/new|add|create/i.test(t) && t.length < 60) { createBtn = b; break; }
      }
      if (createBtn) {
        const btnTxt = (await createBtn.innerText().catch(() => '')).trim().replace(/\n/g,' ');
        console.log(`\n→ Clicking "${btnTxt}"`);
        await createBtn.click({ force: true }).catch(() => {});
        await sleep(3000);
        await getInfo(page, `${mod}_FORM`);
        const c = page.locator('button:has-text("Cancel")').first();
        if (await c.isVisible({ timeout: 2000 }).catch(() => false)) await c.click();
        else await page.keyboard.press('Escape');
        await sleep(1000);
      }

      // Row info
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible({ timeout: 2000 }).catch(() => false)) {
        const rowBtns = await firstRow.locator('button').all();
        const rowInfo = [];
        for (const b of rowBtns) {
          const t = (await b.innerText().catch(() => '')).trim();
          const title = await b.getAttribute('title').catch(() => '');
          rowInfo.push({ text: t || title });
        }
        console.log('Row buttons:', JSON.stringify(rowInfo));
      }
    }

  } catch (e) {
    console.error('FATAL:', e.message);
    console.error(e.stack);
  }
  await browser.close();
})();
