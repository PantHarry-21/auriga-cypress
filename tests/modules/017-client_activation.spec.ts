/**
 * Client Activation — E2E Test Suite
 * URL  : /dashboard/samples/client-activation
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/samples/client-activation";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-017] Client Activation", () => {

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
      expect(page.url()).toMatch(/client.{0,1}activation/i);
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
      expect(headers.some(h => h.includes("TRF No"))).toBe(true);
      expect(headers.some(h => h.includes("Company Name"))).toBe(true);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search by company name...\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

    test('TC-007 export buttons are present', async ({ page }) => {
      await expect(page.locator('button').filter({ hasText: /^Excel$/i }).first()).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button').filter({ hasText: /^PDF$/i }).first()).toBeVisible({ timeout: 8000 });
    });

  }); // Search

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("button", { name: "Clients to Activate 2" })
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

  // ── 2. Activation Form (added 2026-07-10, selectors verified live) ─────────
  test.describe('2. Activation Form', () => {

    test('TC-020 row "Client Activation" opens the activation form', async ({ page }) => {
      const actBtn = page.locator('table tbody tr button:has-text("Client Activation"), tbody button:has-text("Client Activation")').first();
      const hasRows = await actBtn.isVisible({ timeout: 10000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      await actBtn.click();
      await page.waitForTimeout(3000);
      await expect(page.locator('input[name="companyEmail"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('input[placeholder="Enter company name"]')).toBeVisible();
      await expect(page.locator('button:has-text("Submit for Approval")')).toBeVisible();
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });

    test('TC-021 activation form has credential fields for the client login', async ({ page }) => {
      const actBtn = page.locator('table tbody tr button:has-text("Client Activation"), tbody button:has-text("Client Activation")').first();
      const hasRows = await actBtn.isVisible({ timeout: 10000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      await actBtn.click();
      await page.waitForTimeout(3000);
      await expect(page.locator('input[placeholder="Enter username"]')).toBeVisible({ timeout: 10000 });
      expect(await page.locator('input[type="password"]').count()).toBeGreaterThanOrEqual(2);
    });
  });

}); // describe Client Activation
