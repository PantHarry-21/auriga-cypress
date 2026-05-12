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
  const deadline = Date.now() + 15000;
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
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await login(page);

  // Navigate to STP Master
  await page.goto(BASE_URL + '/dashboard/testing/stp-master-v2', { waitUntil: 'commit', timeout: 60000 });
  await sleep(3000);

  console.log('STP Master page URL:', page.url());
  console.log('Clicking New STP Master...');
  await page.locator('button:has-text("New STP Master")').click();

  // Wait up to 15 seconds and log what appears
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    const url = page.url();
    const bodyTxt = await page.locator('body').innerText().catch(() => '');
    const inputs = await page.locator('input:visible').all();
    const inputPhs = await Promise.all(inputs.map(i => i.getAttribute('placeholder').catch(() => '')));
    const btns = await page.locator('button:visible').all();
    const btnTexts = await Promise.all(btns.map(b => b.innerText().catch(() => '').then(t => t.trim()).catch(() => '')));
    const cancelVisible = btnTexts.includes('Cancel') || btnTexts.some(t => /cancel/i.test(t));
    const submitVisible = btnTexts.some(t => /submit|save.*draft/i.test(t));
    console.log(`T+${i+1}s: URL=${url} | Cancel=${cancelVisible} | Submit=${submitVisible} | Inputs=[${inputPhs.filter(Boolean).slice(0,5).join(', ')}]`);
    if (cancelVisible || submitVisible) {
      console.log('\nFORM DETECTED! Full button list:', btnTexts.filter(Boolean).slice(-20));
      console.log('Full inputs:', inputPhs.filter(Boolean));
      break;
    }
  }

  await page.screenshot({ path: 'cypress/scripts/stp_master_form.png' });
  console.log('Screenshot saved: stp_master_form.png');
  await browser.close();
})().catch(console.error);
