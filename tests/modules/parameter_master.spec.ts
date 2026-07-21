/**
 * Parameter (Analyte) Master — Real E2E Test Suite
 * URL  : /dashboard/testing/analyt-master-v2
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/analyt-master-v2';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-003] Parameter Master', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-002 table is visible with data', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    });

    test('TC-003 correct column headers', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Parameter Name'))).toBe(true);
      expect(headers.some(h => h.includes('Type'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });

    test('TC-004 status tabs are present', async ({ page }) => {
      await expect(page.locator('button:has-text("All")')).toBeVisible();
      await expect(page.locator('button:has-text("Approval Pending")')).toBeVisible();
    });
  });

  // ── 2. Search ────────────────────────────────────────────────────────────
  test.describe('2. Search', () => {

    test('TC-005 search input accepts text', async ({ page }) => {
      const search = page.locator('input[placeholder*="parameter name"]');
      await expect(search).toBeVisible();
      await search.fill('glucose');
      expect(await search.inputValue()).toBe('glucose');
    });

    test('TC-006 export button present', async ({ page }) => {
      // Verified live 2026-07-10: this list offers Excel export only (no PDF button)
      await expect(page.locator('button:has-text("Excel")')).toBeVisible();
    });
  });

  // ── 3. Create Form ───────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-007 "New Parameter" button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Parameter")')).toBeVisible();
    });

    test('TC-008 clicking "New Parameter" opens a search/create panel', async ({ page }) => {
      await page.click('button:has-text("New Parameter")');
      await page.waitForTimeout(1000);
      const searchInput = page.locator('input[placeholder*="parameter name, alias, or CAS"]');
      await expect(searchInput).toBeVisible({ timeout: 8000 });
    });

    test('TC-009 parameter search field accepts input', async ({ page }) => {
      await page.click('button:has-text("New Parameter")');
      await page.waitForTimeout(1000);
      const searchInput = page.locator('input[placeholder*="parameter name, alias, or CAS"]');
      await searchInput.fill('Glucose');
      expect(await searchInput.inputValue()).toBe('Glucose');
    });

    test('TC-010 Next Step and Cancel buttons are present', async ({ page }) => {
      await page.click('button:has-text("New Parameter")');
      await page.waitForTimeout(1000);
      await expect(page.locator('button:has-text("Next Step")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-011 Cancel closes the form', async ({ page }) => {
      await page.click('button:has-text("New Parameter")');
      await page.waitForTimeout(1000);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
