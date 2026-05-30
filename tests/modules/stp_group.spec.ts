/**
 * STP Groups — Real E2E Test Suite
 * URL  : /dashboard/testing/stp-groups
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/stp-groups';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-005] STP Groups', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  test.describe('1. Page Load', () => {

    test('TC-001 page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-002 table is visible with data', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    });

    test('TC-003 correct table headers', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('STP Group Name'))).toBe(true);
      expect(headers.some(h => h.includes('Description'))).toBe(true);
    });
  });

  test.describe('2. Search', () => {

    test('TC-004 search input works', async ({ page }) => {
      const search = page.locator('input[placeholder="Search stp group name..."]');
      await expect(search).toBeVisible();
      await search.fill('auto');
      expect(await search.inputValue()).toBe('auto');
    });
  });

  test.describe('3. Create Form', () => {

    test('TC-005 "New STP Group" button visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New STP Group")')).toBeVisible();
    });

    test('TC-006 form opens with correct fields', async ({ page }) => {
      await page.click('button:has-text("New STP Group")');
      await page.waitForTimeout(1000);
      await expect(page.locator('input[name="stpGroupName"]')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('input[name="stpGroupHeader"]')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('input[name="stpGroupDescription"]')).toBeVisible({ timeout: 8000 });
    });

    test('TC-007 stpGroupName accepts text input', async ({ page }) => {
      await page.click('button:has-text("New STP Group")');
      await page.waitForTimeout(1000);
      await page.locator('input[name="stpGroupName"]').fill('Test Group');
      expect(await page.locator('input[name="stpGroupName"]').inputValue()).toBe('Test Group');
    });

    test('TC-008 Create button is present on form', async ({ page }) => {
      await page.click('button:has-text("New STP Group")');
      await page.waitForTimeout(1000);
      await expect(page.locator('button:has-text("Create")')).toBeVisible({ timeout: 8000 });
    });
  });
});
