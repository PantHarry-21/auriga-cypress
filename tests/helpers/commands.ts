import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─── Role credentials ─────────────────────────────────────────────────────────
export function getRoleCredentials(env: Record<string, string>) {
  return {
    admin:                { username: env.ADMIN_USERNAME,               password: env.ADMIN_PASSWORD },
    reception:            { username: env.RECEPTION_USERNAME,           password: env.RECEPTION_PASSWORD },
    booking_personel:     { username: env.BOOKING_PERSONEL_USERNAME,    password: env.BOOKING_PERSONEL_PASSWORD },
    master_personel:      { username: env.MASTER_PERSONEL_USERNAME,     password: env.MASTER_PERSONEL_PASSWORD },
    master_controler:     { username: env.MASTER_CONTROLER_USERNAME,    password: env.MASTER_CONTROLER_PASSWORD },
    analyst:              { username: env.ANALYST_USERNAME,             password: env.ANALYST_PASSWORD },
    department_reviewer:  { username: env.DEPARTMENT_REVIEWER_USERNAME, password: env.DEPARTMENT_REVIEWER_PASSWORD },
    department_head:      { username: env.DEPARTMENT_HEAD_USERNAME,     password: env.DEPARTMENT_HEAD_PASSWORD },
    compilation:          { username: env.COMPILATION_USERNAME,         password: env.COMPILATION_PASSWORD },
    reviewer:             { username: env.REVIEWER_USERNAME,            password: env.REVIEWER_PASSWORD },
    person_incharge:      { username: env.PERSON_INCHARGE_USERNAME,     password: env.PERSON_INCHARGE_PASSWORD },
    customer_coordinator: { username: env.CUSTOMER_COORDINATOR_USERNAME,password: env.CUSTOMER_COORDINATOR_PASSWORD },
    sales_personel_am:    { username: env.SALES_PERSONEL_AM_USERNAME,   password: env.SALES_PERSONEL_AM_PASSWORD },
    accountant_admin:     { username: env.ACCOUNTANT_ADMIN_USERNAME,    password: env.ACCOUNTANT_ADMIN_PASSWORD },
    accountant_crm:       { username: env.ACCOUNTANT_CRM_USERNAME,      password: env.ACCOUNTANT_CRM_PASSWORD },
    quality_personel:     { username: env.QUALITY_PERSONEL_USERNAME,    password: env.QUALITY_PERSONEL_PASSWORD },
    quality_manger:       { username: env.QUALITY_MANGER_USERNAME,      password: env.QUALITY_MANGER_PASSWORD },
    booking_personnel:    { username: env.BOOKING_PERSONEL_USERNAME,    password: env.BOOKING_PERSONEL_PASSWORD },
    master_personnel:     { username: env.MASTER_PERSONEL_USERNAME,     password: env.MASTER_PERSONEL_PASSWORD },
    master_controller:    { username: env.MASTER_CONTROLER_USERNAME,    password: env.MASTER_CONTROLER_PASSWORD },
    quality_manager:      { username: env.QUALITY_MANGER_USERNAME,      password: env.QUALITY_MANGER_PASSWORD },
  } as Record<string, { username: string; password: string }>;
}

// ─── Stub Stimulsoft blocking scripts ─────────────────────────────────────────
export async function stubStimulsoft(context: BrowserContext) {
  await context.route('**/stimulsoft*.js', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stubbed */' })
  );
}

// ─── Core login flow ───────────────────────────────────────────────────────────
// EXACT FLOW (confirmed against live app):
//   1. Navigate to /login
//   2. Fill username + password
//   3. Click "Sign in" (button[type="submit"]) — first click
//   4. Location picker appears on same page
//   5. Click "Choose your location" button to open dropdown
//   6. Click the lab name span to select it
//   7. Click "Sign in" again — second click
//   8. Dashboard loads
//
// This flow applies to ALL roles (not admin-only).
export async function loginAs(
  page: Page,
  context: BrowserContext,
  roleKey: string,
  env: Record<string, string>,
  labName?: string
) {
  const credentials = getRoleCredentials(env);
  const creds = credentials[roleKey];
  if (!creds) throw new Error(`No credentials for role_key="${roleKey}"`);
  if (!creds.username || !creds.password)
    throw new Error(`Credentials for "${roleKey}" are incomplete. Check .env file.`);

  const lab = labName || env.LAB_NAME || 'Arbro - Delhi';
  const sessionFile = path.join(__dirname, '../../.auth', `${roleKey}__${lab.replace(/\s+/g, '_')}.json`);

  // ── Try reusing a saved session (inject cookies directly — no extra navigation) ──
  if (fs.existsSync(sessionFile)) {
    try {
      const saved = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
      if (saved.cookies?.length) {
        // Check cookie expiry before injecting (avoids silent failures)
        const nowSec = Date.now() / 1000;
        const stillValid = saved.cookies.some((c: any) => !c.expires || c.expires > nowSec + 60);
        if (stillValid) {
          await context.addCookies(saved.cookies);
          // No /dashboard navigation here — the test's own page.goto handles it.
          // If the session is actually expired, the test page will redirect to /login
          // and the test will fail fast with a clear error rather than a slow timeout.
          return;
        }
      }
    } catch {
      // corrupted session — fall through to fresh login
    }
    try { fs.unlinkSync(sessionFile); } catch { /* ignore */ }
  }

  // ── Fresh login ───────────────────────────────────────────────────────────
  await stubStimulsoft(context);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(1500);

  // Handle transient 500 errors
  const initialBody = await page.locator('body').innerText().catch(() => '');
  if (initialBody.includes('500') || initialBody.includes('Internal Server Error')) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  }

  // Fill credentials
  await page.waitForSelector('#username', { timeout: 15000 });
  await page.fill('#username', creds.username);
  await page.fill('#password', creds.password);

  // ── Step 3: First Sign in click ───────────────────────────────────────────
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);

  // ── Handle password reset screen ─────────────────────────────────────────
  const urlAfterSignin = page.url();
  const bodyAfterSignin = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  if (urlAfterSignin.includes('/password-reset') || bodyAfterSignin.toLowerCase().includes('reset password')) {
    console.log(`🔄 Password reset required for ${roleKey} — resetting with same password...`);
    await page.waitForSelector('input[type="password"]', { timeout: 10000 }).catch(() => {});
    const pwInputs = await page.locator('input[type="password"]').all();
    if (pwInputs.length >= 2) {
      await pwInputs[0].fill(creds.password);
      await pwInputs[1].fill(creds.password);
      if (pwInputs.length >= 3) await pwInputs[2].fill(creds.password);
    }
    const resetBtn = page.locator('button[type="submit"], button:has-text("Reset"), button:has-text("Save"), button:has-text("Confirm")').first();
    if (await resetBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await resetBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // ── Step 5+6+7: Location picker (applies to ALL roles) ───────────────────
  const bodyForLocation = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  if (bodyForLocation.includes('Choose your location')) {
    // Open the location dropdown
    await page.click('button:has-text("Choose your location")');
    await page.waitForTimeout(1000);

    // Select the lab by name
    const labSpan = page.locator(`span:has-text("${lab}")`).first();
    const found = await labSpan.isVisible({ timeout: 5000 }).catch(() => false);
    if (found) {
      await labSpan.click();
    } else {
      // Fallback: click any first available lab item
      const firstLab = page.locator('div.relative.cursor-pointer span, li span').first();
      await firstLab.click({ timeout: 5000 }).catch(() => {});
    }
    await page.waitForTimeout(500);

    // Second Sign in click
    await page.click('button[type="submit"]');
  }

  // ── Wait for dashboard ────────────────────────────────────────────────────
  await page.waitForURL('**/dashboard**', { timeout: 60000 });
  console.log(`✅ Logged in as ${roleKey} → ${page.url()}`);

  // Save session cookies for reuse
  const authDir = path.join(__dirname, '../../.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  const cookies = await context.cookies();
  fs.writeFileSync(sessionFile, JSON.stringify({ cookies }));
}

// ─── Clear all saved sessions ─────────────────────────────────────────────────
export function clearAllSessions() {
  const authDir = path.join(__dirname, '../../.auth');
  if (fs.existsSync(authDir)) {
    fs.readdirSync(authDir).forEach(f => {
      try { fs.unlinkSync(path.join(authDir, f)); } catch { /* ignore */ }
    });
  }
}

// ─── Clear one role's session so the next loginAs forces a fresh login ────────
// Use this before verifying permission changes — stale cookies won't reflect
// permission updates made by admin until the role logs in fresh.
export function clearRoleSession(roleKey: string, labName = 'Arbro - Delhi') {
  const sessionFile = path.join(
    __dirname, '../../.auth',
    `${roleKey}__${labName.replace(/\s+/g, '_')}.json`
  );
  try { fs.unlinkSync(sessionFile); } catch { /* ignore if not present */ }
}

// ─── Fresh login (clear sessions then login) ──────────────────────────────────
export async function freshLoginAs(
  page: Page,
  context: BrowserContext,
  roleKey: string,
  env: Record<string, string>,
  labName?: string
) {
  clearAllSessions();
  await loginAs(page, context, roleKey, env, labName);
}

// ─── Get role permissions from fixture ───────────────────────────────────────
export function getRolePermissions(roleKey: string) {
  const fixturePath = path.join(__dirname, '../fixtures/roles-permissions.json');
  if (!fs.existsSync(fixturePath)) return null;
  const data = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  return data.roles?.find((r: { role_key: string }) => r.role_key === roleKey) || null;
}

// ─── Wait for a network response matching URL pattern ────────────────────────
export async function waitForResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(urlPattern);
}

// ─── Load a fixture file ─────────────────────────────────────────────────────
export function loadFixture<T = unknown>(fixtureName: string): T {
  const fixturePath = path.join(__dirname, '../fixtures', fixtureName);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as T;
}
