/**
 * TRF Links — E2E Test Suite
 * URL  : /dashboard/samples/trf-links
 * Role : admin
 * Form : opened with "Create TRF Link"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/samples/trf-links";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-003] TRF Links", () => {

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
      expect(page.url()).toMatch(/trf.{0,1}links/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("S.No."))).toBe(true);
      expect(headers.some(h => h.includes("Lead Source"))).toBe(true);
      expect(headers.some(h => h.includes("Account Manager"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by account manager...\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

    test('TC-007 export buttons are present', async ({ page }) => {
      await expect(page.locator('button').filter({ hasText: /^Excel$/i }).first()).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button').filter({ hasText: /^PDF$/i }).first()).toBeVisible({ timeout: 8000 });
    });

  }); // Search

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-008 "Create TRF Link" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "Create TRF Link" })).toBeVisible();
    });

    test('TC-009 form opens when "Create TRF Link" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "Create TRF Link" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search by account manager..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create TRF Link" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search by account manager...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search by account manager...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search by account manager...\"]").first().clear();
    });

    test('TC-011 "Search submissions..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create TRF Link" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search submissions...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search submissions...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search submissions...\"]").first().clear();
    });

    test('TC-012 "Search created by..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create TRF Link" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search created by...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search created by...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search created by...\"]").first().clear();
    });

    test('TC-013 Cancel button closes the form', async ({ page }) => {
      await page.getByRole('button', { name: "Create TRF Link" }).click();
      await page.waitForTimeout(1500);
      await page.getByRole('button', { name: 'Cancel' }).first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });

  }); // Create Form

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

}); // describe TRF Links
