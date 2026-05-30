/**
 * Product Master — Real E2E Test Suite
 * URL  : /dashboard/products/master
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL  = '/dashboard/products/master';
const LAB  = 'Arbro - Delhi';
const TS   = Date.now().toString().slice(-6);

test.describe('[MODULE-001] Product Master', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without 403/404/500 error', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('404 Not Found');
      expect(body).not.toContain('Internal Server Error');
      expect(body.length).toBeGreaterThan(100);
    });

    test('TC-002 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    });

    test('TC-003 table has correct column headers', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Brand Name'))).toBe(true);
      expect(headers.some(h => h.includes('Generic Name'))).toBe(true);
      expect(headers.some(h => h.includes('Actions'))).toBe(true);
    });

    test('TC-004 table has at least one data row', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  // ── 2. Search ────────────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-005 search input is visible and accepts input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search brand name..."]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('test');
      expect(await searchInput.inputValue()).toBe('test');
    });

    test('TC-006 columns button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")')).toBeVisible();
    });

    test('TC-007 filters button is visible', async ({ page }) => {
      // Use exact text to avoid matching "Clear All Filters"
      await expect(page.locator('button').filter({ hasText: /^Filters$/ })).toBeVisible();
    });

    test('TC-008 pagination controls are visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Next")')).toBeVisible();
      await expect(page.locator('button:has-text("Previous")')).toBeVisible();
    });
  });

  // ── 3. Create Form ───────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-009 "New Product" button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Product")')).toBeVisible();
    });

    test('TC-010 clicking "New Product" opens the create form', async ({ page }) => {
      await page.click('button:has-text("New Product")');
      await page.waitForTimeout(1500);
      // Verify form is open by checking for the Add button that appears in the form
      await expect(page.locator('button:has-text("Add")')).toBeVisible({ timeout: 10000 });
    });

    test('TC-011 create form has Add and Cancel buttons', async ({ page }) => {
      await page.click('button:has-text("New Product")');
      await page.waitForTimeout(1000);
      await expect(page.locator('button:has-text("Add")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-012 Cancel closes the form', async ({ page }) => {
      await page.click('button:has-text("New Product")');
      await page.waitForTimeout(1000);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      // Table should still be visible after cancel
      await expect(page.locator('table')).toBeVisible();
    });
  });

  // ── 4. Export ────────────────────────────────────────────────────────────
  test.describe('4. Export & Actions', () => {

    test('TC-013 row actions column is present', async ({ page }) => {
      const actionsHeader = page.locator('table thead th:has-text("Actions")');
      await expect(actionsHeader).toBeVisible();
    });
  });
});
