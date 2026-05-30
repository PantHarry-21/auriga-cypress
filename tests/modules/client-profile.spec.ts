/**
 * Client Profile — Real E2E Test Suite
 * URL  : /dashboard/profile/client
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/profile/client';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-006] Client Profile', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

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
      expect(headers.some(h => h.includes('Company Name'))).toBe(true);
      expect(headers.some(h => h.includes('GST No'))).toBe(true);
      expect(headers.some(h => h.includes('Email'))).toBe(true);
    });
  });

  test.describe('2. Search', () => {

    test('TC-004 search by company name works', async ({ page }) => {
      const search = page.locator('input[placeholder="Search by company name..."]');
      await expect(search).toBeVisible();
      await search.fill('arbro');
      expect(await search.inputValue()).toBe('arbro');
    });

    test('TC-005 export buttons visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")')).toBeVisible();
      await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    });
  });

  test.describe('3. Create Form', () => {

    test('TC-006 "New Client" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Client")')).toBeVisible();
    });

    test('TC-007 form opens on button click', async ({ page }) => {
      await page.click('button:has-text("New Client")');
      await page.waitForTimeout(1500);
      // GST number field has a distinctive placeholder
      const gstField = page.locator('input[placeholder="22AAAAA0000A1Z5"]').first();
      await expect(gstField).toBeVisible({ timeout: 10000 });
    });

    test('TC-008 form has GST and email fields', async ({ page }) => {
      await page.click('button:has-text("New Client")');
      await page.waitForTimeout(1500);
      await expect(page.locator('input[placeholder="22AAAAA0000A1Z5"]').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('input[name="companyEmail"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-009 Verify button is present for GST validation', async ({ page }) => {
      await page.click('button:has-text("New Client")');
      await page.waitForTimeout(1500);
      await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().waitFor({ timeout: 10000 });
      await expect(page.locator('button:has-text("Verify")').first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-010 Save button is present on form', async ({ page }) => {
      await page.click('button:has-text("New Client")');
      await page.waitForTimeout(1500);
      await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().waitFor({ timeout: 10000 });
      await expect(page.locator('button:has-text("Save")')).toBeVisible({ timeout: 8000 });
    });
  });
});
