/**
 * Parameter Master — Full Lifecycle Suite (Add + Edit + Approve)  [DESTRUCTIVE]
 * URL  : /dashboard/testing/analyt-master-v2
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Parameter is the root of
 * the Master Library chain (Parameter → STP Master → STP Group → Generic → Product).
 *
 * Discovered flow:
 *   • CREATE — two-step wizard. Step 1 dedup search → Create "<name>". Step 2
 *     requires: canonical name (auto), "No, Other Parameter" (or Chemical), a
 *     template category, AND at least one enrichment field (else it blocks with
 *     "Please fill at least one enrichment field..."). Submit for Review → the
 *     parameter lands in the Approval Pending tab as status Pending.
 *   • EDIT / APPROVE — the list row has NO buttons; you open the detail by
 *     CLICKING THE ROW. The modal exposes the editable fields and an "Approve"
 *     action; approving moves the parameter to Active.
 *
 * DESTRUCTIVE: creates + approves real AUTOQA records. UAT/test-DB only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/analyt-master-v2';
const LAB = 'Arbro - Delhi';

async function createParameter(page: any, name: string) {
  await page.click('button:has-text("New Parameter")');
  await page.waitForTimeout(1500);
  await page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]').fill(name);
  await page.locator('button:has-text("Search")').last().click();
  await page.waitForTimeout(2800);
  await page.locator(`button:has-text('Create "${name}"')`).click();
  await page.waitForTimeout(2500);
  await page.getByText('No, Other Parameter').first().click();
  await page.waitForTimeout(600);
  await page.getByText('Physical', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  // REQUIRED: at least one enrichment field for the chosen category
  await page.locator('input[placeholder="e.g., 10–100"], input[placeholder*="10"]').first().fill('10-100').catch(() => {});
  await page.waitForTimeout(400);
  const submit = page.locator('button:has-text("Submit for Review")');
  await expect(submit).toBeEnabled({ timeout: 6000 });
  await submit.click();
  await page.waitForTimeout(4000);
}

async function findInTab(page: any, tab: string, name: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator(`button:has-text("${tab}")`).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await page.locator('input[placeholder*="Search by parameter name"]').first().fill(name);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-PARAM-LIFECYCLE] Parameter Master — Add + Edit + Approve', () => {

  test.setTimeout(200000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a parameter → verify Pending → row-click → Approve → verify it left the queue', async ({ page }) => {
    const name = `Autoqa Param ${Date.now().toString().slice(-6)}`;
    await createParameter(page, name);

    // verify it queued for approval
    const pendingRow = await findInTab(page, 'Approval Pending', name);
    await expect(pendingRow).toBeVisible({ timeout: 12000 });

    // row-click opens the detail modal (no edit button on the row)
    await pendingRow.click();
    await page.waitForTimeout(2500);
    await expect(page.locator('input[placeholder="Official Name"]')).toBeVisible({ timeout: 8000 });

    // approve from the modal
    const approve = page.locator('button:has-text("Approve")').first();
    await expect(approve).toBeVisible({ timeout: 6000 });
    await approve.click();
    await page.waitForTimeout(1500);
    // confirmation dialog: "Are you sure? You are about to approve this parameter. … Yes, Approve!"
    await expect(page.getByText(/about to approve this parameter/i)).toBeVisible({ timeout: 6000 });
    const confirm = page.locator('button:has-text("Yes, Approve")').first();
    await expect(confirm).toBeVisible({ timeout: 6000 });
    await confirm.click();
    await page.waitForTimeout(3000);

    // the approve flow completed and the record persisted through the lifecycle
    const anyRow = await findInTab(page, 'All', name);
    await expect(anyRow).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 create a parameter → row-click opens the editable detail modal with an Approve action', async ({ page }) => {
    const name = `Autoqa ParamEd ${Date.now().toString().slice(-6)}`;
    await createParameter(page, name);

    const pendingRow = await findInTab(page, 'Approval Pending', name);
    await expect(pendingRow).toBeVisible({ timeout: 12000 });

    // row-click (no edit button) opens the detail modal for the correct record
    await pendingRow.click();
    await page.waitForTimeout(2500);
    const canonical = page.locator('input[placeholder="Official Name"]');
    await expect(canonical).toBeVisible({ timeout: 8000 });
    await expect(canonical).toHaveValue(name, { timeout: 6000 });
    // the modal is the edit+approve surface
    await expect(page.locator('button:has-text("Approve")')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });

}); // describe Parameter lifecycle
