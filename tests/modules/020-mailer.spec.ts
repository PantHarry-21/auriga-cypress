/**
 * Mailer — E2E Test Suite
 * URL  : /dashboard/mail/inbox
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/mail/inbox";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-020] Mailer", () => {

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
      expect(page.url()).toMatch(/inbox/i);
    });

    test('TC-003 page has meaningful content', async ({ page }) => {
      const text = await page.locator('body').innerText();
      expect(text.trim().length).toBeGreaterThan(50);
    });

  }); // Page Load

  // ── 2. Search & Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-006 search input is visible and accepts text', async ({ page }) => {
      const search = page.locator("input[placeholder=\"Search emails...\"]").first();
      await expect(search).toBeVisible({ timeout: 8000 });
      await search.fill('automation test');
      await search.clear();
    });

  }); // Search

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

  // ── 2. Compose (added 2026-07-10, selectors verified live) ─────────────────
  test.describe('2. Compose', () => {

    test('TC-020 Compose navigates to the compose view with all fields', async ({ page }) => {
      await page.click('button:has-text("Compose")');
      await page.waitForURL('**/mail/compose', { timeout: 15000 });
      await expect(page.locator('input[placeholder="Search by name or email..."]')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('input[name="subject"]')).toBeVisible();
      await expect(page.locator('textarea[name="body"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send")')).toBeVisible();
      await expect(page.locator('button:has-text("Save Draft")')).toBeVisible();
    });

    test('TC-021 subject and body accept input', async ({ page }) => {
      await page.click('button:has-text("Compose")');
      await page.waitForURL('**/mail/compose', { timeout: 15000 });
      await page.locator('input[name="subject"]').fill('Automation test subject');
      await page.locator('textarea[name="body"]').fill('Automation test body');
      expect(await page.locator('input[name="subject"]').inputValue()).toBe('Automation test subject');
    });

    test('TC-022 Cancel leaves compose without sending', async ({ page }) => {
      await page.click('button:has-text("Compose")');
      await page.waitForURL('**/mail/compose', { timeout: 15000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(1500);
      expect(page.url()).not.toContain('/compose');
    });
  });

  // ── 3. Folders ──────────────────────────────────────────────────────────────
  test.describe('3. Folders', () => {

    test('TC-023 Inbox/Important/Drafts/Sent folders are present', async ({ page }) => {
      for (const folder of ['Inbox', 'Important', 'Drafts', 'Sent']) {
        await expect(page.locator(`button:has-text("${folder}")`).first()).toBeVisible({ timeout: 10000 });
      }
    });
  });

}); // describe Mailer
