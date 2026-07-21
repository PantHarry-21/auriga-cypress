/**
 * Department — E2E Test Suite
 * URL  : /dashboard/department
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = "/dashboard/department";
const LAB = 'Arbro - Delhi';

test.describe("[MODULE-082] Department", () => {

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
      expect(page.url()).toMatch(/department/i);
    });

    test('TC-003 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
      // Table may be empty on UAT — just verify it renders
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-004 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes("Sr. No."))).toBe(true);
      expect(headers.some(h => h.includes("Department"))).toBe(true);
      expect(headers.some(h => h.includes("Sub Department"))).toBe(true);
    });

  }); // Page Load

  /*
   * Accessibility-tree locators (CDP-captured, for reference / future use):
   *   page.getByRole("button", { name: "Notifications" })
   *   page.getByRole("button", { name: "Lab Head" })
   *   page.getByRole("button", { name: "Admin" })
   *   page.getByRole("button", { name: "Raise Request" })
   *   page.getByRole("textbox", { name: "Search modules…" })
   *   page.getByRole("button", { name: "Home" })
   *   page.getByRole("button", { name: "Module Management" })
   *   page.getByRole("button", { name: "Sample Management" })
   *   page.getByRole("button", { name: "Customer Relation Management" })
   *   page.getByRole("button", { name: "Support" })
   *   page.getByRole("button", { name: "Purchase & Indent" })
   *   page.getByRole("button", { name: "Quotation & Pricing" })
   */

  // ── 2. Create Request (added 2026-07-10, selectors verified live) ─────────
  test.describe('2. Create Request', () => {

    test('TC-020 "New Department" opens the request form with all fields', async ({ page }) => {
      await page.click('button:has-text("New Department")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="deptName"]')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('input[name="subDepartmentName"]')).toBeVisible();
      await expect(page.locator('input[name="location"]')).toBeVisible();
      await expect(page.locator('textarea[name="reason"]')).toBeVisible();
      await expect(page.locator('button:has-text("Submit Request")')).toBeVisible();
    });

    test('TC-021 form fields accept input', async ({ page }) => {
      await page.click('button:has-text("New Department")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="deptName"]').fill('Auto Test Dept');
      await page.locator('textarea[name="reason"]').fill('Automation coverage test');
      expect(await page.locator('input[name="deptName"]').inputValue()).toBe('Auto Test Dept');
    });

    test('TC-022 Cancel closes the form without submitting', async ({ page }) => {
      await page.click('button:has-text("New Department")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="deptName"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').first().click();
      await expect(page.locator('input[name="deptName"]')).toBeHidden({ timeout: 8000 });
    });
  });

  // ── 3. Approval Workflow ───────────────────────────────────────────────────
  test.describe('3. Approval Workflow', () => {

    test('TC-023 Pending/Approved/Rejected status tabs are present', async ({ page }) => {
      await expect(page.locator('button').filter({ hasText: /^Pending/ }).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('button').filter({ hasText: /^Approved/ }).first()).toBeVisible();
      await expect(page.locator('button').filter({ hasText: /^Rejected/ }).first()).toBeVisible();
    });

    test('TC-024 pending requests expose Approve and Reject actions', async ({ page }) => {
      await page.locator('button').filter({ hasText: /^Pending/ }).first().click();
      await page.waitForTimeout(2000);
      // Only assert when pending rows exist — approvals are data-dependent on shared UAT
      const hasRows = await page.locator('table tbody tr, [class*="card"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      await expect(page.locator('button:has-text("Approve")').first()).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Reject")').first()).toBeVisible();
    });
  });

}); // describe Department
