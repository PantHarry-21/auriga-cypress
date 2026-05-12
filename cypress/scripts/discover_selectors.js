/**
 * Live selector discovery for YLIMS UAT modules
 * Discovers actual button text, dialog selectors, form field placeholders
 */
const { chromium } = require('playwright');

const BASE_URL = 'https://uat.ylims.com';
const CHROME = 'C:\\Users\\pantq\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login(page) {
  await page.goto(BASE_URL + '/login', { waitUntil: 'commit', timeout: 90000 });
  await page.locator('[name="username"]').waitFor({ state: 'visible', timeout: 60000 });
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'Password@123');
  await page.locator('button:has-text("Sign in")').click();
  // Wait for location picker
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const txt = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
    if (txt.includes('Choose your location')) break;
    if (!page.url().includes('/login')) break;
    await sleep(1000);
  }
  const txt = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  if (txt.includes('Choose your location')) {
    await page.locator('button:has-text("Choose your location")').click();
    await sleep(2000);
    const arbro = page.locator('span').filter({ hasText: /Arbro/i }).first();
    await arbro.click({ timeout: 8000 });
    await sleep(1000);
    await page.locator('button:has-text("Sign in")').click();
    await sleep(5000);
  }
  console.log('Logged in. URL:', page.url());
}

async function discoverModule(page, name, url) {
  console.log('\n' + '='.repeat(60));
  console.log('MODULE:', name, '|', url);
  console.log('='.repeat(60));

  await page.goto(BASE_URL + url, { waitUntil: 'commit', timeout: 90000 });
  await sleep(3000);

  // Collect all visible buttons
  const buttons = await page.locator('button:visible').all();
  const btnTexts = [];
  for (const btn of buttons) {
    const txt = (await btn.innerText().catch(() => '')).trim();
    if (txt) btnTexts.push(txt);
  }
  console.log('\nAll visible buttons:', btnTexts);

  // Find the "New / Add / Create" button
  const createBtn = btnTexts.find(t => /new|add|create/i.test(t));
  console.log('  → Create button text:', createBtn);

  // Click it and discover the form
  if (createBtn) {
    const btn = page.locator(`button:has-text("${createBtn}")`).first();
    await btn.click();
    await sleep(3000);

    const url2 = page.url();
    console.log('\nAfter clicking "' + createBtn + '":', url2);

    // Check if we navigated to a new page
    if (url2 !== BASE_URL + url && url2 !== BASE_URL + url + '/') {
      console.log('  → Full-page navigation detected');
    }

    // Find the form/dialog
    const dialogEl = page.locator('[aria-modal="true"], [role="dialog"]').first();
    const dialogVisible = await dialogEl.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('  Dialog (aria-modal/role=dialog) visible:', dialogVisible);

    const slideEl = page.locator('div.animate-slide-in-right').first();
    const slideVisible = await slideEl.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('  Slide-over (.animate-slide-in-right) visible:', slideVisible);

    // Get all form inputs
    const inputs = await page.locator('input:visible').all();
    console.log('\nForm inputs:');
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const ph = await inp.getAttribute('placeholder');
      const name2 = await inp.getAttribute('name');
      const id = await inp.getAttribute('id');
      if (type !== 'hidden') console.log(`  type="${type}" placeholder="${ph}" name="${name2}" id="${id}"`);
    }

    // Get all visible buttons in form
    const formBtns = await page.locator('button:visible').all();
    const formBtnTexts = [];
    for (const b of formBtns) {
      const t = (await b.innerText().catch(() => '')).trim();
      if (t) formBtnTexts.push(t);
    }
    console.log('\nForm buttons:', formBtnTexts);

    // Check for Cancel button
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    const cancelVisible = await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Cancel button visible:', cancelVisible);

    // Get headings inside form
    const headings = await page.locator('[aria-modal="true"] h1, [aria-modal="true"] h2, [aria-modal="true"] h3, [role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3').all();
    for (const h of headings) {
      const t = (await h.innerText().catch(() => '')).trim();
      if (t) console.log('Form heading:', t);
    }

    // Screenshot
    await page.screenshot({ path: `cypress/scripts/discover_${name.replace(/\s+/g,'_')}_form.png` });
    console.log(`Screenshot saved: discover_${name.replace(/\s+/g,'_')}_form.png`);

    // Close the form
    if (cancelVisible) {
      await cancelBtn.click();
      await sleep(1000);
    } else {
      // try ESC
      await page.keyboard.press('Escape');
      await sleep(1000);
    }
  }

  // Also check row action buttons
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
    const rowBtns = await firstRow.locator('button').all();
    const rowBtnInfo = [];
    for (const b of rowBtns) {
      const t = (await b.innerText().catch(() => '')).trim();
      const title = await b.getAttribute('title');
      rowBtnInfo.push({ text: t, title });
    }
    console.log('\nRow action buttons (first row):', JSON.stringify(rowBtnInfo));
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    await discoverModule(page, 'STP Groups',       '/dashboard/testing/stp-groups');
    await discoverModule(page, 'STP Master',       '/dashboard/testing/stp-master-v2');
    await discoverModule(page, 'Generic Master',   '/dashboard/products/generic-master-v2');
    await discoverModule(page, 'Parameter Master', '/dashboard/testing/analyt-master-v2');
    await discoverModule(page, 'Product Master',   '/dashboard/products/master-v2');
  } catch (e) {
    console.error('ERROR:', e.message);
  }
  await browser.close();
})();
