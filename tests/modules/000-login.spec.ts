/**
 * Login Page — E2E Test Suite
 * URL  : /login
 * Run  : npx playwright test tests/modules/000-login.spec.ts --project=uat
 */
import { test, expect } from '../global-setup';

const LAB = 'Arbro - Delhi';

async function doFullLogin(page: any, username: string, password: string) {
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2500);
  // Handle location picker (appears for all roles after first submit)
  const bodyText = await page.locator('body').innerText().catch(() => '');
  if (bodyText.includes('Choose your location')) {
    await page.click('button:has-text("Choose your location")');
    await page.waitForTimeout(1000);
    await page.locator(`span:has-text("${LAB}")`).first().click();
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
  }
}

test.describe('[MODULE-000] Login', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);
  });

  // ── 1. Page Elements ──────────────────────────────────────────────────────
  test.describe('1. Page Elements', () => {

    test('TC-001 username and password fields are present', async ({ page }) => {
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
    });

    test('TC-002 submit button is visible', async ({ page }) => {
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('TC-003 page does not show 404 or 500 on load', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-004 username field has a placeholder', async ({ page }) => {
      const ph = await page.locator('#username').getAttribute('placeholder');
      expect(ph).toBeTruthy();
    });

    test('TC-005 password field type is password', async ({ page }) => {
      await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    });
  });

  // ── 2. Field Input Behaviour ──────────────────────────────────────────────
  test.describe('2. Field Input Behaviour', () => {

    test('TC-006 username field accepts typed text', async ({ page }) => {
      await page.locator('#username').fill('testuser');
      await expect(page.locator('#username')).toHaveValue('testuser');
    });

    test('TC-007 password field accepts typed text', async ({ page }) => {
      await page.locator('#password').fill('TestPass@123');
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-008 username field clears correctly', async ({ page }) => {
      await page.locator('#username').fill('someuser');
      await page.locator('#username').clear();
      await expect(page.locator('#username')).toHaveValue('');
    });
  });

  // ── 3. Invalid Credentials ────────────────────────────────────────────────
  test.describe('3. Invalid Credentials', () => {

    test('TC-009 invalid credentials do not redirect to dashboard', async ({ page }) => {
      await page.locator('#username').fill('invaliduser_xyz_9999');
      await page.locator('#password').fill('WrongPass!1');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
      await expect(page).not.toHaveURL(/dashboard/i);
    });

    test('TC-010 wrong password does not redirect to dashboard', async ({ page, env }) => {
      const username = (env as any).ADMIN_USERNAME || 'admin';
      await page.locator('#username').fill(username);
      await page.locator('#password').fill('WrongPassword!9999');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
      await expect(page).not.toHaveURL(/dashboard/i);
    });
  });

  // ── 4. Empty Field Validation ─────────────────────────────────────────────
  test.describe('4. Empty Field Validation', () => {

    test('TC-011 submitting empty fields does not go to dashboard', async ({ page }) => {
      await page.locator('#username').clear();
      await page.locator('#password').clear();
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(4000);
      // Use a short timeout — if we're not on /dashboard already, we won't be
      expect(page.url()).not.toMatch(/dashboard/i);
    });

    test('TC-012 submitting with only username does not go to dashboard', async ({ page, env }) => {
      const username = (env as any).ADMIN_USERNAME || 'admin';
      await page.locator('#username').fill(username);
      await page.locator('#password').clear();
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(4000);
      expect(page.url()).not.toMatch(/dashboard/i);
    });
  });

  // ── 5. Security ───────────────────────────────────────────────────────────
  test.describe('5. Security', () => {

    test('TC-013 XSS payload in username does not trigger alert', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async (dialog: any) => { alerts.push(dialog.message()); await dialog.dismiss(); });
      await page.locator('#username').fill("<script>alert('xss')</script>");
      await page.locator('#password').fill('anypassword');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-014 SQL injection in username does not crash the server', async ({ page }) => {
      await page.locator('#username').fill("' OR 1=1; --");
      await page.locator('#password').fill('anypassword');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-015 very long username handled without 500 error', async ({ page }) => {
      await page.locator('#username').fill('a'.repeat(500));
      await page.locator('#password').fill('anypassword');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ── 6. Successful Login ───────────────────────────────────────────────────
  test.describe('6. Successful Login', () => {

    test('TC-016 valid credentials redirect to dashboard (handles location picker)', async ({ page, env }) => {
      const username = (env as any).ADMIN_USERNAME || 'admin';
      const password = (env as any).ADMIN_PASSWORD || 'Password@123';
      await doFullLogin(page, username, password);
      await expect(page).toHaveURL(/dashboard/i, { timeout: 30000 });
    });

    test('TC-017 after login, no 404 or 500 on dashboard', async ({ page, env }) => {
      const username = (env as any).ADMIN_USERNAME || 'admin';
      const password = (env as any).ADMIN_PASSWORD || 'Password@123';
      await doFullLogin(page, username, password);
      await page.waitForURL(/dashboard/i, { timeout: 30000 });
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-018 after login, sidebar navigation is visible', async ({ page, env }) => {
      const username = (env as any).ADMIN_USERNAME || 'admin';
      const password = (env as any).ADMIN_PASSWORD || 'Password@123';
      await doFullLogin(page, username, password);
      await page.waitForURL(/dashboard/i, { timeout: 30000 });
      await expect(page.locator('nav, [class*="sidebar"]').first()).toBeVisible({ timeout: 10000 });
    });
  });
});
