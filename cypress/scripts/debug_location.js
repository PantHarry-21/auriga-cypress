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

  console.log('After first login click, URL:', page.url());
  console.log('Body:', (await page.locator('body').innerText().catch(() => '')).substring(0, 600));

  // Find all form elements
  const inputs = await page.locator('input, select, [role="combobox"], [role="listbox"]').all();
  console.log('\nForm elements:');
  for (const el of inputs) {
    const tag = await el.evaluate(e => e.tagName);
    const type = await el.getAttribute('type');
    const ph = await el.getAttribute('placeholder');
    const id = await el.getAttribute('id');
    const cls = await el.getAttribute('class');
    console.log(' ', tag, '| type:', type, '| placeholder:', ph, '| id:', id, '| class (first 60):', (cls||'').substring(0,60));
  }

  // Get all HTML to understand structure
  const html = await page.locator('body').innerHTML();
  console.log('\nHTML snippet (select/option area):', html.substring(0, 2000));

  await page.screenshot({ path: 'cypress/scripts/location_debug.png' });
  await browser.close();
})().catch(console.error);
