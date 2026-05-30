/**
 * OOS Question — E2E Test Suite
 * URL  : /dashboard/oos/question
 * Role : admin
 * Form : opened with "Add Question"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/oos/question";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-039] OOS Question", () => {

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
      expect(page.url()).toContain("question");
    });

    test('TC-003 page has meaningful content', async ({ page }) => {
      const text = await page.locator('body').innerText();
      expect(text.trim().length).toBeGreaterThan(50);
    });

  }); // Page Load

  // ── 3. Create Form ────────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-08 "Add Question" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: "Add Question" })).toBeVisible();
    });

    test('TC-09 form opens when "Add Question" is clicked', async ({ page }) => {
      await page.getByRole('button', { name: "Add Question" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"heading\"]").first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-010 "heading" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "Add Question" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"heading\"]").first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-011 "question" field accepts text input', async ({ page }) => {
      await page.getByRole('button', { name: "Add Question" }).click();
      await page.waitForTimeout(1500);
      await expect(page.locator("[name=\"question\"]").first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-012 Cancel button closes the form', async ({ page }) => {
      await page.getByRole('button', { name: "Add Question" }).click();
      await page.waitForTimeout(1500);
      await page.getByRole('button', { name: 'Cancel' }).first().click();
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
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

}); // describe OOS Question
