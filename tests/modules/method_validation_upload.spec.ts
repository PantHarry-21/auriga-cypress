/**
 * Method Validation Upload — Real E2E Test Suite
 * URL  : /dashboard/method/validation-upload
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/method/validation-upload';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-010] Method Validation Upload', () => {

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
      expect(headers.some(h => h.includes('Method Name'))).toBe(true);
      expect(headers.some(h => h.includes('Method No'))).toBe(true);
      expect(headers.some(h => h.includes('Method Type'))).toBe(true);
    });
  });

  test.describe('2. Create Form', () => {

    test('TC-004 "New Method Validation" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Method Validation")')).toBeVisible();
    });

    test('TC-005 form opens with title', async ({ page }) => {
      await page.click('button:has-text("New Method Validation")');
      await page.waitForTimeout(1200);
      const panel = page.locator('[class*="panel"] h2, [role="dialog"] h2, h2:has-text("Validation")').first();
      await expect(panel).toBeVisible({ timeout: 8000 });
      await expect(panel).toContainText('Validation');
    });

    test('TC-006 methodName field is visible and accepts input', async ({ page }) => {
      await page.click('button:has-text("New Method Validation")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="methodName"]')).toBeVisible({ timeout: 8000 });
      await page.locator('input[name="methodName"]').fill('Test Method');
      expect(await page.locator('input[name="methodName"]').inputValue()).toBe('Test Method');
    });

    test('TC-007 methodType select dropdown present', async ({ page }) => {
      await page.click('button:has-text("New Method Validation")');
      await page.waitForTimeout(1200);
      await expect(page.locator('select[name="methodType"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-008 reportProtocolNo field visible', async ({ page }) => {
      await page.click('button:has-text("New Method Validation")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="reportProtocolNo"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-009 file upload input is present', async ({ page }) => {
      await page.click('button:has-text("New Method Validation")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="method-validation-file-upload"]')).toBeAttached({ timeout: 8000 });
    });

    test('TC-010 Cancel closes form, SAVE button present', async ({ page }) => {
      await page.click('button:has-text("New Method Validation")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="methodName"]').waitFor({ timeout: 8000 });
      await expect(page.locator('button:has-text("SAVE")')).toBeVisible();
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
