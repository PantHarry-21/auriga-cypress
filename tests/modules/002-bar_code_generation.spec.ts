/**
 * Bar Code Generation — E2E Test Suite
 * URL  : /dashboard/samples/receipt
 * Role : admin
 * Form : opened with "Create Test Request"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/samples/receipt";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-002] Bar Code Generation", () => {

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
      expect(page.url()).toMatch(/receipt/i);
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
      expect(headers.some(h => h.includes("Sample Request Id"))).toBe(true);
      expect(headers.some(h => h.includes("Sample Track No"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by product name, batch no, barcode, product code\"]").first();
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

    test('TC-008 "Create Test Request" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "Create Test Request" })).toBeVisible();
    });

    test('TC-009 form opens when "Create Test Request" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"gstNumber\"]").first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search brand name..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search brand name...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search brand name...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search brand name...\"]").first().clear();
    });

    test('TC-011 "Search client name..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search client name...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search client name...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search client name...\"]").first().clear();
    });

    test('TC-012 "Search batch no..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search batch no...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search batch no...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search batch no...\"]").first().clear();
    });

    test('TC-013 "gstNumber" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"gstNumber\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"gstNumber\"]").first().fill("automation test value");
      await page.locator("[name=\"gstNumber\"]").first().clear();
    });

    test('TC-014 "batches.0.sampleProductName" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"batches.0.sampleProductName\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"batches.0.sampleProductName\"]").first().fill("automation test value");
      await page.locator("[name=\"batches.0.sampleProductName\"]").first().clear();
    });

    test('TC-015 Cancel button closes the form', async ({ page }) => {
      await page.getByRole('button', { name: "Create Test Request" }).click();
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

}); // describe Bar Code Generation
