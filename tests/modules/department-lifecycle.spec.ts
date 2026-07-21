/**
 * Department — Full Lifecycle Suite (Add + Approve)  [DESTRUCTIVE]
 * URL  : /dashboard/department
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Department is a request/
 * approval workflow: "New Department" submits a request that lands in the Pending
 * tab with Approve / Reject actions; approving it moves it to the Approved tab.
 *
 * DESTRUCTIVE: this suite creates and approves a real record (uniquely tagged
 * AUTOQA_<timestamp>). It does not delete afterwards because department requests
 * have no delete affordance — approved test departments are inert and namespaced.
 * Run against UAT/test-DB only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/department';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-DEPARTMENT-LIFECYCLE] Department — Add + Approve', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a department request → verify in Pending → approve → verify in Approved', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    const name = `AUTOQA Dept ${ts}`;

    // ── ADD ──────────────────────────────────────────────────────────────────
    await page.click('button:has-text("New Department")');
    await page.waitForTimeout(1500);
    await expect(page.locator('input[name="deptName"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[name="deptName"]').fill(name);
    await page.locator('input[name="subDepartmentName"]').fill(`AUTOQA Sub ${ts}`);
    await page.locator('input[name="location"]').fill('Delhi');
    await page.locator('textarea[name="reason"]').fill('Automated QA lifecycle test');

    const submit = page.locator('button:has-text("Submit Request")');
    await expect(submit).toBeEnabled();
    await submit.click();
    await page.waitForTimeout(3000);

    // ── VERIFY in Pending ─────────────────────────────────────────────────────
    await page.locator('button').filter({ hasText: /^Pending/ }).first().click();
    await page.waitForTimeout(2000);
    const search = page.locator('input[placeholder*="Search"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill(name);
      await page.waitForTimeout(2000);
    }
    const pendingRow = page.locator(`table tbody tr:has-text("${name}")`).first();
    await expect(pendingRow).toBeVisible({ timeout: 10000 });
    await expect(pendingRow.locator('button:has-text("Approve")')).toBeVisible();
    await expect(pendingRow.locator('button:has-text("Reject")')).toBeVisible();

    // ── APPROVE ───────────────────────────────────────────────────────────────
    await pendingRow.locator('button:has-text("Approve")').first().click();
    await page.waitForTimeout(1500);
    // handle a confirmation dialog if one appears
    const confirm = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Approve")').last();
    if (await confirm.isVisible({ timeout: 2500 }).catch(() => false)) {
      await confirm.click();
      await page.waitForTimeout(2500);
    }

    // ── VERIFY in Approved ────────────────────────────────────────────────────
    await page.locator('button').filter({ hasText: /^Approved/ }).first().click();
    await page.waitForTimeout(2500);
    const search2 = page.locator('input[placeholder*="Search"]').first();
    if (await search2.isVisible().catch(() => false)) {
      await search2.fill(name);
      await page.waitForTimeout(2000);
    }
    await expect(page.locator(`table tbody tr:has-text("${name}")`).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-LC02 create a department request → reject it → verify in Rejected', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    const name = `AUTOQA DeptRej ${ts}`;

    await page.click('button:has-text("New Department")');
    await page.waitForTimeout(1500);
    await page.locator('input[name="deptName"]').fill(name);
    await page.locator('input[name="subDepartmentName"]').fill(`AUTOQA SubR ${ts}`);
    await page.locator('input[name="location"]').fill('Delhi');
    await page.locator('textarea[name="reason"]').fill('Automated QA reject-path test');
    await page.locator('button:has-text("Submit Request")').click();
    await page.waitForTimeout(3000);

    await page.locator('button').filter({ hasText: /^Pending/ }).first().click();
    await page.waitForTimeout(2000);
    const search = page.locator('input[placeholder*="Search"]').first();
    if (await search.isVisible().catch(() => false)) { await search.fill(name); await page.waitForTimeout(2000); }
    const row = page.locator(`table tbody tr:has-text("${name}")`).first();
    await expect(row).toBeVisible({ timeout: 10000 });

    await row.locator('button:has-text("Reject")').first().click();
    await page.waitForTimeout(1500);
    // a reject flow may prompt for a reason + confirm
    const reasonBox = page.locator('textarea:visible').last();
    if (await reasonBox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reasonBox.fill('Automated QA rejection reason');
    }
    const confirm = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Reject")').last();
    if (await confirm.isVisible({ timeout: 2500 }).catch(() => false)) {
      await confirm.click();
      await page.waitForTimeout(2500);
    }

    await page.locator('button').filter({ hasText: /^Rejected/ }).first().click();
    await page.waitForTimeout(2500);
    const search2 = page.locator('input[placeholder*="Search"]').first();
    if (await search2.isVisible().catch(() => false)) { await search2.fill(name); await page.waitForTimeout(2000); }
    await expect(page.locator(`table tbody tr:has-text("${name}")`).first()).toBeVisible({ timeout: 10000 });
  });

}); // describe Department lifecycle
