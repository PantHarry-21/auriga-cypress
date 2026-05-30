/**
 * Client Purchase Order — Real E2E Test Suite
 * URL  : /dashboard/purchase/client-purchase-order
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/client-purchase-order';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-015] Client Purchase Order', () => {

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

    test('TC-002 table visible with data', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    });

    test('TC-003 correct table headers', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Client Name'))).toBe(true);
      expect(headers.some(h => h.includes('PO Number'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });
  });

  test.describe('2. Create Form', () => {

    test('TC-004 "New Purchase Order" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Purchase Order")')).toBeVisible();
    });

    test('TC-005 form opens with "Add Purchase Order" title', async ({ page }) => {
      await page.click('button:has-text("New Purchase Order")');
      await page.waitForTimeout(1200);
      const title = page.locator('[class*="modal"] h2, [role="dialog"] h2, h2:has-text("Purchase")').first();
      await expect(title).toBeVisible({ timeout: 8000 });
      await expect(title).toContainText('Purchase');
    });

    test('TC-006 PO number field accepts input', async ({ page }) => {
      await page.click('button:has-text("New Purchase Order")');
      await page.waitForTimeout(1200);
      const poField = page.locator('input[name="poNo"]');
      await expect(poField).toBeVisible({ timeout: 8000 });
      await poField.fill('PO-TEST-123');
      expect(await poField.inputValue()).toBe('PO-TEST-123');
    });

    test('TC-007 PO amount field visible', async ({ page }) => {
      await page.click('button:has-text("New Purchase Order")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="poAmount"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-008 remarks textarea visible', async ({ page }) => {
      await page.click('button:has-text("New Purchase Order")');
      await page.waitForTimeout(1200);
      await expect(page.locator('textarea[name="remarks"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-009 Cancel and Create buttons present', async ({ page }) => {
      await page.click('button:has-text("New Purchase Order")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Create")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-010 Cancel closes form', async ({ page }) => {
      await page.click('button:has-text("New Purchase Order")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="poNo"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
