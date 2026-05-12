const { chromium } = require('playwright');

(async () => {
  const chromePath = 'C:\\Users\\pantq\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Step 1: Navigate to login...');
  await page.goto('https://uat.ylims.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Step 2: Fill credentials...');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  console.log('  Clicked Sign in');

  await new Promise(r => setTimeout(r, 5000));
  const url2 = page.url();
  const body2 = await page.locator('body').innerText().catch(() => '');
  console.log('Post-login URL:', url2);
  console.log('Post-login body (first 800):', body2.substring(0, 800));

  await page.screenshot({ path: 'cypress/scripts/after_login.png' });
  console.log('Screenshot saved: after_login.png');

  // If there's a location picker
  if (body2.includes('Arbro') || body2.includes('location') || body2.includes('Location') || body2.includes('Select')) {
    console.log('\n--- Location picker detected ---');
    const allBtns = await page.locator('button, li, div[role="option"]').all();
    for (const btn of allBtns.slice(0, 30)) {
      const txt = await btn.innerText().catch(() => '');
      if (txt.trim().length > 0) console.log(' Element text:', txt.trim().substring(0, 60));
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})().catch(console.error);
