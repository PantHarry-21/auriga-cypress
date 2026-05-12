const { chromium } = require('playwright');

(async () => {
  const chromePath = 'C:\\Users\\pantq\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://uat.ylims.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 4000));

  // Find the location dropdown button (parent of locationId hidden input)
  const locationSection = await page.locator('#locationId').locator('..').locator('..').innerHTML().catch(() => 'not found');
  console.log('Location section (2 levels up from hidden input):\n', locationSection.substring(0, 1500));

  // Try clicking the button that's associated with location picker
  const allBtns = await page.locator('button').all();
  console.log('\nAll buttons:');
  for (const btn of allBtns) {
    const txt = await btn.innerText().catch(() => '');
    const cls = await btn.getAttribute('class').catch(() => '');
    const type = await btn.getAttribute('type').catch(() => '');
    console.log('  type:', type, '| text:', txt.substring(0,60), '| class:', (cls||'').substring(0,60));
  }

  // Click the first non-submit button (likely the location dropdown)
  const nonSubmitBtns = await page.locator('button:not([type="submit"])').all();
  console.log('\nNon-submit buttons count:', nonSubmitBtns.length);
  if (nonSubmitBtns.length > 0) {
    await nonSubmitBtns[0].click();
    await new Promise(r => setTimeout(r, 2000));
    const bodyAfterClick = await page.locator('body').innerText().catch(() => '');
    console.log('Body after clicking location dropdown:', bodyAfterClick.substring(0, 800));

    // Take screenshot
    await page.screenshot({ path: 'cypress/scripts/location_open.png' });
    console.log('Screenshot saved: location_open.png');
  }

  await browser.close();
})().catch(console.error);
