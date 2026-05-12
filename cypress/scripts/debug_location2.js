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

  // Get full HTML body
  const fullHtml = await page.locator('body').innerHTML();
  console.log('FULL HTML LENGTH:', fullHtml.length);

  // Find location picker section
  const locIdx = fullHtml.indexOf('locationId');
  const locSection = fullHtml.substring(Math.max(0, locIdx - 100), locIdx + 2000);
  console.log('\nLocation section HTML:');
  console.log(locSection);

  // Try to find the custom select dropdown
  const allDivs = await page.locator('div[class*="select"], div[class*="dropdown"], div[class*="location"]').all();
  console.log('\n\nSelect-like divs count:', allDivs.length);
  for (const d of allDivs.slice(0, 5)) {
    const txt = await d.innerText().catch(() => '');
    const cls = await d.getAttribute('class');
    console.log('  class:', (cls||'').substring(0,80), '| text:', txt.substring(0,50));
  }

  await browser.close();
})().catch(console.error);
