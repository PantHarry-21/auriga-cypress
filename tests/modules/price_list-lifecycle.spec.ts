/**
 * Price List — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/price-list  (nav: Sample Management → Price List)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20.
 *
 * Discovered flow:
 *   • Unlike most other master modules, this form uses plain NATIVE `<select>`
 *     elements (Department, Industry, Technique) — no headless-ui comboboxes, no
 *     search-and-poll dance. `selectOption({ index: 1 })` just works.
 *   • Required fields: Name, Department, Valid From/To Date (native `type="date"`
 *     inputs — fill with "YYYY-MM-DD"), Applicable Labs (checkbox group, at least
 *     one — check it scoped to its `<label>`; a bare text-click on "Delhi" can hit
 *     an unrelated stale node elsewhere in the DOM and hang), Industry, Technique,
 *     Description of Test, Price in Rs., Price in USD. "Active" defaults to checked.
 *   • THE LIST SEARCH BOX IS NOT LIVE — filling it does nothing until you click the
 *     "Search" button; fill() + wait alone leaves the unfiltered list showing.
 *   • THE SERVER ENFORCES A UNIQUENESS CONSTRAINT on Industry + Technique +
 *     Description ("Price code already exists for this Industry + Technique +
 *     Description combination"), rejecting the save with no thrown error — the
 *     slide-over just silently stays open with a red banner. Since Industry/
 *     Technique here are always picked by fixed `selectOption({ index: 1 })`, the
 *     Description MUST be made unique per run (this spec appends the test's own
 *     unique `name`) or every run after the first fails this way.
 *   • PRICE IN RS. / PRICE IN USD BECOME READONLY IN THE EDIT MODAL (locked once
 *     the price code is generated) — the edit test changes the Name instead, the
 *     one field that stays editable.
 *   • THE ROW HAS TWO ICON BUTTONS, BUT THEY ARE NOT "edit + delete" LIKE MOST
 *     OTHER MODULES — the first is Edit (opens the same form pre-filled, footer
 *     button becomes "Update"), the SECOND IS "Add Client Price" (a distinct
 *     related feature — a slide-over titled "Add Client Price" that lets you base
 *     a client-specific override on this price-list test code; it is NOT a delete
 *     confirmation). No delete affordance was found anywhere on the row, the list
 *     toolbar, or a checkbox+bulk-action pattern — Price List entries appear to be
 *     permanent once created, matching Client Quotation's behavior elsewhere in
 *     this app family.
 *
 * DESTRUCTIVE: creates + edits a real AUTOQA price list entry. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/price-list';
const LAB = 'Arbro - Delhi';

async function fillPriceListForm(page: any, name: string, priceRs: string) {
  await page.locator('input[placeholder="Enter name"]').first().fill(name);
  await page.locator('select').nth(0).selectOption({ index: 1 }); // Department

  await page.locator('input[type="date"]').nth(0).fill('2026-08-01');
  await page.locator('input[type="date"]').nth(1).fill('2026-12-31');

  // scoped to the checkbox's own <label> — a bare text click can hit an unrelated
  // stale "Delhi" node elsewhere in the DOM (e.g. a closed portal from another select)
  await page.locator('label:has-text("Delhi")').first().locator('input[type="checkbox"]').check();

  await page.locator('select').nth(1).selectOption({ index: 1 }); // Industry
  await page.waitForTimeout(400);
  await page.locator('select').nth(2).selectOption({ index: 1 }); // Technique

  // description must be unique per Industry+Technique combo (server rejects
  // "Price code already exists for this Industry + Technique + Description
  // combination" on a repeat) — derive it from the unique `name` we were given
  await page.locator('input[placeholder="Enter description"]').first().fill(`AUTOQA test description ${name}`);
  await page.locator('input[type="number"]').nth(0).fill(priceRs);
  await page.locator('input[type="number"]').nth(1).fill('6');
}

async function findPriceList(page: any, name: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder="Search"]').first().fill(name);
  // this list's search is NOT live — it only filters after clicking "Search"
  await page.locator('button:has-text("Search")').first().click();
  await page.waitForTimeout(2000);
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-PRICE-LIST-LIFECYCLE] Price List — Add + Edit', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a price list entry (dept + industry + technique + labs) → verify in list', async ({ page }) => {
    const name = `AUTOQA PriceList ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Price List")');
    await page.waitForTimeout(5000);
    await fillPriceListForm(page, name, '500');

    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(3000);

    const row = await findPriceList(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 create a price list entry → pencil icon → edit modal opens pre-filled with Update button', async ({ page }) => {
    const name = `AUTOQA PriceListEd ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Price List")');
    await page.waitForTimeout(5000);
    await fillPriceListForm(page, name, '500');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(3000);

    const row = await findPriceList(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });

    // first row button = edit (pencil) — the SECOND is "Add Client Price", not delete
    const btns = row.locator('button');
    await btns.nth(0).click();
    await page.waitForTimeout(3000);
    const nameInput = page.locator('input[placeholder="Enter name"]').first();
    await expect(nameInput).toHaveValue(name, { timeout: 8000 });
    await expect(page.locator('button:has-text("Update")')).toBeVisible({ timeout: 6000 });

    // Price in Rs./USD are READONLY once created (locked to the price code), so
    // edit the Name instead — a real, editable field — and verify it persisted
    const editedName = `${name} Edited`;
    await nameInput.fill(editedName);
    await page.locator('button:has-text("Update")').first().click();
    await page.waitForTimeout(3000);

    const row2 = await findPriceList(page, editedName);
    await expect(row2).toBeVisible({ timeout: 12000 });
  });

}); // describe Price List lifecycle
