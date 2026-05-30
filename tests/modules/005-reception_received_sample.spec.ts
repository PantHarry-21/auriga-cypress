/**
 * Reception Received Sample — E2E Test Suite
 * URL  : /dashboard/reception/received-sample
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/reception/received-sample";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-005] Reception Received Sample", () => {

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
      expect(page.url()).toMatch(/received.{0,1}sample/i);
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
      expect(headers.some(h => h.includes("TRF No"))).toBe(true);
      expect(headers.some(h => h.includes("Client Name"))).toBe(true);
    });

    test('TC-005 status filter tabs are present', async ({ page }) => {
      await expect(page.getByRole('button', { name: new RegExp("Pending", 'i') }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp("Approved", 'i') }).first()).toBeVisible();
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by client name or TRF number\"]").first();
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
   *   page.getByRole("button", { name: "Pending7" })
   *   page.getByRole("button", { name: "Sent for Activation2" })
   *   page.getByRole("button", { name: "Awaiting TRF3" })
   *   page.getByRole("button", { name: "Approved77" })
   *   page.getByRole("button", { name: "Rejected" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   *   page.getByRole("button", { name: "Support" })
   */

}); // describe Reception Received Sample
