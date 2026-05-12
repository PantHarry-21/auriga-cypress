const { chromium } = require('playwright');

(async () => {
  const chromePath = 'C:\\Users\\pantq\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Intercept API calls to understand location loading
  page.on('request', req => {
    if (req.url().includes('api') || req.url().includes('location') || req.url().includes('lab')) {
      console.log('API Request:', req.method(), req.url().substring(0, 100));
    }
  });
  page.on('response', async resp => {
    if (resp.url().includes('api') || resp.url().includes('location') || resp.url().includes('lab')) {
      const status = resp.status();
      console.log('API Response:', status, resp.url().substring(0, 100));
    }
  });

  await page.goto('https://uat.ylims.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));

  // Click location dropdown
  const locBtn = page.locator('button:has-text("Choose your location")').first();
  await locBtn.click();
  await new Promise(r => setTimeout(r, 3000));

  const bodyAfter = await page.locator('body').innerText().catch(() => '');
  console.log('\nBody after dropdown click:', bodyAfter.substring(0, 1000));

  // Look for dropdown items that appeared
  const allVisible = await page.locator('li, [role="option"], [role="listbox"] *').all();
  console.log('\nDropdown items count:', allVisible.length);
  for (const el of allVisible.slice(0, 20)) {
    const txt = await el.innerText().catch(() => '');
    if (txt.trim()) console.log('  Item:', txt.substring(0, 60));
  }

  await page.screenshot({ path: 'cypress/scripts/dropdown_open.png' });
  console.log('\nScreenshot saved: dropdown_open.png');

  // Get full HTML to see dropdown options
  const html = await page.locator('body').innerHTML();
  const dropdownIdx = html.indexOf('Choose your location');
  if (dropdownIdx > -1) {
    console.log('\nHTML around dropdown:', html.substring(dropdownIdx - 50, dropdownIdx + 2000));
  }

  await browser.close();
})().catch(console.error);
