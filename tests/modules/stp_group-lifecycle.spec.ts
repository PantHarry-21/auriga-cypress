/**
 * STP Groups — Full Lifecycle Suite (Add + Edit + Delete)  [DESTRUCTIVE]
 * URL  : /dashboard/testing/stp-groups
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Third link in the chain.
 * Creating a group requires name/header/description AND selecting at least one real
 * STP from the "Search STPs..." combobox — which is SLOW to populate (~6s), so the
 * option poll must wait it out. The list row exposes two icon-only buttons
 * (edit + delete); edit also opens via row-click (Update button in the modal).
 *
 * DESTRUCTIVE: creates real AUTOQA groups and deletes them again (self-cleaning).
 * UAT/test-DB only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/stp-groups';
const LAB = 'Arbro - Delhi';

async function pickSTP(page: any) {
  const c = page.locator('input[placeholder="Search STPs..."]').first();
  await c.click().catch(() => {});
  await c.fill('a');
  // the STP search API is slow (~6s) — poll up to ~16s for real options
  for (let i = 0; i < 7; i++) {
    await page.waitForTimeout(2500);
    const first = page.locator('[role="option"], ul[role="listbox"] li, li[class*="cursor"]').first();
    const t = await first.innerText().catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(1200); return true; }
  }
  return false;
}

async function createGroup(page: any, name: string) {
  await page.click('button:has-text("New STP Group")');
  await page.waitForTimeout(2500);
  await page.locator('input[name="stpGroupName"]').fill(name);
  await page.locator('input[name="stpGroupHeader"]').fill(`AUTOQA Header ${name.slice(-6)}`);
  await page.locator('input[name="stpGroupDescription"]').fill('AUTOQA description');
  const picked = await pickSTP(page);
  expect(picked, 'expected at least one STP option to select').toBe(true);
  // neutral click to close the dropdown (not Escape)
  await page.getByText('STP Group Description').first().click().catch(() => {});
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Create")').first().click();
  await page.waitForTimeout(3500);
}

async function findGroup(page: any, name: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder="Search stp group name..."]').first().fill(name);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-STPGROUP-LIFECYCLE] STP Groups — Add + Edit + Delete', () => {

  test.setTimeout(220000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a group (with a linked STP) → verify → delete → verify gone', async ({ page }) => {
    const name = `AUTOQA Grp ${Date.now().toString().slice(-6)}`;
    await createGroup(page, name);

    let row = await findGroup(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });

    // delete via the row's last icon button, then confirm
    const iconButtons = row.locator('button');
    const count = await iconButtons.count();
    await iconButtons.nth(count - 1).click();
    await page.waitForTimeout(1200);
    const confirm = page.locator('button:has-text("Yes, Delete"), button:has-text("Delete"), button:has-text("Yes"), button:has-text("Confirm")').last();
    if (await confirm.isVisible({ timeout: 3000 }).catch(() => false)) { await confirm.click(); await page.waitForTimeout(2500); }

    row = await findGroup(page, name);
    await expect(row).toBeHidden({ timeout: 12000 });
  });

  test('TC-LC02 create a group → row-click edit → change description → Update', async ({ page }) => {
    const name = `AUTOQA GrpEd ${Date.now().toString().slice(-6)}`;
    await createGroup(page, name);

    const row = await findGroup(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });

    // row-click opens the editable modal (no plain-text edit button)
    await row.click();
    await page.waitForTimeout(2500);
    const desc = page.locator('input[name="stpGroupDescription"]');
    await expect(desc).toBeVisible({ timeout: 8000 });
    await expect(page.locator('input[name="stpGroupName"]')).toHaveValue(name, { timeout: 6000 });

    // edit the description and Update; the record survives the round-trip
    await desc.fill('AUTOQA EDITED description');
    const update = page.locator('button:has-text("Update"), button:has-text("Save")').first();
    await expect(update).toBeVisible({ timeout: 5000 });
    await update.click();
    await page.waitForTimeout(3000);
    const row2 = await findGroup(page, name);
    await expect(row2).toBeVisible({ timeout: 12000 });

    // cleanup: delete it
    const btns = row2.locator('button');
    await btns.nth((await btns.count()) - 1).click().catch(() => {});
    await page.waitForTimeout(1000);
    const confirm = page.locator('button:has-text("Yes, Delete"), button:has-text("Delete"), button:has-text("Yes")').last();
    if (await confirm.isVisible({ timeout: 3000 }).catch(() => false)) { await confirm.click(); }
  });

}); // describe STP Groups lifecycle
