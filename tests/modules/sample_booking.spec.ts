/**
 * Sample Booking — Real E2E Test Suite
 * URL  : /dashboard/samples/booking
 * Role : admin
 * Note : View-only module — no Add button, shows sample request list
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/samples/booking';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-016] Sample Booking', () => {

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
      expect(headers.some(h => h.includes('Sample Request No'))).toBe(true);
      expect(headers.some(h => h.includes('TRF No'))).toBe(true);
      expect(headers.some(h => h.includes('Client Name'))).toBe(true);
    });

    test('TC-004 status count tabs present', async ({ page }) => {
      // Tabs like "All12", "Not Started7", "In Progress1"
      const tabs = await page.locator('button[class*="inline-flex"], [role="tab"]').allTextContents();
      const hasAllTab = tabs.some(t => t.includes('All') || t.includes('Not Started') || t.includes('Completed'));
      expect(hasAllTab).toBe(true);
    });
  });

  test.describe('2. Search', () => {

    test('TC-005 search input works', async ({ page }) => {
      // Verified live 2026-07-10: placeholder is "Search by Sample Tracking No, TRF No, Client"
      const search = page.locator('input[placeholder="Search by Sample Tracking No, TRF No, Client"]');
      await expect(search).toBeVisible();
      await search.fill('SR-001');
      expect(await search.inputValue()).toBe('SR-001');
    });

    test('TC-006 export button visible', async ({ page }) => {
      // Verified live 2026-07-10: this list offers Excel export only (no PDF button)
      await expect(page.locator('button:has-text("Excel")')).toBeVisible();
    });
  });
});
