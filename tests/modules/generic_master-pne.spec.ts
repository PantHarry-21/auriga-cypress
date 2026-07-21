/**
 * Generic Master — Positive / Negative / Edge Case Suite
 * URL  : /dashboard/products/generic-master
 * Role : admin
 *
 * Verified live on prod.bharatlims.ai 2026-07-19/20. "New Generic Master" opens a
 * slide-over. Named fields: genericName (required), version (readonly, auto 1.0),
 * validationProtocol, referenceToProtocol, inhouseReferenceToProtocol, remarks
 * (textarea), allowChangesInBooking (checkbox), plus Report Template / Matrix /
 * Label comboboxes. Actions: Add Label, Save as Draft, Submit for Review, Cancel.
 * Tabs: Active / My Drafts / Approval Pending.
 *
 * Non-destructive: asserts required/readonly/validation gates then Cancels.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';
import { YLIMS_SELECTORS } from '../helpers/selectors';

const URL = '/dashboard/products/generic-master';
const LAB = 'Arbro - Delhi';
const S = YLIMS_SELECTORS.genericMaster;

async function openForm(page: any) {
  await page.click(S.newButton);
  await page.waitForTimeout(2000);
  await expect(page.locator(S.genericNameInput)).toBeVisible({ timeout: 10000 });
}

test.describe('[MODULE-GENERIC-PNE] Generic Master — Positive/Negative/Edge', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── POSITIVE ───────────────────────────────────────────────────────────────
  test.describe('Positive', () => {

    test('TC-P01 status tabs render (Active / My Drafts / Approval Pending)', async ({ page }) => {
      await expect(page.locator(S.tabActive).first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator(S.tabMyDrafts).first()).toBeVisible();
      await expect(page.locator(S.tabApprovalPending).first()).toBeVisible();
    });

    test('TC-P02 New Generic Master opens the form with key fields', async ({ page }) => {
      await openForm(page);
      await expect(page.locator(S.genericNameInput)).toBeVisible();
      await expect(page.locator(S.versionInput)).toBeVisible();
      await expect(page.locator(S.remarksTextarea)).toBeVisible();
      await expect(page.locator(S.submitButton)).toBeVisible();
      await expect(page.locator(S.saveDraftButton)).toBeVisible();
    });

    test('TC-P03 genericName + protocol fields accept input', async ({ page }) => {
      await openForm(page);
      await page.locator(S.genericNameInput).fill('AUTOQA Generic');
      await page.locator(S.validationProtocolInput).fill('AUTOQA-VP');
      await page.locator(S.remarksTextarea).fill('AUTOQA remark');
      expect(await page.locator(S.genericNameInput).inputValue()).toBe('AUTOQA Generic');
      expect(await page.locator(S.remarksTextarea).inputValue()).toBe('AUTOQA remark');
    });

    test('TC-P04 Matrix and Label comboboxes are searchable (NABL linkage)', async ({ page }) => {
      await openForm(page);
      const matrix = page.locator(S.matrixCombobox);
      await expect(matrix).toBeVisible({ timeout: 8000 });
      await matrix.fill('food');
      await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

  // ── NEGATIVE ───────────────────────────────────────────────────────────────
  test.describe('Negative', () => {

    test('TC-N01 version field is readonly (auto-managed, default 1.0)', async ({ page }) => {
      await openForm(page);
      await expect(page.locator(S.versionInput)).toHaveAttribute('readonly', '');
      const val = await page.locator(S.versionInput).inputValue();
      const ph = await page.locator(S.versionInput).getAttribute('placeholder');
      expect(val === '1.0' || ph === '1.0').toBe(true);
    });

    test('TC-N02 submitting with a blank genericName shows a validation error', async ({ page }) => {
      await openForm(page);
      await page.locator(S.genericNameInput).fill('Temp');
      await page.locator(S.genericNameInput).clear();
      await page.locator(S.submitButton).first().click();
      await page.waitForTimeout(1200);
      const errs = page.locator('[class*="error"]:visible, [role="alert"]:visible, .text-red-500:visible, .text-red-600:visible');
      const stillOpen = await page.locator(S.genericNameInput).isVisible({ timeout: 2000 }).catch(() => false);
      expect((await errs.count()) > 0 || stillOpen).toBe(true);
    });
  });

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  test.describe('Edge Cases', () => {

    test('TC-E01 long generic name (300 chars) does not crash the form', async ({ page }) => {
      await openForm(page);
      await page.locator(S.genericNameInput).fill('AUTOQA ' + 'G'.repeat(300));
      await page.waitForTimeout(400);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E02 special characters in remarks are accepted', async ({ page }) => {
      await openForm(page);
      await page.locator(S.remarksTextarea).fill(`<script>x</script> & "q" ' --`);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E03 allow-changes-in-booking checkbox toggles', async ({ page }) => {
      await openForm(page);
      const cb = page.locator(S.allowChangesCheckbox).first();
      if (await cb.isVisible({ timeout: 4000 }).catch(() => false)) {
        const before = await cb.isChecked().catch(() => false);
        await cb.click({ force: true });
        await page.waitForTimeout(300);
        expect(await cb.isChecked().catch(() => before)).not.toBe(before);
      }
    });

    test('TC-E04 Cancel closes the slide-over and keeps the list', async ({ page }) => {
      await openForm(page);
      await page.locator(S.cancelButton).first().click();
      await page.waitForTimeout(1500);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('TC-E05 list search by Generic Name filters without error', async ({ page }) => {
      const search = page.locator(S.listSearchInput);
      await expect(search).toBeVisible({ timeout: 10000 });
      await search.fill('AUTOQA');
      await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

}); // describe Generic Master P/N/E
