/**
 * Generic Master — Real E2E Test Suite
 * URL  : /dashboard/products/generic-master
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/products/generic-master';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-002] Generic Master', () => {

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

    test('TC-003 correct table headers present', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Generic Name'))).toBe(true);
      expect(headers.some(h => h.includes('Matrix Name'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });

    test('TC-004 status tabs are present', async ({ page }) => {
      await expect(page.locator('button:has-text("Active")')).toBeVisible();
      await expect(page.locator('button:has-text("Approval Pending")')).toBeVisible();
    });
  });

  // ── 2. Search & Filter ───────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-005 search input works', async ({ page }) => {
      // Verified live 2026-07-10: list search placeholder is "Search by Generic Name"
      const search = page.locator('input[placeholder="Search by Generic Name"]').first();
      await expect(search).toBeVisible();
      await search.fill('auto');
      expect(await search.inputValue()).toBe('auto');
    });

    test('TC-006 export button present', async ({ page }) => {
      // Verified live 2026-07-10: this list offers Excel export only (no PDF button)
      await expect(page.locator('button:has-text("Excel")')).toBeVisible();
    });
  });

  // ── 3. Create Form ───────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-007 "New Generic Master" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Generic Master")')).toBeVisible();
    });

    test('TC-008 form opens on button click', async ({ page }) => {
      await page.click('button:has-text("New Generic Master")');
      await page.waitForTimeout(1000);
      await expect(page.locator('input[name="genericName"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-009 form has key fields', async ({ page }) => {
      await page.click('button:has-text("New Generic Master")');
      await page.waitForTimeout(1000);
      await expect(page.locator('input[name="genericName"]')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('input[name="version"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-010 genericName field accepts input', async ({ page }) => {
      await page.click('button:has-text("New Generic Master")');
      await page.waitForTimeout(1000);
      await page.locator('input[name="genericName"]').fill('Test Generic');
      expect(await page.locator('input[name="genericName"]').inputValue()).toBe('Test Generic');
    });

    test('TC-011 Cancel button closes form', async ({ page }) => {
      await page.click('button:has-text("New Generic Master")');
      await page.waitForTimeout(1000);
      await page.locator('input[name="genericName"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });

    test('TC-012 Submit for Review button is present on form', async ({ page }) => {
      await page.click('button:has-text("New Generic Master")');
      await page.waitForTimeout(1000);
      await expect(page.locator('button:has-text("Submit for Review")')).toBeVisible({ timeout: 8000 });
    });
  });
});
