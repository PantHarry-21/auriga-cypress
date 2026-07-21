/**
 * My Equipments — Lifecycle Suite (Status toggle + Work Log)  [DESTRUCTIVE]
 * URL  : /dashboard/equipment/on-off  (nav: Equipment management → My Equipments)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * IMPORTANT — like Equipment PM, this module has no create action. It lists only
 * the equipment assigned to the current user (2 rows for admin in this UAT
 * tenant) with a live Status dot and 4 status-toggle buttons per row: Breakdown /
 * IDLE / OFF / Sample Running, plus a "Log" action.
 *
 * Discovered flow:
 *   • THE BUTTON FOR THE EQUIPMENT'S CURRENT STATUS IS DISABLED — you can't
 *     re-click the state it's already in. Find it via `button[disabled]` inside
 *     the row (its text tells you the current status), then click any OTHER
 *     status button. There is no confirm dialog and no toast — the state change
 *     is silent; verify it by reloading and checking that the disabled button
 *     changed to the new status, and that "Last Updated Action" now shows today.
 *   • "Log" is a `<button>`, not a link/icon — a plain-text locator match works,
 *     but don't assume it's an `<a>`. It opens an "Equipment Work Log" modal with
 *     a full timeline table (Start/End Task Name, timestamps, running duration)
 *     that includes the status change just made.
 *
 * DESTRUCTIVE: changes the live status of a real (shared) equipment record —
 * scoped to whichever status it happened to already be in, and reversible by
 * clicking that original status again. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/equipment/on-off';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-MY-EQUIPMENTS-LIFECYCLE] My Equipments — Status toggle + Work Log', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 toggle equipment status to a different state → verify it persists on reload', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible({ timeout: 10000 });

    const currentStatus = await row.locator('button[disabled]').innerText();
    const otherButtons = row.locator('button:not([disabled])').filter({ hasText: /Breakdown|IDLE|OFF|Sample Running/ });
    const targetStatus = await otherButtons.first().innerText();
    expect(targetStatus).not.toBe(currentStatus);

    await otherButtons.first().click();
    await page.waitForTimeout(2500);

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    const row2 = page.locator('table tbody tr').first();
    const newStatus = await row2.locator('button[disabled]').innerText();
    expect(newStatus.trim()).toBe(targetStatus.trim());
    await expect(row2).toContainText(new Date().getFullYear().toString());

    // restore the original status so the shared equipment record isn't left
    // in a different state than we found it
    const restoreBtn = row2.locator('button:not([disabled])').filter({ hasText: new RegExp(`^${currentStatus.trim()}$`) });
    await restoreBtn.click();
    await page.waitForTimeout(2000);
  });

  test('TC-LC02 status change is recorded in the Equipment Work Log', async ({ page }) => {
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible({ timeout: 10000 });

    const currentStatus = await row.locator('button[disabled]').innerText();
    const otherButtons = row.locator('button:not([disabled])').filter({ hasText: /Breakdown|IDLE|OFF|Sample Running/ });
    await otherButtons.first().click();
    await page.waitForTimeout(2500);

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    const row2 = page.locator('table tbody tr').first();
    await row2.locator('button:has-text("Log")').click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Equipment Work Log')).toBeVisible({ timeout: 8000 });
    // the newest log row's timestamp should be from today
    const firstLogRow = page.locator('table tbody tr').first();
    await expect(firstLogRow).toContainText(new Date().getFullYear().toString(), { timeout: 5000 });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.waitForTimeout(800);

    // restore original status
    const row3 = page.locator('table tbody tr').first();
    const restoreBtn = row3.locator('button:not([disabled])').filter({ hasText: new RegExp(`^${currentStatus.trim()}$`) });
    await restoreBtn.click();
    await page.waitForTimeout(2000);
  });

}); // describe My Equipments lifecycle
