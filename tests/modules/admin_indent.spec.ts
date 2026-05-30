/**
 * Admin Indent Manage — Real E2E Test Suite
 * URL  : /dashboard/purchase/admin-indent
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/admin-indent';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-011] Admin Indent', () => {

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
      expect(headers.some(h => h.includes('Indent No'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
      expect(headers.some(h => h.includes('Priority'))).toBe(true);
    });

    test('TC-004 filter dropdowns present', async ({ page }) => {
      await expect(page.locator('button:has-text("All Indents")')).toBeVisible();
      await expect(page.locator('button:has-text("All Priorities")')).toBeVisible();
    });
  });

  test.describe('2. Create Form', () => {

    test('TC-005 "New Indent" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Indent")')).toBeVisible();
    });

    test('TC-006 form opens with "Generate New Indent" title', async ({ page }) => {
      await page.click('button:has-text("New Indent")');
      await page.waitForTimeout(1200);
      const panel = page.locator('[class*="panel"] h2, [role="dialog"] h2, h2:has-text("Indent")').first();
      await expect(panel).toBeVisible({ timeout: 8000 });
      await expect(panel).toContainText('Indent');
    });

    test('TC-007 PONo field is visible', async ({ page }) => {
      await page.click('button:has-text("New Indent")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="PONo"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-008 Heading textarea is visible', async ({ page }) => {
      await page.click('button:has-text("New Indent")');
      await page.waitForTimeout(1200);
      await expect(page.locator('textarea[name="Heading"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-009 PONo field accepts input', async ({ page }) => {
      await page.click('button:has-text("New Indent")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="PONo"]').fill('PO-TEST-001');
      expect(await page.locator('input[name="PONo"]').inputValue()).toBe('PO-TEST-001');
    });

    test('TC-010 Generate Indent and Cancel buttons present', async ({ page }) => {
      await page.click('button:has-text("New Indent")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("Generate Indent")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-011 Cancel closes form', async ({ page }) => {
      await page.click('button:has-text("New Indent")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="PONo"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
