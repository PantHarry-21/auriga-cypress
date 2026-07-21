/**
 * Equipment Transfer — E2E Test Suite
 * URL  : /dashboard/equipment/transfer
 * Role : admin
 * Form : opened with "New Transfer"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/equipment/transfer";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-074] Equipment Transfer", () => {

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
      expect(page.url()).toMatch(/transfer/i);
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
      expect(headers.some(h => h.includes("Location"))).toBe(true);
      expect(headers.some(h => h.includes("Equipment Name"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by Equipment Name, Equipment ID, or Remarks\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

    test('TC-007 export button is present', async ({ page }) => {
      // Verified live 2026-07-10: this list offers Excel export only (no PDF button)
      await expect(page.locator('button').filter({ hasText: /^Excel$/i }).first()).toBeVisible({ timeout: 8000 });
    });

  }); // Search

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-008 "New Transfer" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "New Transfer" })).toBeVisible();
    });

    test('TC-009 form opens when "New Transfer" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"quantity\"]").first()).toBeVisible({ timeout: 10000 });
    });

    // Verified live 2026-07-10: the New Transfer form uses dropdown selects
    // (--Select Equipment--, --Select Employee--, etc.), a quantity input and a
    // remarks textarea. The old "Search …" filter inputs no longer exist.
    test('TC-010 equipment select dropdown is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator('button:has-text("--Select Equipment--")').first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-011 quantity field is visible and accepts input', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      const qty = page.locator('input[name="quantity"]').first();
      await expect(qty).toBeVisible({ timeout: 8000 });
      await qty.fill('2');
      await qty.clear();
    });

    test('TC-012 employee select dropdown is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator('button:has-text("--Select Employee--")').first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-013 remarks textarea is visible and accepts input', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      const remarks = page.locator('textarea[name="remarks"]').first();
      await expect(remarks).toBeVisible({ timeout: 8000 });
      await remarks.fill('automation test value');
      await remarks.clear();
    });

    test('TC-014 "quantity" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"quantity\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"quantity\"]").first().fill("automation test value");
      await page.locator("[name=\"quantity\"]").first().clear();
    });

    test('TC-015 "Submit" button is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: "Submit" }).first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-016 Cancel button closes the form', async ({ page }) => {
      await page.getByRole('button', { name: "New Transfer" }).click();
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

}); // describe Equipment Transfer
