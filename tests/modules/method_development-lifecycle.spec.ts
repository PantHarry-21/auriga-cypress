/**
 * Method Development — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/method/development  (nav: Document Management → Method
 *        development)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21. The most complex form
 * in this whole suite — a full analytical-method approval workflow, not a
 * simple record.
 *
 * Discovered flow:
 *   • "New Method Development" — Client Name* (real filtering combobox),
 *     Client Address (optional textarea), Method Title* (text), Guide Line
 *     (optional text, prefilled "[As per ICH Guideline]"), Method Code*
 *     (text), Issue No* (text), Next Revision Date / Issue Date (real
 *     `<input type="date">`, both optional), No of Approval Required*
 *     (defaults to "4 Approval Required"), and FIVE separate people-picker
 *     dropdowns: Department*, Author*, Process Owner*, Reviewer*, Approval*.
 *   • ALL FIVE PEOPLE-PICKERS ARE "TYPE TO SEARCH" BOXES THAT DON'T ACTUALLY
 *     FILTER — same widget-type-2 trap as Equipment Registration — so each
 *     is selected via ArrowDown×N + Enter, NOT by typing a search term.
 *   • REAL APP VALIDATION: "Same person cannot fill multiple approver
 *     roles" — Author/Process Owner/Reviewer/Approval must resolve to four
 *     DIFFERENT people. Since all four dropdowns share the same underlying
 *     options list in the same order, picking the same ArrowDown count for
 *     each one picks the SAME person and trips this rule. Each dropdown is
 *     given a distinct press-count (2/4/6/8) to land on different people.
 *   • The "Approved By 1–4" text fields (Prepared/Checked/Reviewed/Approved
 *     By) are auto-managed and permanently disabled/readonly on this form —
 *     do not attempt to fill them.
 *   • REAL APP PERFORMANCE ISSUE: opening "Edit" on an existing record shows
 *     a completely BLANK form for ~9–10 seconds before the real data
 *     populates (no loading spinner on the fields themselves, easy to
 *     mistake for a stuck/broken state) — worth a generous wait, not a
 *     short one. Clicking "Update" is even slower: the button sits in a
 *     "Saving..." state for as long as 30–45 seconds before the panel
 *     finally closes. Issue No is read-only in Edit mode (Guide Line is
 *     used instead as the edited field).
 *
 * DESTRUCTIVE: creates two real AUTOQA method development records (one full
 * 4-approval workflow, one edited) permanently. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/method/development';
const LAB = 'Arbro - Delhi';

async function pickArrowDown(page: any, buttonLabel: string, presses: number) {
  const btn = page.locator(`button:has-text("${buttonLabel}")`).first();
  await btn.click();
  await page.waitForTimeout(800);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.click().catch(() => {});
  for (let i = 0; i < presses; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function pickCombo(page: any, placeholder: string, term: string) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
  await c.click().catch(() => {});
  await c.fill(term);
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"]').filter({ hasText: /\S/ }).first();
    const t = await first.innerText({ timeout: 1000 }).catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(900); return true; }
  }
  return false;
}

async function createMethodDevelopment(page: any, methodTitle: string) {
  await page.click('button:has-text("New Method Development")');
  await page.waitForTimeout(2500);

  expect(await pickCombo(page, 'Search and select client or type manually...', 'lab'), 'client option').toBe(true);
  await page.locator('input[name="methodTitle"]').fill(methodTitle);
  await page.locator('input[name="methodCode"]').fill(`MC-${Date.now().toString().slice(-6)}`);
  await page.locator('input[name="issueNo"]').fill('1');

  // distinct press-counts so each people-picker lands on a different person
  await pickArrowDown(page, '--Select Department--', 2);
  await pickArrowDown(page, '--Select Author--', 2);
  await pickArrowDown(page, '--Select Process Owner--', 4);
  await pickArrowDown(page, '--Select Reviewer--', 6);
  await pickArrowDown(page, '--Select Approval--', 8);

  const saveBtn = page.locator('button:has-text("SAVE")').first();
  await expect(saveBtn).toBeEnabled({ timeout: 5000 });
  await saveBtn.click();
  await page.waitForTimeout(4000);
}

async function findMethodDevRow(page: any, methodTitle: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(methodTitle);
  await page.waitForTimeout(2500);
  return page.locator('table tbody tr', { hasText: methodTitle }).first();
}

test.describe('[MODULE-METHOD-DEVELOPMENT-LIFECYCLE] Method Development — Add + Edit', () => {

  test.setTimeout(240000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 create a method development record (4-approval workflow) → verify in list', async ({ page }) => {
    const methodTitle = `AUTOQA Method Dev ${Date.now().toString().slice(-6)}`;
    await createMethodDevelopment(page, methodTitle);

    const row = await findMethodDevRow(page, methodTitle);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 create a method development record → Edit → change Guide Line → Update → verify', async ({ page }) => {
    const methodTitle = `AUTOQA Method Dev Edit ${Date.now().toString().slice(-6)}`;
    await createMethodDevelopment(page, methodTitle);

    const row = await findMethodDevRow(page, methodTitle);
    await expect(row).toBeVisible({ timeout: 12000 });

    await row.locator('button').first().click();
    // the edit panel renders BLANK for ~9-10s before real data populates
    await expect(page.locator('input[name="methodTitle"]')).toHaveValue(methodTitle, { timeout: 20000 });

    await page.locator('input[name="guideLine"]').fill('AUTOQA edited guideline');
    const updateBtn = page.locator('button:has-text("Update")').first();
    await updateBtn.click();

    // Update sits in a "Saving..." state for as long as 30-45s before closing
    await expect(page.getByText('Edit Method Development')).toBeHidden({ timeout: 60000 });
  });

}); // describe Method Development lifecycle
