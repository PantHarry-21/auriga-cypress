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
      // Require localStorage too — cookie-only sessions (pre-fidelity-fix) leave the
      // SPA without userData/modulePermissions and must be recreated.
      if (saved.cookies?.length > 0 && saved.localStorage && Object.keys(saved.localStorage).length > 0) {
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

    // Wait for the SPA to persist identity/permissions client-side
    await page.waitForFunction(() => !!localStorage.getItem('userData'), { timeout: 15000 }).catch(() => {});

    // Save session (cookies + localStorage — both are needed for a faithful session;
    // cookies alone leave the SPA as "User (Unknown)" with no permission map)
    const cookies = await ctx.cookies();
    const localStorageData = await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        out[k] = localStorage.getItem(k)!;
      }
      return out;
    }).catch(() => ({}));
    fs.writeFileSync(sessionFile, JSON.stringify({ cookies, localStorage: localStorageData }));
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
  const baseURL = env.BASE_URL || 'https://uat.bharatlims.ai';
  const lab     = env.LAB_NAME || 'Arbro - Delhi';
  const authDir = path.resolve(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const labKey = lab.replace(/\s+/g, '_');
  // Host-key the session filename so prod/uat sessions never collide (matches loginAs).
  const hostKey = baseURL.replace(/^https?:\/\//, '').replace(/[^\w.-]/g, '_') || 'default';

  const roles = [
    { key: 'admin',                user: env.ADMIN_USERNAME,               pass: env.ADMIN_PASSWORD },
  ];

  // Login roles sequentially to avoid hammering the server
  for (const role of roles) {
    if (!role.user || !role.pass) {
      console.log(`  ⏭  Skipping ${role.key} (no credentials)`);
      continue;
    }
    const sessionFile = path.join(authDir, `${role.key}__${labKey}__${hostKey}.json`);
    await createSession(baseURL, role.user, role.pass, lab, sessionFile);
  }

  console.log('[globalSetup] All sessions ready.\n');
}
