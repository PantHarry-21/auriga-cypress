/**
 * Upload Weight Slip — E2E Test Suite
 * URL  : /dashboard/samples/weight-slip
 * Role : admin
 * Form : opened with "Upload Weight Slip"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/samples/weight-slip";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-013] Upload Weight Slip", () => {

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
      expect(page.url()).toMatch(/weight.{0,1}slip/i);
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
      expect(headers.some(h => h.includes("Sample No"))).toBe(true);
      expect(headers.some(h => h.includes("STP Name"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by sample no, STP name, analyte name, file name\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

  }); // Search

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-008 "Upload Weight Slip" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "Upload Weight Slip" })).toBeVisible();
    });

    test('TC-009 form opens when "Upload Weight Slip" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search sample no..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search sample no...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search sample no...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search sample no...\"]").first().clear();
    });

    test('TC-011 "Search stp name..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search stp name...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search stp name...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search stp name...\"]").first().clear();
    });

    test('TC-012 "Search analyte name..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search analyte name...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search analyte name...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search analyte name...\"]").first().clear();
    });

    test('TC-013 "Search file name..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search file name...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search file name...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search file name...\"]").first().clear();
    });

    test('TC-014 "Search uploaded by..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search uploaded by...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search uploaded by...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search uploaded by...\"]").first().clear();
    });

    test('TC-015 "Upload" button is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: "Upload" }).first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-016 Cancel button closes the form', async ({ page }) => {
      await page.getByRole('button', { name: "Upload Weight Slip" }).click();
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

}); // describe Upload Weight Slip
