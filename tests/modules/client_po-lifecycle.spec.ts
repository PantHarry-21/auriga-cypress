/**
 * Client PO — Full Lifecycle Suite (Add + Checkbox-Delete)  [DESTRUCTIVE]
 * URL  : /dashboard/purchase/client-purchase-order?tab=active  (nav: Purchase & Indent → Client PO)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21. This is the module that
 * actually uses the checkbox → toolbar-button → confirm delete pattern (most
 * other modules in this suite instead use a direct row delete icon).
 *
 * Discovered flow:
 *   • "New Purchase Order" — Client Name* (search-by-company combobox, "min 3
 *     chars" is a REAL requirement: a 1-character search like "a" never
 *     triggers a lookup at all), PO Number*, PO Type* ("Sample Wise" vs
 *     "Product Wise" — picking "Sample Wise" reveals an extra required "Max
 *     Batches Allowed" field, so this spec uses "Product Wise" to keep the flow
 *     simple), PO Date* (prefilled), PO Expiry Date (REQUIRED specifically when
 *     PO Type is "Product Wise", not visually marked with an asterisk), PO
 *     Amount*, PO File (optional), Remarks* (5–500 chars).
 *   • THE CLIENT NAME OPTIONS ARE PLAIN `<button>` ELEMENTS WITH NO ARIA ROLE —
 *     same trap as several other modules; a `[role="option"]` locator matches
 *     nothing. Target the option's text directly (e.g. `div.text-sm.font-medium`
 *     inside the result button).
 *   • PO EXPIRY DATE IS A FULLY CUSTOM CALENDAR WIDGET, not a native
 *     `<input type="date">` — there are zero real date inputs on this form.
 *     Click the "dd/mm/yyyy" placeholder span to open a month calendar, then
 *     click a day button directly.
 *   • THE ROW HAS A CHECKBOX (not a delete icon) — select it, then the
 *     toolbar's "Delete" button (label updates to "Delete (n)") opens a confirm
 *     dialog: "Delete Purchase Order? — Move this PO to Trash. This cannot be
 *     undone." with the PO number shown for confirmation → "Delete". This is a
 *     SOFT delete: the record moves from the "Active" tab to the "Expired /
 *     Trash" tab rather than being destroyed.
 *
 * DESTRUCTIVE: creates a real AUTOQA client purchase order and moves it to
 * Trash. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/client-purchase-order?tab=active';
const LAB = 'Arbro - Delhi';

async function pickClientCombo(page: any, term: string) {
  const c = page.locator('input[name="clientName"]').first();
  await c.click().catch(() => {});
  await c.fill(term);
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(2000);
    // options render as plain buttons with no ARIA role
    const opt = page.locator('div.text-sm.font-medium').filter({ hasText: /\S/ }).first();
    const t = await opt.innerText({ timeout: 1000 }).catch(() => '');
    if (t && !/searching/i.test(t)) { await opt.click(); await page.waitForTimeout(1500); return t; }
  }
  return false;
}

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(1000);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.fill(term);
  await page.waitForTimeout(1200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
}

async function createClientPO(page: any, poNo: string) {
  await page.click('button:has-text("New Purchase Order")');
  await page.waitForTimeout(3000);

  expect(await pickClientCombo(page, 'lab'), 'client option (min 3 chars)').toBeTruthy();
  await page.locator('input[name="poNo"]').fill(poNo);
  await pickTypeSearch(page, 'Select PO type', 'Product'); // Product Wise, not Sample Wise

  // PO Expiry Date — a fully custom calendar widget, no native date input
  await page.getByText('dd/mm/yyyy', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("31")').last().click();
  await page.waitForTimeout(800);

  await page.locator('input[name="poAmount"]').fill('5000');
  await page.locator('textarea[name="remarks"]').fill('AUTOQA test purchase order remarks');

  const createBtn = page.locator('button:has-text("Create")').first();
  await expect(createBtn).toBeEnabled({ timeout: 5000 });
  await createBtn.click();
  await page.waitForTimeout(3500);
}

async function findPO(page: any, poNo: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder*="Search by PO number"]').first().fill(poNo);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${poNo}")`).first();
}

test.describe('[MODULE-CLIENT-PO-LIFECYCLE] Client PO — Add + Checkbox-Delete', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 create a Product Wise client PO (with required expiry date) → verify in Active list', async ({ page }) => {
    const poNo = `AUTOQA-PO-${Date.now().toString().slice(-6)}`;
    await createClientPO(page, poNo);
    await expect(page.getByText(/Purchase Order created/i)).toBeVisible({ timeout: 10000 });

    const row = await findPO(page, poNo);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 create a PO → check its row checkbox → toolbar Delete → confirm → moves to Expired/Trash tab', async ({ page }) => {
    const poNo = `AUTOQA-PODel-${Date.now().toString().slice(-6)}`;
    await createClientPO(page, poNo);

    const row = await findPO(page, poNo);
    await expect(row).toBeVisible({ timeout: 12000 });

    // checkbox → toolbar Delete → confirm dialog (the pattern this module uses,
    // unlike most others in this suite which have a direct row delete icon)
    await row.locator('input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete")').first().click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/Move this PO to Trash/i)).toBeVisible({ timeout: 6000 });
    await page.locator('button:has-text("Delete")').last().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/PO deleted/i)).toBeVisible({ timeout: 8000 });

    // gone from Active...
    const activeRow = await findPO(page, poNo);
    await expect(activeRow).toBeHidden({ timeout: 8000 });

    // ...but present in Expired / Trash (soft delete)
    await page.click('text="Expired / Trash"');
    await page.waitForTimeout(2500);
    await page.locator('input[placeholder*="Search by PO number"]').first().fill(poNo);
    await page.waitForTimeout(2500);
    await expect(page.getByText(poNo).first()).toBeVisible({ timeout: 8000 });
  });

}); // describe Client PO lifecycle
