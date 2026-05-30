/**
 * Playwright globalSetup — runs ONCE before all tests.
 * Pre-creates sessions for all roles so no test ever needs a fresh login.
 * Sessions are saved to .auth/ and reused by loginAs() automatically.
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const ENV_FILE = path.resolve(__dirname, '../.env.uat');

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function createSession(
  baseURL: string,
  username: string,
  password: string,
  lab: string,
  sessionFile: string
) {
  if (fs.existsSync(sessionFile)) {
    try {
      const saved = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
      if (saved.cookies?.length > 0) {
        console.log(`  ⏭  Reusing existing session: ${path.basename(sessionFile)}`);
        return;
      }
    } catch { /* corrupted — recreate */ }
  }

  const browser = await chromium.launch({ headless: true });
  const ctx  = await browser.newContext({ baseURL });
  const page = await ctx.newPage();

  try {
    console.log(`  🔑 Logging in: ${username} @ ${lab}`);

    // Block Stimulsoft
    await ctx.route('**/stimulsoft*.js', r =>
      r.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stubbed */' })
    );

    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(1200);

    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // Handle location picker (applies to all roles)
    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (bodyText.includes('Choose your location')) {
      await page.click('button:has-text("Choose your location")');
      await sleep(1000);
      await page.locator(`span:has-text("${lab}")`).first().click();
      await sleep(500);
      await page.click('button[type="submit"]');
    }

    // Handle password reset if needed
    const urlAfter = page.url();
    if (urlAfter.includes('/password-reset')) {
      const pwInputs = await page.locator('input[type="password"]').all();
      if (pwInputs.length >= 2) {
        await pwInputs[0].fill(password);
        await pwInputs[1].fill(password);
        if (pwInputs.length >= 3) await pwInputs[2].fill(password);
      }
      await page.locator('button[type="submit"]').first().click();
      await sleep(2000);
      // Re-trigger location picker if needed after reset
      const bodyAfterReset = await page.locator('body').innerText().catch(() => '');
      if (bodyAfterReset.includes('Choose your location')) {
        await page.click('button:has-text("Choose your location")');
        await sleep(1000);
        await page.locator(`span:has-text("${lab}")`).first().click();
        await sleep(500);
        await page.click('button[type="submit"]');
      }
    }

    await page.waitForURL('**/dashboard**', { timeout: 120000 });
    console.log(`  ✅ ${username} → ${page.url()}`);

    // Save session
    const cookies = await ctx.cookies();
    fs.writeFileSync(sessionFile, JSON.stringify({ cookies }));
  } catch (err: any) {
    console.warn(`  ⚠️  Session creation failed for ${username}: ${err.message}`);
  } finally {
    await browser.close();
  }
}

export default async function globalSetup() {
  console.log('\n[globalSetup] Pre-creating sessions for all roles...');

  if (!fs.existsSync(ENV_FILE)) {
    console.warn('[globalSetup] .env.uat not found — skipping pre-login');
    return;
  }

  const env = dotenv.parse(fs.readFileSync(ENV_FILE));
  const baseURL = env.BASE_URL || 'https://uat.ylims.com';
  const lab     = env.LAB_NAME || 'Arbro - Delhi';
  const authDir = path.resolve(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const labKey = lab.replace(/\s+/g, '_');

  const roles = [
    { key: 'admin',                user: env.ADMIN_USERNAME,               pass: env.ADMIN_PASSWORD },
    { key: 'master_personel',      user: env.MASTER_PERSONEL_USERNAME,     pass: env.MASTER_PERSONEL_PASSWORD },
    { key: 'master_controler',     user: env.MASTER_CONTROLER_USERNAME,    pass: env.MASTER_CONTROLER_PASSWORD },
    { key: 'reception',            user: env.RECEPTION_USERNAME,           pass: env.RECEPTION_PASSWORD },
    { key: 'booking_personel',     user: env.BOOKING_PERSONEL_USERNAME,    pass: env.BOOKING_PERSONEL_PASSWORD },
    { key: 'analyst',              user: env.ANALYST_USERNAME,             pass: env.ANALYST_PASSWORD },
    { key: 'department_reviewer',  user: env.DEPARTMENT_REVIEWER_USERNAME, pass: env.DEPARTMENT_REVIEWER_PASSWORD },
    { key: 'department_head',      user: env.DEPARTMENT_HEAD_USERNAME,     pass: env.DEPARTMENT_HEAD_PASSWORD },
    { key: 'compilation',          user: env.COMPILATION_USERNAME,         pass: env.COMPILATION_PASSWORD },
    { key: 'reviewer',             user: env.REVIEWER_USERNAME,            pass: env.REVIEWER_PASSWORD },
    { key: 'customer_coordinator', user: env.CUSTOMER_COORDINATOR_USERNAME,pass: env.CUSTOMER_COORDINATOR_PASSWORD },
    { key: 'quality_personel',     user: env.QUALITY_PERSONEL_USERNAME,    pass: env.QUALITY_PERSONEL_PASSWORD },
    { key: 'quality_manger',       user: env.QUALITY_MANGER_USERNAME,      pass: env.QUALITY_MANGER_PASSWORD },
    { key: 'accountant_admin',     user: env.ACCOUNTANT_ADMIN_USERNAME,    pass: env.ACCOUNTANT_ADMIN_PASSWORD },
    { key: 'accountant_crm',       user: env.ACCOUNTANT_CRM_USERNAME,      pass: env.ACCOUNTANT_CRM_PASSWORD },
    { key: 'sales_personel_am',    user: env.SALES_PERSONEL_AM_USERNAME,   pass: env.SALES_PERSONEL_AM_PASSWORD },
    { key: 'person_incharge',      user: env.PERSON_INCHARGE_USERNAME,     pass: env.PERSON_INCHARGE_PASSWORD },
  ];

  // Login roles sequentially to avoid hammering the server
  for (const role of roles) {
    if (!role.user || !role.pass) {
      console.log(`  ⏭  Skipping ${role.key} (no credentials)`);
      continue;
    }
    const sessionFile = path.join(authDir, `${role.key}__${labKey}.json`);
    await createSession(baseURL, role.user, role.pass, lab, sessionFile);
  }

  console.log('[globalSetup] All sessions ready.\n');
}
