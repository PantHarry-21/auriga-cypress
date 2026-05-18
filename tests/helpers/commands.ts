import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─── Role credentials (reads from project env passed via playwright.config.ts) ─
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
  } as Record<string, { username: string; password: string }>;
}

// ─── Stub Stimulsoft blocking scripts ────────────────────────────────────────
export async function stubStimulsoft(context: BrowserContext) {
  await context.route('**/stimulsoft*.js', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stubbed for test performance */' })
  );
}

// ─── Core login flow ──────────────────────────────────────────────────────────
// Equivalent of cy.loginAs(roleKey, labName)
// Handles two login types:
//   - ADMIN: Requires location selection after login
//   - REGULAR USERS: No location selection needed
// Uses Playwright storageState to cache sessions (equivalent of cy.session).
export async function loginAs(
  page: Page,
  context: BrowserContext,
  roleKey: string,
  env: Record<string, string>,
  labName?: string
) {
  const credentials = getRoleCredentials(env);
  const creds = credentials[roleKey];
  if (!creds) throw new Error(`No credentials configured for role_key="${roleKey}"`);
  if (!creds.username || !creds.password) {
    console.error('Environment variables missing for role:', roleKey);
    console.error('Available keys in env:', Object.keys(env));
    throw new Error(`Credentials for "${roleKey}" are incomplete. Check your .env file.`);
  }

  const lab = labName || env.LAB_NAME;
  const isAdmin = roleKey === 'admin';
  const sessionFile = path.join(__dirname, '../../.auth', `${roleKey}__${lab || 'default'}.json`);

  // Reuse saved session if it exists and is valid
  if (fs.existsSync(sessionFile)) {
    try {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
      if (sessionData.cookies && sessionData.cookies.length > 0) {
        await context.addCookies(sessionData.cookies);
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (page.url().includes('/dashboard')) return;
      }
    } catch (e) {
      // Session file invalid or corrupted, continue with fresh login
    }
  }

  await stubStimulsoft(context);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Handle transient server errors
  const initialBody = await page.locator('body').innerText().catch(() => '');
  if (initialBody.includes('Internal Server Error') || initialBody.includes('500')) {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  // Fill login credentials
  await page.waitForSelector('[name="username"]', { timeout: 15000 });
  await page.fill('[name="username"]', creds.username);
  await page.fill('[name="password"]', creds.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for page to load and check for password reset requirement
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Handle password reset if required
  let currentUrl = page.url();
  let bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');

  if (currentUrl.includes('/password-reset') || bodyText.includes('Reset') || bodyText.includes('Password') || bodyText.includes('reset')) {
    console.log(`🔄 Password reset required for ${roleKey}. Resetting with same credentials...`);

    // Wait for password input fields
    await page.waitForSelector('input[type="password"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Find all password input fields
    const passwordInputs = await page.locator('input[type="password"]').all();
    const inputCount = passwordInputs.length;

    if (inputCount >= 2) {
      try {
        if (inputCount === 2) {
          // Two fields: new password, confirm password
          await passwordInputs[0].fill(creds.password);
          await passwordInputs[1].fill(creds.password);
        } else if (inputCount >= 3) {
          // Three or more fields: current password, new password, confirm password
          await passwordInputs[0].fill(creds.password); // current
          await passwordInputs[1].fill(creds.password); // new
          await passwordInputs[2].fill(creds.password); // confirm
        }

        // Submit reset form - try multiple button selectors
        let submitted = false;
        const buttonSelectors = [
          'button:has-text("Reset Password")',
          'button:has-text("Save")',
          'button:has-text("Confirm")',
          'button:has-text("Submit")',
          'button:has-text("Update")',
          'button:has-text("Change")',
          'button[type="submit"]',
        ];

        for (const selector of buttonSelectors) {
          const btn = page.locator(selector).first();
          if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await btn.click();
            submitted = true;
            console.log(`✅ Password reset form submitted`);
            break;
          }
        }

        if (submitted) {
          await page.waitForTimeout(2000);
          console.log(`✅ Password reset completed for ${roleKey}`);
        }
      } catch (error) {
        console.log(`⚠️ Password reset error: ${error}`);
      }
    }
  }

  // ADMIN LOGIN: Wait for and handle location picker
  if (isAdmin) {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const txt = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
      if (txt.includes('Choose your location')) break;
      if (!page.url().includes('/login') && !page.url().includes('/password-reset')) break;
      await page.waitForTimeout(200);
    }

    bodyText = await page.locator('body').innerText().catch(() => '');
    if (bodyText.includes('Choose your location')) {
      await page.getByRole('button', { name: /choose your location/i }).click();
      await page.waitForTimeout(500);
      if (lab) {
        await page.locator('span').filter({ hasText: new RegExp(lab.split(' ')[0], 'i') }).first().click({ timeout: 8000 });
      } else {
        await page.locator('span[class*="cursor-pointer"], li').first().click();
      }
      await page.waitForTimeout(200);
      await page.getByRole('button', { name: /sign in/i }).click();
    }
  }

  // Wait for dashboard to load (works for both admin and regular users)
  await page.waitForURL('**/dashboard**', { timeout: 45000 });

  // Verify we're on dashboard
  await page.waitForSelector('body', { timeout: 10000 });

  // Save session to disk for faster subsequent logins
  const authDir = path.join(__dirname, '../../.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  const cookies = await context.cookies();
  fs.writeFileSync(sessionFile, JSON.stringify({ cookies }));
}

// ─── Clear all saved sessions ─────────────────────────────────────────────────
// Equivalent of cy.clearAllSessions()
export function clearAllSessions() {
  const authDir = path.join(__dirname, '../../.auth');
  if (fs.existsSync(authDir)) {
    fs.readdirSync(authDir).forEach(f => fs.unlinkSync(path.join(authDir, f)));
  }
}

// ─── Fresh login (clear sessions then login) ─────────────────────────────────
// Equivalent of cy.freshLoginAs(roleKey, labName)
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
// Equivalent of cy.getRolePermissions(roleKey)
export function getRolePermissions(roleKey: string) {
  const fixturePath = path.join(__dirname, '../fixtures/roles-permissions.json');
  const data = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  return data.roles.find((r: { role_key: string }) => r.role_key === roleKey);
}

// ─── Wait for a network response matching URL pattern ────────────────────────
// Equivalent of cy.wait('@alias') after cy.intercept()
export async function waitForResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(urlPattern);
}

// ─── Load a fixture file ─────────────────────────────────────────────────────
// Equivalent of cy.fixture('filename')
// NOTE: no direct equivalent — using direct JSON import instead
export function loadFixture<T = unknown>(fixtureName: string): T {
  const fixturePath = path.join(__dirname, '../fixtures', fixtureName);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as T;
}
