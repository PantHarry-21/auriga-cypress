/**
 * Signatory Setup — E2E Test Suite
 * URL  : /dashboard/templates
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/templates";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-085] Signatory Setup", () => {

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
      expect(page.url()).toMatch(/templates/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("TEMPLATE"))).toBe(true);
      expect(headers.some(h => h.includes("DISCIPLINE"))).toBe(true);
      expect(headers.some(h => h.includes("GROUP"))).toBe(true);
    });

  }); // Page Load

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("button", { name: "Add Mapping" })
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
   */

  // ── 2. Mapping CRUD affordances (added 2026-07-10, verified live) ──────────
  test.describe('2. Mapping CRUD', () => {

    test('TC-020 mapping selects are on the page; "Add Mapping" is disabled until values are chosen', async ({ page }) => {
      // Verified live 2026-07-10: the mapping selects render directly on the page,
      // and Add Mapping stays disabled until they are populated
      const selects = page.locator('select:visible');
      await expect(selects.first()).toBeVisible({ timeout: 15000 });
      const addBtn = page.locator('button:has-text("Add Mapping")').first();
      await expect(addBtn).toBeVisible();
      await expect(addBtn).toBeDisabled();
    });

    test('TC-021 existing mappings expose row Edit buttons', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
      const editBtns = page.locator('table tbody tr button:has-text("Edit"), table tbody tr button[aria-label*="edit" i]');
      await expect(editBtns.first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-022 existing mappings expose row Delete affordance (not clicked — destructive)', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
      const delBtns = page.locator('table tbody tr button[aria-label*="delete" i], table tbody tr button:has-text("Delete"), tbody tr svg[class*="trash" i]');
      expect(await delBtns.count()).toBeGreaterThan(0);
    });

    test('TC-023 row Edit opens the mapping editor', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
      await page.locator('table tbody tr button:has-text("Edit")').first().click();
      await page.waitForTimeout(1500);
      const selects = page.locator('select:visible');
      expect(await selects.count()).toBeGreaterThanOrEqual(1);
    });
  });

}); // describe Signatory Setup
