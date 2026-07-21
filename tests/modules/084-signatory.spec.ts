/**
 * Signatory — E2E Test Suite
 * URL  : /dashboard/signatory
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/signatory";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-084] Signatory", () => {

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
      expect(page.url()).toMatch(/signatory/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("EMPLOYEE"))).toBe(true);
      expect(headers.some(h => h.includes("TEMPLATE"))).toBe(true);
      expect(headers.some(h => h.includes("DISCIPLINE"))).toBe(true);
    });

  }); // Page Load

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("button", { name: "Assign" })
   *   page.getByRole("button", { name: "All 3" })
   *   page.getByRole("button", { name: "Chemical 1" })
   *   page.getByRole("button", { name: "Mechanical 2" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   *   page.getByRole("button", { name: "Support" })
   *   page.getByRole("button", { name: "Purchase & Indent" })
   */

  // ── 2. Assignment & Delete affordances (added 2026-07-10, verified live) ───
  test.describe('2. Assignment', () => {

    test('TC-020 Assign action and department filter tabs are present', async ({ page }) => {
      await expect(page.locator('button:has-text("Assign")').first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('button:has-text("All")').first()).toBeVisible();
    });

    test('TC-021 signatory select controls are present', async ({ page }) => {
      const selects = page.locator('select:visible');
      expect(await selects.count()).toBeGreaterThanOrEqual(1);
    });

    test('TC-022 assigned signatories expose row Delete affordance (not clicked — destructive)', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
      const delBtns = page.locator('table tbody tr button[aria-label*="delete" i], table tbody tr button:has-text("Delete"), tbody tr svg[class*="trash" i]');
      expect(await delBtns.count()).toBeGreaterThan(0);
    });
  });

}); // describe Signatory
