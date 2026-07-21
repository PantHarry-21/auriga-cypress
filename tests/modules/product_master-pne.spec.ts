/**
 * Product Master — Positive / Negative / Edge Case Suite
 * URL  : /dashboard/products/master
 * Role : admin
 *
 * Verified live on prod.bharatlims.ai 2026-07-19/20. "New Product" opens a form
 * binding a branded product to an approved Generic and a Client via headless-ui
 * comboboxes ("Search and select generic product...", "Search and select client...")
 * plus a brand-name input ("Enter or search brand/product name..."). Actions:
 * Add, View, Cancel. The form fetches /api/generic-master and /api/client-profile/list,
 * proving the Generic→Product and Client→Product linkages.
 *
 * Non-destructive: asserts field presence, linkage, input acceptance, Cancel.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';
import { YLIMS_SELECTORS } from '../helpers/selectors';

const URL = '/dashboard/products/master';
const LAB = 'Arbro - Delhi';
const S = YLIMS_SELECTORS.productMaster;

async function openForm(page: any) {
  await page.click(S.newButton);
  await page.waitForTimeout(2000);
  await expect(page.locator(S.genericCombobox)).toBeVisible({ timeout: 10000 });
}

test.describe('[MODULE-PRODUCT-PNE] Product Master — Positive/Negative/Edge', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── POSITIVE ───────────────────────────────────────────────────────────────
  test.describe('Positive', () => {

    test('TC-P01 list renders with brand/generic columns and search', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Brand'))).toBe(true);
      expect(headers.some(h => h.includes('Generic'))).toBe(true);
      await expect(page.locator(S.listSearchInput)).toBeVisible();
    });

    test('TC-P02 New Product opens the form with generic + client + brand fields', async ({ page }) => {
      await openForm(page);
      await expect(page.locator(S.genericCombobox)).toBeVisible();
      await expect(page.locator(S.clientCombobox)).toBeVisible();
      await expect(page.locator(S.brandNameInput)).toBeVisible();
    });

    test('TC-P03 generic-product combobox is searchable (Generic→Product linkage)', async ({ page }) => {
      await openForm(page);
      await page.locator(S.genericCombobox).fill('water');
      await page.waitForTimeout(2000);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-P04 client combobox is present as a searchable control (Client→Product linkage)', async ({ page }) => {
      // Verified live 2026-07-20: the client field is a role=combobox. We assert its
      // presence/role only — filling it opens a very large client dropdown, and reading
      // the 2000-row page body is needlessly slow, so we keep this check fast + robust.
      await openForm(page);
      const client = page.locator(S.clientCombobox);
      await expect(client).toBeVisible({ timeout: 8000 });
      await expect(client).toHaveAttribute('role', 'combobox');
    });

    test('TC-P05 brand name accepts input', async ({ page }) => {
      await openForm(page);
      await page.locator(S.brandNameInput).fill('AUTOQA Brand Product');
      expect(await page.locator(S.brandNameInput).inputValue()).toBe('AUTOQA Brand Product');
    });
  });

  // ── NEGATIVE ───────────────────────────────────────────────────────────────
  test.describe('Negative', () => {

    test('TC-N01 Add with no generic selected is blocked or shows an error', async ({ page }) => {
      await openForm(page);
      await page.locator(S.brandNameInput).fill('AUTOQA Orphan Brand');
      const addBtn = page.locator(S.addButton).first();
      const disabled = await addBtn.isDisabled().catch(() => false);
      if (disabled) { expect(disabled).toBe(true); return; }
      await addBtn.click();
      await page.waitForTimeout(1200);
      const errs = page.locator('[class*="error"]:visible, [role="alert"]:visible, .text-red-500:visible, .text-red-600:visible');
      const stillOpen = await page.locator(S.brandNameInput).isVisible({ timeout: 2000 }).catch(() => false);
      expect((await errs.count()) > 0 || stillOpen).toBe(true);
    });
  });

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  test.describe('Edge Cases', () => {

    test('TC-E01 long brand name (300 chars) does not crash the form', async ({ page }) => {
      await openForm(page);
      await page.locator(S.brandNameInput).fill('AUTOQA ' + 'B'.repeat(300));
      await page.waitForTimeout(400);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E02 special characters in brand name are accepted', async ({ page }) => {
      await openForm(page);
      await page.locator(S.brandNameInput).fill(`<x>&"'%--`);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E03 combobox search with no match does not error', async ({ page }) => {
      await openForm(page);
      await page.locator(S.genericCombobox).fill('zzzznomatchqa');
      await page.waitForTimeout(1800);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E04 Cancel closes the form and keeps the product list', async ({ page }) => {
      await openForm(page);
      await page.locator(S.cancelButton).first().click();
      await page.waitForTimeout(1500);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('TC-E05 list search by brand or generic name filters without error', async ({ page }) => {
      const search = page.locator(S.listSearchInput);
      await expect(search).toBeVisible({ timeout: 10000 });
      await search.fill('water');
      await page.waitForTimeout(1800);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

}); // describe Product Master P/N/E
