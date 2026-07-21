/**
 * Generic Master — Full Lifecycle Suite (Add + Submit for Review + Approve)  [DESTRUCTIVE]
 * URL  : /dashboard/products/generic-master
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Fourth link in the chain
 * (… STP Master → STP Group → Generic Master → Product Master).
 *
 * Creating a generic requires SIX things, several of them linked:
 *   1. Generic Name (text)
 *   2. Report Template  (combobox "Search or select Report Template")
 *   3. Matrix           (combobox "Search or select Matrix")
 *   4. Label            (combobox "Search or select Label")
 *   5. Generic Type     (portal dropdown "--Select Generic Type--" → Complete Generic)
 *   6. At least one STP attached: search an STP → "Add STP" puts it in an "STP Preview"
 *      DIV-GRID → tick the preview's select-all checkbox (the first checkbox AFTER the
 *      "STP Preview (n items)" heading) → "Add in Stp List" moves it into the required
 *      "Add STP's in Generic Product" list.
 * Then "Submit for Review" → Approval Pending. Approve is row-click → Approve →
 * confirm "Yes, Approve" (same pattern as STP Master / Parameter).
 *
 * The STP search API is slow and occasionally returns nothing, so the attach step
 * retries. DESTRUCTIVE: creates + submits + approves real AUTOQA generics. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/products/generic-master';
const LAB = 'Arbro - Delhi';

async function pickCombo(page: any, placeholder: string, term: string, slow = false) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
  if (!(await c.isVisible({ timeout: 3000 }).catch(() => false))) return false;
  await c.click().catch(() => {});
  await c.fill(term);
  for (let i = 0; i < (slow ? 8 : 4); i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"], ul[role="listbox"] li, li[class*="cursor"]').first();
    const t = await first.innerText().catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(900); return true; }
  }
  return false;
}

async function createGeneric(page: any, name: string) {
  await page.click('button:has-text("New Generic Master")');
  await page.waitForTimeout(2800);
  await page.locator('input[name="genericName"]').fill(name);
  expect(await pickCombo(page, 'Search or select Report Template', 'a'), 'report template option').toBe(true);
  expect(await pickCombo(page, 'Search or select Matrix', 'a'), 'matrix option').toBe(true);
  expect(await pickCombo(page, 'Search or select Label', 'a'), 'label option').toBe(true);
  // Generic Type portal dropdown → Complete Generic
  await page.locator('button:has-text("--Select Generic Type--")').first().click();
  await page.waitForTimeout(1000);
  await page.getByText('Complete Generic', { exact: true }).first().click();
  await page.waitForTimeout(800);
  await page.locator('textarea[name="remarks"]').fill('AUTOQA generic remarks').catch(() => {});

  // attach an STP (linkage) — retry the slow STP search until the preview appears
  let previewOK = false;
  for (let attempt = 0; attempt < 3 && !previewOK; attempt++) {
    await pickCombo(page, 'Search or select STP', 'a', true);
    await page.locator('button:has-text("Add STP")').first().click().catch(() => {});
    await page.waitForTimeout(2000);
    previewOK = await page.getByText(/STP Preview \(\d+ items\)/).isVisible({ timeout: 3000 }).catch(() => false);
  }
  expect(previewOK, 'expected the STP to appear in the STP Preview grid').toBe(true);

  // tick the preview's select-all (first checkbox after the heading), then Add in Stp List
  const selectAll = page.getByText(/STP Preview \(\d+ items\)/).first()
    .locator('xpath=following::input[@type="checkbox"][1]');
  await expect(selectAll).toBeVisible({ timeout: 4000 });
  await selectAll.click();
  await page.waitForTimeout(900);
  const addInList = page.locator('button:has-text("Add in Stp List")').first();
  await expect(addInList).toBeEnabled({ timeout: 5000 });
  await addInList.click();
  await page.waitForTimeout(2000);
}

async function submitForReview(page: any) {
  const submit = page.locator('button:has-text("Submit for Review")').first();
  await submit.scrollIntoViewIfNeeded().catch(() => {});
  await submit.click();
  await page.locator('text="New Generic Master"').first().waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
}

async function findInTab(page: any, tab: string, name: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator(`button:has-text("${tab}")`).first().click().catch(() => {});
  await page.waitForTimeout(2000);
  await page.locator('input[placeholder="Search by Generic Name"]').first().fill(name);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-GENERIC-LIFECYCLE] Generic Master — Add + Submit for Review + Approve', () => {

  test.setTimeout(260000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a generic (report template + matrix + label + type + linked STP) → Submit → verify Approval Pending', async ({ page }) => {
    const name = `AUTOQA Generic ${Date.now().toString().slice(-6)}`;
    await createGeneric(page, name);
    await submitForReview(page);

    const pendingRow = await findInTab(page, 'Approval Pending', name);
    await expect(pendingRow).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 submitted generic → row-click → Approve → "Yes, Approve"', async ({ page }) => {
    const name = `AUTOQA Generic ${Date.now().toString().slice(-6)}`;
    await createGeneric(page, name);
    await submitForReview(page);

    const pendingRow = await findInTab(page, 'Approval Pending', name);
    await expect(pendingRow).toBeVisible({ timeout: 12000 });

    // row-click opens the detail modal → Approve → confirm
    await pendingRow.click();
    await page.waitForTimeout(2500);
    const approve = page.locator('button:has-text("Approve")').first();
    await expect(approve).toBeVisible({ timeout: 8000 });
    await approve.click();
    await page.waitForTimeout(1500);
    const yes = page.locator('button:has-text("Yes, Approve")').first();
    await expect(yes).toBeVisible({ timeout: 6000 });
    await yes.click();
    await page.waitForTimeout(3500);

    // the generic persisted through the approve flow
    const anyRow = await findInTab(page, 'All', name);
    await expect(anyRow).toBeVisible({ timeout: 15000 });
  });

}); // describe Generic Master lifecycle
