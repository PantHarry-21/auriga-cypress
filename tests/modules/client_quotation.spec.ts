/**
 * Client Quotation — Real E2E Test Suite
 * URL  : /dashboard/quotation/client
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/quotation/client';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-007] Client Quotation', () => {

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
      expect(headers.some(h => h.includes('Quotation No'))).toBe(true);
      expect(headers.some(h => h.includes('Title'))).toBe(true);
      expect(headers.some(h => h.includes('Client Name'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });
  });

  test.describe('2. Search', () => {

    test('TC-004 search input works', async ({ page }) => {
      const search = page.locator('input[placeholder*="quotation no"]');
      await expect(search).toBeVisible();
      await search.fill('Q-001');
      expect(await search.inputValue()).toBe('Q-001');
    });
  });

  test.describe('3. Create Form', () => {

    test('TC-005 "New Quotation" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Quotation")')).toBeVisible();
    });

    test('TC-006 form opens with title "New Client Quotation"', async ({ page }) => {
      await page.click('button:has-text("New Quotation")');
      await page.waitForTimeout(1200);
      const title = page.locator('[class*="panel"] h2, [role="dialog"] h2, h2:has-text("Quotation")').first();
      await expect(title).toBeVisible({ timeout: 8000 });
      await expect(title).toContainText('Quotation');
    });

    test('TC-007 form has subject and contact fields', async ({ page }) => {
      await page.click('button:has-text("New Quotation")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="quotationSubject"]')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('input[name="contactPerson"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-008 contact fields accept input', async ({ page }) => {
      await page.click('button:has-text("New Quotation")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="quotationSubject"]').fill('Test Quote Subject');
      expect(await page.locator('input[name="quotationSubject"]').inputValue()).toBe('Test Quote Subject');
    });

    test('TC-009 Cancel button closes the form', async ({ page }) => {
      await page.click('button:has-text("New Quotation")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="quotationSubject"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });

    test('TC-010 Generate Quotation button present on form', async ({ page }) => {
      await page.click('button:has-text("New Quotation")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("Generate Quotation")')).toBeVisible({ timeout: 8000 });
    });
  });
});
