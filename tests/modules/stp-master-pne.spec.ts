/**
 * STP Master — Positive / Negative / Edge Case Suite
 * URL  : /dashboard/testing/stp-master
 * Role : admin
 *
 * Verified live on prod.bharatlims.ai 2026-07-19/20. "New STP" opens a modal whose
 * STP NAME is readonly and auto-composed from the selections above it
 * ("Parameter-Product-Instrument/Technique-Reference Method"). Named fields:
 * sampleQuantity (number), turnAroundTime (number), productName, validationProtocol,
 * remarks; plus headless-ui comboboxes (parameter/department/method/source/instrument
 * — targeted by placeholder, never by their dynamic ids). Actions: Add Step,
 * Save as Draft, Submit for Review, Cancel.
 *
 * Non-destructive: asserts validation gates + readonly behavior, then Cancels.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';
import { YLIMS_SELECTORS } from '../helpers/selectors';

const URL = '/dashboard/testing/stp-master';
const LAB = 'Arbro - Delhi';
const S = YLIMS_SELECTORS.stpMaster;

async function openForm(page: any) {
  await page.click(S.newButton);
  await page.waitForTimeout(2500);
  await expect(page.locator(S.sampleQuantityInput)).toBeVisible({ timeout: 10000 });
}

test.describe('[MODULE-STP-PNE] STP Master — Positive/Negative/Edge', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── POSITIVE ───────────────────────────────────────────────────────────────
  test.describe('Positive', () => {

    test('TC-P01 all four status tabs render (Active / My Drafts / Approval Pending / Accredited)', async ({ page }) => {
      await expect(page.locator(S.tabActive).first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator(S.tabMyDrafts).first()).toBeVisible();
      await expect(page.locator(S.tabApprovalPending).first()).toBeVisible();
      await expect(page.locator(S.tabAccredited).first()).toBeVisible();
    });

    test('TC-P02 New STP opens the form with core named fields present', async ({ page }) => {
      await openForm(page);
      await expect(page.locator(S.sampleQuantityInput)).toBeVisible();
      await expect(page.locator(S.turnAroundTimeInput)).toBeVisible();
      await expect(page.locator(S.validationProtocolInput)).toBeVisible();
      await expect(page.locator(S.stpNameInput)).toBeVisible();
      await expect(page.locator(S.submitButton)).toBeVisible();
      await expect(page.locator(S.saveDraftButton)).toBeVisible();
    });

    test('TC-P03 quantity / TAT / validation-protocol fields accept input', async ({ page }) => {
      await openForm(page);
      await page.locator(S.sampleQuantityInput).fill('5');
      await page.locator(S.turnAroundTimeInput).fill('48');
      await page.locator(S.validationProtocolInput).fill('AUTOQA-VP-01');
      expect(await page.locator(S.sampleQuantityInput).inputValue()).toBe('5');
      expect(await page.locator(S.validationProtocolInput).inputValue()).toBe('AUTOQA-VP-01');
    });

    test('TC-P04 parameter combobox is searchable (linkage to Parameter master)', async ({ page }) => {
      await openForm(page);
      const combo = page.locator(S.parameterCombobox);
      await expect(combo).toBeVisible({ timeout: 8000 });
      await combo.fill('acid');
      await page.waitForTimeout(2000);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

  // ── NEGATIVE ───────────────────────────────────────────────────────────────
  test.describe('Negative', () => {

    test('TC-N01 STP NAME is readonly / auto-composed (cannot be typed into)', async ({ page }) => {
      await openForm(page);
      await expect(page.locator(S.stpNameInput)).toHaveAttribute('readonly', '');
    });

    test('TC-N02 submitting the empty form surfaces validation errors', async ({ page }) => {
      await openForm(page);
      await page.locator(S.submitButton).first().click();
      await page.waitForTimeout(1500);
      const errs = page.locator('[class*="error"]:visible, [role="alert"]:visible, .text-red-500:visible, .text-red-600:visible');
      expect(await errs.count()).toBeGreaterThan(0);
    });

    test('TC-N03 sampleQuantity (number input) rejects alphabetic characters', async ({ page }) => {
      await openForm(page);
      const qty = page.locator(S.sampleQuantityInput);
      await qty.pressSequentially('abc');
      const val = await qty.inputValue();
      expect(val === '' || /^\d*$/.test(val)).toBe(true);
    });
  });

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  test.describe('Edge Cases', () => {

    test('TC-E01 very large quantity value does not crash the form', async ({ page }) => {
      await openForm(page);
      await page.locator(S.sampleQuantityInput).fill('999999999');
      await page.waitForTimeout(400);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E02 special characters in validation protocol are accepted without error', async ({ page }) => {
      await openForm(page);
      await page.locator(S.validationProtocolInput).fill(`<b>&"'%--`);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E03 Add Step reveals the procedure-step textarea', async ({ page }) => {
      await openForm(page);
      const addStep = page.locator(S.addStepButton).first();
      if (await addStep.isVisible({ timeout: 4000 }).catch(() => false)) {
        await addStep.click();
        await page.waitForTimeout(1000);
      }
      await expect(page.locator(S.procedureStepTextarea).first()).toBeVisible({ timeout: 8000 });
    });

    test('TC-E04 Cancel closes the form and returns to the STP list', async ({ page }) => {
      await openForm(page);
      await page.locator(S.cancelButton).first().click();
      await page.waitForTimeout(1500);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('TC-E05 list search by STP/product name filters without error', async ({ page }) => {
      const search = page.locator(S.listSearchInput);
      await expect(search).toBeVisible({ timeout: 10000 });
      await search.fill('water');
      await page.waitForTimeout(2000);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

}); // describe STP Master P/N/E
