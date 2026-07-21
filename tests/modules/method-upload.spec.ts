/**
 * Method Upload — Real E2E Test Suite
 * URL  : /dashboard/method/method-upload
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/method/method-upload';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-009] Method Upload', () => {

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
      expect(headers.some(h => h.includes('Method ID'))).toBe(true);
      expect(headers.some(h => h.includes('Product Name'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });
  });

  test.describe('2. Create Form', () => {

    test('TC-004 "New Method Upload" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Method Upload")')).toBeVisible();
    });

    test('TC-005 form opens and shows "Method Upload" title', async ({ page }) => {
      await page.click('button:has-text("New Method Upload")');
      await page.waitForTimeout(1200);
      const panel = page.locator('[class*="panel"] h2, [role="dialog"] h2, h2:has-text("Method")').first();
      await expect(panel).toBeVisible({ timeout: 8000 });
      await expect(panel).toContainText('Method');
    });

    test('TC-006 version number field is visible', async ({ page }) => {
      await page.click('button:has-text("New Method Upload")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="versionNo"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-007 version number accepts text', async ({ page }) => {
      await page.click('button:has-text("New Method Upload")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="versionNo"]').fill('v1.0');
      expect(await page.locator('input[name="versionNo"]').inputValue()).toBe('v1.0');
    });

    test('TC-008 file upload input is present', async ({ page }) => {
      await page.click('button:has-text("New Method Upload")');
      await page.waitForTimeout(1200);
      // Verified live 2026-07-10: "method-file-upload" is the input's id, not its name
      await expect(page.locator('#method-file-upload')).toBeAttached({ timeout: 8000 });
    });

    test('TC-009 Cancel button closes the form', async ({ page }) => {
      await page.click('button:has-text("New Method Upload")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="versionNo"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });

    test('TC-010 SAVE button is present on form', async ({ page }) => {
      await page.click('button:has-text("New Method Upload")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("SAVE")')).toBeVisible({ timeout: 8000 });
    });
  });
});
