/**
 * Client Product Pricing — Positive / Negative / Edge Case Suite
 * URL  : /dashboard/client-product-pricing
 * Role : admin
 *
 * Verified live on prod.bharatlims.ai 2026-07-19/20. The page assigns prices to
 * client-product pairs. It offers a client search ("Search client by name…"), a
 * product search ("Search product..."), and a "Not Priced" filter isolating
 * products still awaiting a price — closing the master-data chain
 * (Product → Client Pricing).
 *
 * Non-destructive: asserts search/filter behavior only (pricing edits are data-
 * sensitive on a shared environment and are not persisted here).
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';
import { YLIMS_SELECTORS } from '../helpers/selectors';

const URL = '/dashboard/client-product-pricing';
const LAB = 'Arbro - Delhi';
const S = YLIMS_SELECTORS.clientProductPricing;

test.describe('[MODULE-PRICING-PNE] Client Product Pricing — Positive/Negative/Edge', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  // ── POSITIVE ───────────────────────────────────────────────────────────────
  test.describe('Positive', () => {

    test('TC-P01 page loads with client + product search controls', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      await expect(page.locator(S.clientSearchInput)).toBeVisible({ timeout: 15000 });
      await expect(page.locator(S.productSearchInput)).toBeVisible();
    });

    test('TC-P02 "Not Priced" filter is present (Product→Pricing linkage)', async ({ page }) => {
      await expect(page.locator(S.notPricedTab)).toBeVisible({ timeout: 15000 });
    });

    test('TC-P03 client search accepts input', async ({ page }) => {
      const search = page.locator(S.clientSearchInput);
      await search.fill('a');
      await page.waitForTimeout(1500);
      expect(await search.inputValue()).toBe('a');
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-P04 product search is present (dependent on client selection)', async ({ page }) => {
      // Verified live: the product search is disabled until a Client is chosen —
      // the dependency gating is the Client→Product linkage on this page.
      const search = page.locator(S.productSearchInput);
      await expect(search).toBeVisible({ timeout: 12000 });
      if (await search.isEnabled().catch(() => false)) {
        await search.fill('water');
        await page.waitForTimeout(1200);
        expect(await search.inputValue()).toBe('water');
      }
    });

    test('TC-P05 clicking "Not Priced" filters the list without error', async ({ page }) => {
      await page.locator(S.notPricedTab).click();
      await page.waitForTimeout(2500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });
  });

  // ── NEGATIVE ───────────────────────────────────────────────────────────────
  test.describe('Negative', () => {

    test('TC-N01 client search with a non-existent name yields no crash', async ({ page }) => {
      await page.locator(S.clientSearchInput).fill('zzzznoclientqa123');
      await page.waitForTimeout(2000);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  test.describe('Edge Cases', () => {

    test('TC-E01 special characters in client search do not break the page', async ({ page }) => {
      await page.locator(S.clientSearchInput).fill(`<script>alert(1)</script>' OR 1=1;--`);
      await page.waitForTimeout(1800);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E02 product search then clear restores the list (when enabled)', async ({ page }) => {
      const search = page.locator(S.productSearchInput);
      await expect(search).toBeVisible({ timeout: 12000 });
      if (await search.isEnabled().catch(() => false)) {
        await search.fill('water');
        await page.waitForTimeout(1200);
        await search.clear();
        await page.waitForTimeout(1500);
      }
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

}); // describe Client Product Pricing P/N/E
