/**
 * Create Micro Template — E2E Test Suite
 * URL  : /dashboard/analyst/create-micro-template
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/analyst/create-micro-template";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-065] Create Micro Template", () => {

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
      expect(page.url()).toMatch(/create.{0,1}micro.{0,1}template/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("Template"))).toBe(true);
      expect(headers.some(h => h.includes("Headings"))).toBe(true);
      expect(headers.some(h => h.includes("Report Template"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      // Verified live 2026-07-10: placeholder is "Search by template name / STP / analyte / heading"
      const search = page.locator('input[placeholder="Search by template name / STP / analyte / heading"]').first();
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

  // ── 2. Template Editor (added 2026-07-10, selectors verified live) ─────────
  test.describe('2. Template Editor', () => {

    test('TC-020 "+ New Template" is present and the heading grid renders', async ({ page }) => {
      await expect(page.locator('button:has-text("New Template")').first()).toBeVisible({ timeout: 15000 });
      // The editor's heading grid (Heading1..Heading30) is part of the page
      await expect(page.locator('input[placeholder="Heading1"]')).toBeAttached({ timeout: 10000 });
    });

    test('TC-021 rows expose Open and Preview actions', async ({ page }) => {
      const openBtn = page.locator('button:has-text("Open")').first();
      const hasRows = await openBtn.isVisible({ timeout: 10000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      await expect(openBtn).toBeVisible();
      await expect(page.locator('button:has-text("Preview")').first()).toBeVisible();
    });

    test('TC-022 "Save Heading" and "Copy as new version" actions are present', async ({ page }) => {
      await expect(page.locator('button:has-text("Save Heading")')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('button:has-text("Copy as new version")')).toBeVisible();
    });
  });

}); // describe Create Micro Template
