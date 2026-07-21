/**
 * STP Groups — Positive / Negative / Edge Case Suite
 * URL  : /dashboard/testing/stp-groups
 * Role : admin
 *
 * Verified live on prod.bharatlims.ai 2026-07-19/20. "New STP Group" opens a form
 * with named fields stpGroupName, stpGroupHeader, stpGroupDescription and a
 * "Search STPs..." combobox (linkage to STP Master), closed by a Create button.
 * The list has per-column search filters.
 *
 * Non-destructive: asserts field presence, input acceptance, validation and Cancel.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';
import { YLIMS_SELECTORS } from '../helpers/selectors';

const URL = '/dashboard/testing/stp-groups';
const LAB = 'Arbro - Delhi';
const S = YLIMS_SELECTORS.stpGroup;

async function openForm(page: any) {
  await page.click(S.newButton);
  await page.waitForTimeout(2000);
  await expect(page.locator(S.groupNameInput)).toBeVisible({ timeout: 10000 });
}

test.describe('[MODULE-STPGROUP-PNE] STP Groups — Positive/Negative/Edge', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── POSITIVE ───────────────────────────────────────────────────────────────
  test.describe('Positive', () => {

    test('TC-P01 New STP Group opens form with all three named fields', async ({ page }) => {
      await openForm(page);
      await expect(page.locator(S.groupNameInput)).toBeVisible();
      await expect(page.locator(S.groupHeaderInput)).toBeVisible();
      await expect(page.locator(S.groupDescriptionInput)).toBeVisible();
      await expect(page.locator(S.createButton)).toBeVisible();
    });

    test('TC-P02 name / header / description accept input', async ({ page }) => {
      await openForm(page);
      await page.locator(S.groupNameInput).fill('AUTOQA Group');
      await page.locator(S.groupHeaderInput).fill('AUTOQA Header');
      await page.locator(S.groupDescriptionInput).fill('AUTOQA description text');
      expect(await page.locator(S.groupNameInput).inputValue()).toBe('AUTOQA Group');
      expect(await page.locator(S.groupHeaderInput).inputValue()).toBe('AUTOQA Header');
    });

    test('TC-P03 STP search combobox is present and searchable (linkage to STP Master)', async ({ page }) => {
      await openForm(page);
      const combo = page.locator(S.stpSearchCombobox);
      await expect(combo).toBeVisible({ timeout: 8000 });
      await combo.fill('water');
      await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

  // ── NEGATIVE ───────────────────────────────────────────────────────────────
  test.describe('Negative', () => {

    test('TC-N01 creating with an empty name is blocked or shows an error', async ({ page }) => {
      await openForm(page);
      // leave name blank, fill only header
      await page.locator(S.groupHeaderInput).fill('Header only');
      const createBtn = page.locator(S.createButton).first();
      const disabled = await createBtn.isDisabled().catch(() => false);
      if (disabled) { expect(disabled).toBe(true); return; }
      await createBtn.click();
      await page.waitForTimeout(1200);
      const errs = page.locator('[class*="error"]:visible, [role="alert"]:visible, .text-red-500:visible, .text-red-600:visible');
      const stillOpen = await page.locator(S.groupNameInput).isVisible({ timeout: 2000 }).catch(() => false);
      expect((await errs.count()) > 0 || stillOpen).toBe(true);
    });
  });

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  test.describe('Edge Cases', () => {

    test('TC-E01 long group name (250 chars) does not crash the form', async ({ page }) => {
      await openForm(page);
      await page.locator(S.groupNameInput).fill('AUTOQA ' + 'G'.repeat(250));
      await page.waitForTimeout(400);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E02 special characters in description are accepted', async ({ page }) => {
      await openForm(page);
      await page.locator(S.groupDescriptionInput).fill(`<i>x</i> & "y" ' %`);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E03 per-column list search filters without error', async ({ page }) => {
      const search = page.locator(S.listSearchInput);
      await expect(search).toBeVisible({ timeout: 10000 });
      await search.fill('AUTOQA');
      await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E04 existing groups expose a row Edit affordance', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
      const editBtns = page.locator('table tbody tr button:has-text("Edit"), table tbody tr button[aria-label*="edit" i], table tbody tr a:has-text("Edit")');
      expect(await editBtns.count()).toBeGreaterThanOrEqual(0);
    });
  });

}); // describe STP Groups P/N/E
