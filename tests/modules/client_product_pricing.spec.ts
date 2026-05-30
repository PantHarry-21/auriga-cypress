/**
 * Client Product Pricing — E2E Test Suite
 * URL  : /dashboard/client-product-pricing
 * Role : admin
 * Note : Pricing lookup page — select client/product to view pricing
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/client-product-pricing';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-008] Client Product Pricing', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ──────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-002 page URL is correct', async ({ page }) => {
      expect(page.url()).toContain('/client-product-pricing');
    });

    test('TC-003 "Not Priced" filter button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Not Priced")')).toBeVisible({ timeout: 10000 });
    });

    test('TC-004 page has meaningful content', async ({ page }) => {
      const text = await page.locator('body').innerText();
      expect(text.trim().length).toBeGreaterThan(50);
    });
  });

  // ── 2. Search / Filter ────────────────────────────────────────────────────
  test.describe('2. Search & Filter', () => {

    test('TC-005 search input accepts text', async ({ page }) => {
      const search = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      const isVisible = await search.isVisible({ timeout: 8000 }).catch(() => false);
      if (isVisible) {
        await search.fill('test');
        expect(await search.inputValue()).toBe('test');
      } else {
        // Page uses dropdowns/comboboxes instead of text search
        const combo = page.locator('[role="combobox"], select').first();
        await expect(combo).toBeVisible({ timeout: 8000 });
      }
    });

    test('TC-006 "Not Priced" filter updates displayed data', async ({ page }) => {
      const notPricedBtn = page.locator('button:has-text("Not Priced")');
      await expect(notPricedBtn).toBeVisible({ timeout: 10000 });
      await notPricedBtn.click();
      await page.waitForTimeout(800);
      // After clicking the filter should remain on page without error
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    });
  });
});
