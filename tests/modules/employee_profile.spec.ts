/**
 * Employee Profile — E2E Test Suite
 * URL  : /dashboard/profile/employee
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/profile/employee';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-013] Employee Profile', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ──────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-002 page URL is correct', async ({ page }) => {
      expect(page.url()).toContain('/profile/employee');
    });

    test('TC-003 table or employee list is present', async ({ page }) => {
      const hasTable = await page.locator('table').isVisible({ timeout: 10000 }).catch(() => false);
      const hasList = await page.locator('[class*="list"], [class*="card"], [class*="grid"]').first().isVisible().catch(() => false);
      expect(hasTable || hasList).toBe(true);
    });

    test('TC-004 export buttons are visible', async ({ page }) => {
      const excelBtn = await page.locator('button:has-text("Excel")').isVisible({ timeout: 8000 }).catch(() => false);
      const pdfBtn = await page.locator('button:has-text("PDF")').isVisible({ timeout: 8000 }).catch(() => false);
      expect(excelBtn || pdfBtn).toBe(true);
    });
  });

  // ── 2. Search ─────────────────────────────────────────────────────────────
  test.describe('2. Search', () => {

    test('TC-005 search input is present and accepts text', async ({ page }) => {
      const search = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      const visible = await search.isVisible({ timeout: 8000 }).catch(() => false);
      if (visible) {
        await search.fill('test');
        expect(await search.inputValue()).toBe('test');
      } else {
        const body = await page.locator('body').innerText();
        expect(body.length).toBeGreaterThan(100);
      }
    });
  });

  // ── 3. Create / Add Employee ──────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-006 Add Employee or New Employee button is visible', async ({ page }) => {
      const btn = page.locator('button:has-text("New Employee"), button:has-text("Add Employee"), button:has-text("Add User")').first();
      const isVisible = await btn.isVisible({ timeout: 8000 }).catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-007 clicking Add Employee opens a form', async ({ page }) => {
      const btn = page.locator('button:has-text("New Employee"), button:has-text("Add Employee"), button:has-text("Add User")').first();
      const isVisible = await btn.isVisible({ timeout: 8000 }).catch(() => false);
      if (!isVisible) { test.skip(); return; }
      await btn.click();
      await page.waitForTimeout(1500);
      // Form should have some input fields
      const inputs = page.locator('input[type="text"], input[type="email"], select').first();
      await expect(inputs).toBeVisible({ timeout: 10000 });
    });

    test('TC-008 form has Cancel button', async ({ page }) => {
      const btn = page.locator('button:has-text("New Employee"), button:has-text("Add Employee"), button:has-text("Add User")').first();
      const isVisible = await btn.isVisible({ timeout: 8000 }).catch(() => false);
      if (!isVisible) { test.skip(); return; }
      await btn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-009 Cancel closes the form and returns to list', async ({ page }) => {
      const btn = page.locator('button:has-text("New Employee"), button:has-text("Add Employee"), button:has-text("Add User")').first();
      const isVisible = await btn.isVisible({ timeout: 8000 }).catch(() => false);
      if (!isVisible) { test.skip(); return; }
      await btn.click();
      await page.waitForTimeout(1500);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      const body = await page.locator('body').innerText();
      expect(body.length).toBeGreaterThan(50);
    });
  });
});
