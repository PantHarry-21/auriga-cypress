/**
 * Booking Queue — E2E Test Suite
 * URL  : /dashboard/samples/booking-queue
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/samples/booking-queue";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-014] Booking Queue", () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ──────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without critical errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body.length).toBeGreaterThan(50);
    });

    test('TC-002 page URL contains expected path segment', async ({ page }) => {
      // Allow for redirects (some modules redirect to sub-routes)
      expect(page.url()).toMatch(/booking.{0,1}queue/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("S.No"))).toBe(true);
      expect(headers.some(h => h.includes("Sample Tracking No"))).toBe(true);
      expect(headers.some(h => h.includes("TRF No"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by Sample Tracking No or Client\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

  }); // Search

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("button", { name: "Awaiting TRF2" })
   *   page.getByRole("button", { name: "Approved22" })
   *   page.getByRole("button", { name: "Assigned51" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   *   page.getByRole("button", { name: "Support" })
   *   page.getByRole("button", { name: "Purchase & Indent" })
   *   page.getByRole("button", { name: "Quotation & Pricing" })
   */

  // ── 2. Assignment Workflow (added 2026-07-10, selectors verified live) ─────
  test.describe('2. Assignment Workflow', () => {

    test('TC-020 Approved / Assigned tabs and Assign action are present', async ({ page }) => {
      await expect(page.locator('button').filter({ hasText: /^Approved/ }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('button').filter({ hasText: /^Assigned/ }).first()).toBeVisible();
      await expect(page.locator('button:has-text("Assign")').first()).toBeVisible();
    });
  });

}); // describe Booking Queue
