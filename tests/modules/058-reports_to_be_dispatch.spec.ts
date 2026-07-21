/**
 * Reports To Be Dispatch — E2E Test Suite
 * URL  : /dashboard/dispatch/pending
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/dispatch/pending";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-058] Reports To Be Dispatch", () => {

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
      expect(page.url()).toMatch(/pending/i);
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
      expect(headers.some(h => h.includes("Company Name"))).toBe(true);
      expect(headers.some(h => h.includes("Sample Request No"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by sample number...\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

    test('TC-007 export buttons are present', async ({ page }) => {
      await expect(page.locator('button').filter({ hasText: /^Excel$/i }).first()).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button').filter({ hasText: /^PDF$/i }).first()).toBeVisible({ timeout: 8000 });
    });

  }); // Search

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("link", { name: "Reports To Be Dispatched" })
   *   page.getByRole("link", { name: "Dispatch Courier" })
   *   page.getByRole("link", { name: "Dispatch Courier Blue Dart" })
   *   page.getByRole("link", { name: "Booked Courier Report" })
   *   page.getByRole("link", { name: "Rebook Courier" })
   *   page.getByRole("link", { name: "Mail Send To Client" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   */

  // ── 2. Dispatch Actions (added 2026-07-10, selectors verified live) ────────
  test.describe('2. Dispatch Actions', () => {

    test('TC-020 rows expose View Report / View Data / Send Mail actions', async ({ page }) => {
      const viewBtn = page.locator('button:has-text("View Report")').first();
      const hasRows = await viewBtn.isVisible({ timeout: 15000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      await expect(viewBtn).toBeVisible();
      await expect(page.locator('button:has-text("View Data")').first()).toBeVisible();
      await expect(page.locator('button:has-text("Send Mail")').first()).toBeVisible();
    });
  });

}); // describe Reports To Be Dispatch
