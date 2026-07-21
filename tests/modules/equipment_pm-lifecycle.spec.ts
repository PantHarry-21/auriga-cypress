/**
 * Equipment PM — Lifecycle Suite (PM Checklist workflow)  [DESTRUCTIVE-CAPABLE]
 * URL  : /dashboard/equipment/pm  (nav: Equipment management → Equipment PM)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * IMPORTANT — this module has no "New Entry" / create action at all. It's an
 * auto-populated worklist: one row per already-registered equipment (see
 * equipment_registration-lifecycle.spec.ts), showing its Next PM Date and
 * Done By/Done Date/Approve By/Approve Date once its preventive-maintenance
 * checklist has been completed. The only action is the row's "PM Checklist"
 * button, which opens "Preventive Maintenance Check Points of <Equipment ID>".
 *
 * Discovered flow / environment limitation:
 *   • Every equipment checked in this UAT tenant — including brand-new AUTOQA
 *     equipment registered fresh via Equipment Registration, and several
 *     longstanding real equipment rows — opens the checklist to "No questions
 *     available". No checklist template appears to be configured for any
 *     equipment category in this environment, so there is nothing to actually
 *     answer here; the true "complete a PM" happy path cannot be exercised
 *     without checklist data existing first (a Master Library / equipment
 *     category concern out of scope for this module).
 *   • What IS genuinely testable and destructive-relevant: clicking "Save" with
 *     zero questions answered is correctly REJECTED — toast "Please answer at
 *     least one question" — i.e. the checklist won't silently mark a PM as done
 *     with no data. This spec verifies that guard, plus that "Close" cleanly
 *     dismisses the modal without side effects.
 *
 * UAT only — read-mostly given the above, but exercises the one real write-path
 * guard this module has.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/equipment/pm';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-EQUIPMENT-PM-LIFECYCLE] Equipment PM — Checklist workflow', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 open PM Checklist for the top equipment row → verify modal structure', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible({ timeout: 10000 });
    const equipmentId = await row.locator('td').nth(2).innerText().catch(() => '');

    await row.locator('button, a').last().click();
    await page.waitForTimeout(4000);
    await expect(page.getByText(/Preventive Maintenance Check Points/i)).toBeVisible({ timeout: 8000 });
    if (equipmentId) {
      await expect(page.getByText(new RegExp(equipmentId.trim())).first()).toBeVisible({ timeout: 5000 });
    }
    await expect(page.locator('button:has-text("Save")')).toBeVisible({ timeout: 5000 });

    await page.locator('button:has-text("Close")').click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Preventive Maintenance Check Points/i)).toBeHidden({ timeout: 5000 });
  });

  test('TC-LC02 Save with zero questions answered is rejected with a validation toast', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible({ timeout: 10000 });

    await row.locator('button, a').last().click();
    await page.waitForTimeout(4000);
    await expect(page.getByText(/Preventive Maintenance Check Points/i)).toBeVisible({ timeout: 8000 });

    const saveBtn = page.locator('button:has-text("Save")').first();
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });
    await saveBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Please answer at least one question/i)).toBeVisible({ timeout: 8000 });
  });

}); // describe Equipment PM lifecycle
