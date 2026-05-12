const { chromium } = require('playwright');

(async () => {
  const chromePath = 'C:\\Users\\pantq\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to UAT...');
  await page.goto('https://uat.ylims.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));

  const url = page.url();
  const title = await page.title();
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('URL:', url);
  console.log('Title:', title);
  console.log('Body text (first 500):', body.substring(0, 500));

  const allInputs = await page.locator('input').all();
  const inputInfo = await Promise.all(allInputs.map(async i => ({
    type: await i.getAttribute('type'),
    placeholder: await i.getAttribute('placeholder'),
    name: await i.getAttribute('name'),
    id: await i.getAttribute('id')
  })));
  console.log('\nInputs found:', JSON.stringify(inputInfo, null, 2));

  const allButtons = await page.locator('button').all();
  const btnInfo = await Promise.all(allButtons.map(async b => ({
    text: await b.innerText().catch(() => ''),
    type: await b.getAttribute('type')
  })));
  console.log('\nButtons found:', JSON.stringify(btnInfo, null, 2));

  // Screenshot for debugging
  await page.screenshot({ path: 'cypress/scripts/login_debug.png' });
  console.log('\nScreenshot saved to cypress/scripts/login_debug.png');

  await browser.close();
})().catch(console.error);
