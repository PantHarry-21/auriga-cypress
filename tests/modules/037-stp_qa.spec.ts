/**
 * STP QA — E2E Test Suite
 * URL  : /dashboard/stp-qa
 * Role : admin
 * Form : opened with "New STP QA"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/stp-qa";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-037] STP QA", () => {

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
      expect(page.url()).toContain("stp-qa");
    });

    test('TC-003 data table is visible with at least one row', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("Serial No"))).toBe(true);
      expect(headers.some(h => h.includes("STP Title"))).toBe(true);
      expect(headers.some(h => h.includes("STP Code"))).toBe(true);
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
      await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
    });

  }); // Search

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-08 "New STP QA" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "New STP QA" })).toBeVisible();
    });

    test('TC-09 form opens when "New STP QA" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"stp_title\"]").first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search\"]").first().fill('automation test value');
      await page.locator("input[placeholder=\"Search\"]").first().clear();
    });

    test('TC-011 "stp_title" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"stp_title\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"stp_title\"]").first().fill('automation test value');
      await page.locator("[name=\"stp_title\"]").first().clear();
    });

    test('TC-012 "stp_code" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"stp_code\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"stp_code\"]").first().fill('automation test value');
      await page.locator("[name=\"stp_code\"]").first().clear();
    });

    test('TC-013 "issue_no" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"issue_no\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"issue_no\"]").first().fill('automation test value');
      await page.locator("[name=\"issue_no\"]").first().clear();
    });

    test('TC-014 "issue_date" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"issue_date\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"issue_date\"]").first().fill('automation test value');
      await page.locator("[name=\"issue_date\"]").first().clear();
    });

    test('TC-015 "Add" button is present on form', async ({ page }) => {
      await page.getByRole('button', { name: "New STP QA" }).click();
      await page.waitForTimeout(1500);
      await expect(page.getByRole('button', { name: "Add" }).first()).toBeVisible({ timeout: 8000 });
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

}); // describe STP QA
