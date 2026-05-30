/**
 * Method development — E2E Test Suite
 * URL  : /dashboard/method/development
 * Role : admin
 * Form : opened with "New Method Development"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/method/development";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-035] Method development", () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ──────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without 403/500 errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body.length).toBeGreaterThan(100);
    });

    test('TC-002 page URL contains expected path segment', async ({ page }) => {
      expect(page.url()).toContain("development");
    });

    test('TC-003 data table is visible with at least one row', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("Serial No"))).toBe(true);
      expect(headers.some(h => h.includes("Method Title"))).toBe(true);
      expect(headers.some(h => h.includes("Method Code"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

    test('TC-007 export buttons are present', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Excel' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
    });

  }); // Search

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-08 "New Method Development" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "New Method Development" })).toBeVisible();
    });

    test('TC-09 form opens when "New Method Development" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search\"]").first().fill('automation test value');
      await page.locator("input[placeholder=\"Search\"]").first().clear();
    });

    test('TC-011 "Search method title..." field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search method title...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search method title...\"]").first().fill('automation test value');
      await page.locator("input[placeholder=\"Search method title...\"]").first().clear();
    });

    test('TC-012 "Search method code..." field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search method code...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search method code...\"]").first().fill('automation test value');
      await page.locator("input[placeholder=\"Search method code...\"]").first().clear();
    });

    test('TC-013 "Search issue no..." field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search issue no...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search issue no...\"]").first().fill('automation test value');
      await page.locator("input[placeholder=\"Search issue no...\"]").first().clear();
    });

    test('TC-014 "Search department..." field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search department...\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search department...\"]").first().fill('automation test value');
      await page.locator("input[placeholder=\"Search department...\"]").first().clear();
    });

    test('TC-015 "SAVE" button is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: "SAVE" }).first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-016 Cancel button closes the form', async ({ page }) => {
      await page.getByRole('button', { name: "New Method Development" }).click();
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

}); // describe Method development
