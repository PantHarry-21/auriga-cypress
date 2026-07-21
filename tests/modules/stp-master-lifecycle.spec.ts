/**
 * STP Master — Full Lifecycle Suite (Add + Submit for Review + Approve)  [DESTRUCTIVE]
 * URL  : /dashboard/testing/stp-master
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Second link in the Master
 * Library chain (Parameter → STP Master → …). Creating an STP requires selecting a
 * real Parameter plus Department / Reference Method / Source / STP Type / Instrument
 * from headless-ui comboboxes, sample-quantity + TAT (each with a unit), a product
 * name, and at least one procedure step. Effective Date auto-fills to today. The
 * STP NAME is readonly and auto-composed
 *   "Parameter-Product-Instrument/Technique-Reference Method".
 *
 * Full discovered flow:
 *   • CREATE + SUBMIT — "New STP" → fill the form → "Submit for Review" (no confirm
 *     dialog; the modal closes when it finishes). The STP lands in Approval Pending.
 *     (Do NOT press Escape to close combobox dropdowns — Escape closes the whole
 *     modal without saving. Click a neutral heading instead.)
 *   • APPROVE — the Approval-Pending row has no buttons; CLICK THE ROW to open the
 *     detail modal → "Approve" → confirm dialog "Approve STP … This moves it from
 *     Pending to Active" → "Yes, Approve". The STP moves to the Active tab.
 *
 * DESTRUCTIVE: creates + submits + approves real AUTOQA records (tagged by a unique
 * product name). UAT/test-DB only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/stp-master';
const LAB = 'Arbro - Delhi';

async function pickCombo(page: any, placeholder: string, term: string) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
  if (!(await c.isVisible({ timeout: 3000 }).catch(() => false))) return false;
  await c.click().catch(() => {});
  await c.fill(term);
  await page.waitForTimeout(2200);
  const opt = page.locator('[role="option"], ul[role="listbox"] li, li[class*="cursor"]').first();
  if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) {
    const t = await opt.innerText().catch(() => '');
    if (!/searching|no .*found/i.test(t)) { await opt.click(); await page.waitForTimeout(700); return true; }
  }
  return false;
}
async function pickNthUnit(page: any, nth: number) {
  const u = page.locator('input[placeholder="Select unit..."]').nth(nth);
  if (!(await u.isVisible({ timeout: 2500 }).catch(() => false))) return false;
  await u.click().catch(() => {});
  await page.waitForTimeout(1200);
  const opt = page.locator('[role="option"], li[class*="cursor"]').first();
  if (await opt.isVisible({ timeout: 2500 }).catch(() => false)) { await opt.click(); await page.waitForTimeout(600); return true; }
  return false;
}

async function fillStpForm(page: any, product: string) {
  await page.click('button:has-text("New STP")');
  await page.waitForTimeout(3000);
  await page.locator('input[name="sampleQuantity"]').fill('1');
  await pickNthUnit(page, 0);
  await page.locator('input[name="turnAroundTime"]').fill('24');
  await pickNthUnit(page, 1);
  await page.locator('input[name="productName"]').fill(product);
  await pickCombo(page, 'Search or select department...', 'a');
  await pickCombo(page, 'Search or select method...', 'a');
  await pickCombo(page, 'Search or select source...', 'a');
  await pickCombo(page, 'Select STP type...', 'a');
  await pickCombo(page, 'Search or select instrument...', 'a');
  await pickCombo(page, 'Search parameter...', 'a');
  await page.locator('textarea[placeholder="Describe the procedure step..."]').first().fill('AUTOQA procedure step 1').catch(() => {});
  const pdUnit = page.locator('input[placeholder="Select unit..."]').nth(2);
  if (await pdUnit.isVisible({ timeout: 1500 }).catch(() => false)) {
    await pdUnit.click().catch(() => {});
    await page.waitForTimeout(1000);
    const o = page.locator('[role="option"], li[class*="cursor"]').first();
    if (await o.isVisible({ timeout: 2000 }).catch(() => false)) { await o.click(); await page.waitForTimeout(500); }
  }
  // close any open dropdown WITHOUT Escape (Escape would close the modal unsaved)
  await page.getByText('Procedure Steps').first().click().catch(() => {});
  await page.waitForTimeout(500);
}

async function submitForReview(page: any) {
  await page.locator('button:has-text("Submit for Review")').first().click();
  // no confirm dialog — the modal closes once the submission completes
  await page.locator('text="Create New STP"').first().waitFor({ state: 'hidden', timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function findInTab(page: any, tab: string, product: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator(`button:has-text("${tab}")`).first().click().catch(() => {});
  await page.waitForTimeout(2000);
  await page.locator('input[placeholder="Search by STP name or product name..."]').first().fill(product);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${product}")`).first();
}

test.describe('[MODULE-STP-LIFECYCLE] STP Master — Add + Submit for Review + Approve', () => {

  test.setTimeout(240000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create an STP (linked parameter) → Submit for Review → verify in Approval Pending', async ({ page }) => {
    const product = `AUTOQA STP ${Date.now().toString().slice(-6)}`;
    await fillStpForm(page, product);

    // the auto-composed STP name must include the product we typed
    await expect(page.locator('input[name="stpName"]'))
      .toHaveValue(new RegExp(product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 6000 });

    await submitForReview(page);

    const pendingRow = await findInTab(page, 'Approval Pending', product);
    await expect(pendingRow).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 submitted STP → row-click → Approve → "Yes, Approve" → verify it becomes Active', async ({ page }) => {
    const product = `AUTOQA STP ${Date.now().toString().slice(-6)}`;
    await fillStpForm(page, product);
    await submitForReview(page);

    const pendingRow = await findInTab(page, 'Approval Pending', product);
    await expect(pendingRow).toBeVisible({ timeout: 12000 });

    // row-click opens the detail modal (no row buttons)
    await pendingRow.click();
    await page.waitForTimeout(2500);
    const approve = page.locator('button:has-text("Approve")').first();
    await approve.click();
    await page.waitForTimeout(1500);
    // confirm: "Approve STP … This moves it from Pending to Active" → "Yes, Approve"
    await expect(page.getByText(/moves it from Pending to Active/i)).toBeVisible({ timeout: 6000 });
    const yes = page.locator('button:has-text("Yes, Approve")').first();
    await yes.click();
    await page.waitForTimeout(3500);

    // it moved to Active and is gone from the pending queue
    const activeRow = await findInTab(page, 'Active', product);
    await expect(activeRow).toBeVisible({ timeout: 15000 });
  });

}); // describe STP Master lifecycle
