/**
 * CRM Working Standard — E2E Test Suite
 * URL  : /dashboard/crm-working-standard
 * Role : admin
 * Form : opened with "New CRM"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/crm-working-standard";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-078] CRM Working Standard", () => {

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
      expect(page.url()).toMatch(/crm.{0,1}working.{0,1}standard/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("Serial No"))).toBe(true);
      expect(headers.some(h => h.includes("Product Name"))).toBe(true);
      expect(headers.some(h => h.includes("Code No"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by product name or code no...\"]").first();
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

    test('TC-008 "New CRM" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "New CRM" })).toBeVisible();
    });

    test('TC-009 form opens when "New CRM" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"productName\"]").first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search by product name or code no..." field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search by product name or code no...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search by product name or code no...\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search by product name or code no...\"]").first().clear();
    });

    test('TC-011 "productName" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"productName\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"productName\"]").first().fill("automation test value");
      await page.locator("[name=\"productName\"]").first().clear();
    });

    test('TC-012 "codeNo" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"codeNo\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"codeNo\"]").first().fill("automation test value");
      await page.locator("[name=\"codeNo\"]").first().clear();
    });

    test('TC-013 "versionNo" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"versionNo\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"versionNo\"]").first().fill("automation test value");
      await page.locator("[name=\"versionNo\"]").first().clear();
    });

    test('TC-014 "storageCondition" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"storageCondition\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"storageCondition\"]").first().fill("automation test value");
      await page.locator("[name=\"storageCondition\"]").first().clear();
    });

    test('TC-015 "Submit" button is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "New CRM" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: "Submit" }).first()).toBeVisible({ timeout: 8000 });
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

}); // describe CRM Working Standard
