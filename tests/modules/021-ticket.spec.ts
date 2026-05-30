/**
 * Ticket — E2E Test Suite
 * URL  : /dashboard/support/tickets
 * Role : admin
 * Form : opened with "Generate Ticket"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/support/tickets";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-021] Ticket", () => {

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
      expect(page.url()).toMatch(/tickets/i);
    });

    test('TC-003 page has meaningful content', async ({ page }) => {
      const text = await page.locator('body').innerText();
      expect(text.trim().length).toBeGreaterThan(50);
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

  }); // Search

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-008 "Generate Ticket" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "Generate Ticket" })).toBeVisible();
    });

    test('TC-009 form opens when "Generate Ticket" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "Generate Ticket" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"reportNo\"]").first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "Search" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Generate Ticket" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("input[placeholder=\"Search\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("input[placeholder=\"Search\"]").first().fill("automation test value");
      await page.locator("input[placeholder=\"Search\"]").first().clear();
    });

    test('TC-011 "reportNo" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Generate Ticket" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"reportNo\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"reportNo\"]").first().fill("automation test value");
      await page.locator("[name=\"reportNo\"]").first().clear();
    });

    test('TC-012 "dueDate" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Generate Ticket" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"dueDate\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"dueDate\"]").first().fill("2025-12-31");
    });

    test('TC-013 "subject" field is visible and interactive', async ({ page }) => {
      await page.getByRole('button', { name: "Generate Ticket" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"subject\"]").first()).toBeVisible({ timeout: 8000 });
      await page.locator("[name=\"subject\"]").first().fill("automation test value");
      await page.locator("[name=\"subject\"]").first().clear();
    });

  }); // Create Form

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("button", { name: "Tickets" })
   *   page.getByRole("button", { name: "Ticket Reports Admin" })
   *   page.getByRole("button", { name: "Generate Ticket" })
   *   page.getByRole("combobox", { name: "Show:" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   *   page.getByRole("button", { name: "Support" })
   *   page.getByRole("button", { name: "Purchase & Indent" })
   */

}); // describe Ticket
