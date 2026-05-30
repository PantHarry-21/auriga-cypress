/**
 * NABL Scope — Real E2E Test Suite
 * URL  : /dashboard/nabl-scope
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/nabl-scope';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-017] NABL Scope', () => {

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
      expect(headers.some(h => h.includes('Discipline'))).toBe(true);
      expect(headers.some(h => h.includes('Product/Matrix'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });
  });

  test.describe('2. Create Form', () => {

    test('TC-004 "New Entry" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Entry")')).toBeVisible();
    });

    test('TC-005 form opens with "New NABL Scope Entry" title', async ({ page }) => {
      await page.click('button:has-text("New Entry")');
      await page.waitForTimeout(1200);
      const title = page.locator('[class*="panel"] h2, [role="dialog"] h2, h2:has-text("NABL")').first();
      await expect(title).toBeVisible({ timeout: 8000 });
      await expect(title).toContainText('NABL');
    });

    test('TC-006 scopeYear field visible', async ({ page }) => {
      await page.click('button:has-text("New Entry")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="scopeYear"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-007 Cancel and Create buttons present', async ({ page }) => {
      await page.click('button:has-text("New Entry")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Create")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-008 Cancel closes form', async ({ page }) => {
      await page.click('button:has-text("New Entry")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="scopeYear"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
