/**
 * Designation — Full Lifecycle Suite (Add + Approve / Reject)  [DESTRUCTIVE]
 * URL  : /dashboard/designation
 * Role : admin
 *
 * Same request/approval workflow as Department (verified pattern, 2026-07-20):
 * "New Designation" submits a request → Pending tab with Approve / Reject →
 * moves to Approved / Rejected. Creates uniquely-tagged AUTOQA records; run
 * against UAT/test-DB only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/designation';
const LAB = 'Arbro - Delhi';

async function submitRequest(page: any, name: string) {
  await page.click('button:has-text("New Designation")');
  await page.waitForTimeout(1500);
  await expect(page.locator('input[name="designationName"]')).toBeVisible({ timeout: 10000 });
  await page.locator('input[name="designationName"]').fill(name);
  await page.locator('input[name="location"]').fill('Delhi').catch(() => {});
  await page.locator('textarea[name="remark"]').fill('Automated QA lifecycle test').catch(() => {});
  await page.locator('button:has-text("Submit Request")').click();
  await page.waitForTimeout(3000);
}

async function openTabAndFind(page: any, tab: RegExp, name: string) {
  await page.locator('button').filter({ hasText: tab }).first().click();
  await page.waitForTimeout(2500);
  const search = page.locator('input[placeholder*="Search"]').first();
  if (await search.isVisible().catch(() => false)) { await search.fill(name); await page.waitForTimeout(2000); }
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-DESIGNATION-LIFECYCLE] Designation — Add + Approve/Reject', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create designation request → verify Pending → approve → verify Approved', async ({ page }) => {
    const name = `AUTOQA Desig ${Date.now().toString().slice(-6)}`;
    await submitRequest(page, name);

    const pendingRow = await openTabAndFind(page, /^Pending/, name);
    await expect(pendingRow).toBeVisible({ timeout: 10000 });
    await expect(pendingRow.locator('button:has-text("Approve")')).toBeVisible();

    await pendingRow.locator('button:has-text("Approve")').first().click();
    await page.waitForTimeout(1500);
    const confirm = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Approve")').last();
    if (await confirm.isVisible({ timeout: 2500 }).catch(() => false)) { await confirm.click(); await page.waitForTimeout(2500); }

    const approvedRow = await openTabAndFind(page, /^Approved/, name);
    await expect(approvedRow).toBeVisible({ timeout: 10000 });
  });

  test('TC-LC02 create designation request → reject → verify Rejected', async ({ page }) => {
    const name = `AUTOQA DesigRej ${Date.now().toString().slice(-6)}`;
    await submitRequest(page, name);

    const pendingRow = await openTabAndFind(page, /^Pending/, name);
    await expect(pendingRow).toBeVisible({ timeout: 10000 });

    await pendingRow.locator('button:has-text("Reject")').first().click();
    await page.waitForTimeout(1500);
    const reasonBox = page.locator('textarea:visible').last();
    if (await reasonBox.isVisible({ timeout: 2000 }).catch(() => false)) await reasonBox.fill('Automated QA rejection reason');
    const confirm = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Reject")').last();
    if (await confirm.isVisible({ timeout: 2500 }).catch(() => false)) { await confirm.click(); await page.waitForTimeout(2500); }

    const rejectedRow = await openTabAndFind(page, /^Rejected/, name);
    await expect(rejectedRow).toBeVisible({ timeout: 10000 });
  });

}); // describe Designation lifecycle
