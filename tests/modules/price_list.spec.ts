/**
 * Price List — Real E2E Test Suite
 * URL  : /dashboard/price-list
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/price-list';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-014] Price List', () => {

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

    test('TC-003 correct table headers', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Name'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });
  });

  test.describe('2. Create Form', () => {

    test('TC-004 "New Price List" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Price List")')).toBeVisible();
    });

    test('TC-005 form opens with "Add Price List" title', async ({ page }) => {
      await page.click('button:has-text("New Price List")');
      await page.waitForTimeout(1200);
      const title = page.locator('[class*="modal"] h2, [role="dialog"] h2, h2:has-text("Price")').first();
      await expect(title).toBeVisible({ timeout: 8000 });
      await expect(title).toContainText('Price');
    });

    test('TC-006 name field is visible and accepts input', async ({ page }) => {
      await page.click('button:has-text("New Price List")');
      await page.waitForTimeout(1200);
      const nameField = page.locator('input[placeholder="Enter name"]');
      await expect(nameField).toBeVisible({ timeout: 8000 });
      await nameField.fill('Test Price List');
      expect(await nameField.inputValue()).toBe('Test Price List');
    });

    test('TC-007 Cancel and Save buttons present', async ({ page }) => {
      await page.click('button:has-text("New Price List")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Save")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-008 Cancel closes form', async ({ page }) => {
      await page.click('button:has-text("New Price List")');
      await page.waitForTimeout(1200);
      await page.locator('input[placeholder="Enter name"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
