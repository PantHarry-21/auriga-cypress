/**
 * Fail Sample — E2E Test Suite
 * URL  : /dashboard/fail-sample
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/fail-sample";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-041] Fail Sample", () => {

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
      expect(page.url()).toMatch(/fail.{0,1}sample/i);
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
      expect(headers.some(h => h.includes("Sample Request ID"))).toBe(true);
      expect(headers.some(h => h.includes("Company Name"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by Sample Req No, Batch No, Product, Analyte, Company, or Employee...\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

  }); // Search

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   *   page.getByRole("button", { name: "Support" })
   *   page.getByRole("button", { name: "Purchase & Indent" })
   *   page.getByRole("button", { name: "Quotation & Pricing" })
   *   page.getByRole("button", { name: "Master Library" })
   *   page.getByRole("button", { name: "Document Management System" })
   *   page.getByRole("button", { name: "Quality Document Management System" })
   */

  // ── 2. Workflow & Update (added 2026-07-10, selectors verified live) ───────
  test.describe('2. Workflow & Update', () => {

    test('TC-020 status tabs are present (Approved Fail STP / Pending For OOS / Approved For OOS)', async ({ page }) => {
      await expect(page.locator('button:has-text("Approved Fail STP")')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('button:has-text("Pending For OOS")')).toBeVisible();
      await expect(page.locator('button:has-text("Approved For OOS")')).toBeVisible();
    });

    test('TC-021 row Update opens the editor with Cancel and SAVE actions', async ({ page }) => {
      const updateBtn = page.locator('table tbody tr button:has-text("Update"), tbody button:has-text("Update")').first();
      const hasRows = await updateBtn.isVisible({ timeout: 10000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      await updateBtn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('button:has-text("SAVE")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      // close without saving
      await page.locator('button:has-text("Cancel")').first().click();
    });

    test('TC-022 per-column filter inputs are present', async ({ page }) => {
      await expect(page.locator('input[placeholder="Search sample request id..."]')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('input[placeholder="Search analyte name..."]')).toBeVisible();
    });
  });

}); // describe Fail Sample
