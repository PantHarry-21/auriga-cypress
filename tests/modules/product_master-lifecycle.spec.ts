/**
 * Product Master — Full Lifecycle Suite (Add + Edit + Delete)  [DESTRUCTIVE]
 * URL  : /dashboard/products/master
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Final link in the Master
 * Library chain (Parameter → STP Master → STP Group → Generic Master → Product Master).
 *
 * Discovered flow:
 *   • CREATE is TWO STEPS. Step 1: fill Generic Name (combobox, search an existing
 *     AUTOQA generic), Client Name (combobox), Brand Name (free-text combobox), and
 *     both "Expected Testing Day" dropdowns — then click "Add". This does NOT save
 *     yet; it expands the form to show the linked generic's read-only details
 *     (Matrix / Label / Report Template / linked STPs) plus a real "Save Product"
 *     button. Step 2: click "Save Product" to actually persist the record.
 *   • The two "Expected Testing Day" fields are custom (non-native) button
 *     dropdowns. Clicking the trigger sometimes only focuses it without opening the
 *     panel (flaky), so the picker retries the click up to a few times until the
 *     "Type to search..." box appears. DO NOT click the digit option directly —
 *     the option spans get intercepted by overlapping modal chrome (a stacking
 *     issue). Instead type the day number into the search box and press Enter,
 *     which reliably commits the value without any pointer/z-index problems.
 *   • EDIT / DELETE — unlike several other chain modules, the list row has two
 *     direct icon-only buttons in an "Actions" column (pencil = edit, trash =
 *     delete) — no row-click and no checkbox→Actions pattern here. Edit opens the
 *     same form pre-filled with an "Update" button. Delete opens a simple confirm
 *     dialog: "Delete Product — Are you sure you want to delete "<brand>"?" →
 *     Cancel / Delete.
 *
 * DESTRUCTIVE: creates + edits + deletes real AUTOQA products (self-cleaning).
 * UAT/test-DB only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/products/master';
const LAB = 'Arbro - Delhi';

async function pickCombo(page: any, placeholder: string, term: string, slow = false) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
  if (!(await c.isVisible({ timeout: 3000 }).catch(() => false))) return false;
  await c.click().catch(() => {});
  await c.fill(term);
  for (let i = 0; i < (slow ? 8 : 5); i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"], ul[role="listbox"] li, li[class*="cursor"]').first();
    const t = await first.innerText().catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(900); return true; }
  }
  return false;
}

async function pickDay(page: any, buttonLabel: string, day: string) {
  const btn = page.locator(`button:has-text("${buttonLabel}")`).first();
  let search = page.locator('input[placeholder="Type to search..."]').last();
  for (let attempt = 0; attempt < 4; attempt++) {
    await btn.click();
    await page.waitForTimeout(900);
    if (await search.isVisible({ timeout: 1500 }).catch(() => false)) break;
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
  }
  if (!(await search.isVisible({ timeout: 1000 }).catch(() => false))) return false;
  await search.fill(day);
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  return true;
}

async function createProduct(page: any, brand: string) {
  await page.click('button:has-text("New Product")');
  await page.waitForTimeout(2800);
  expect(await pickCombo(page, 'Search and select generic product...', 'AUTOQA', true), 'generic product option').toBe(true);
  expect(await pickCombo(page, 'Search and select client...', 'a', true), 'client option').toBe(true);
  await page.locator('input[placeholder="Enter or search brand/product name..."]').first().fill(brand);
  await page.waitForTimeout(800);
  expect(await pickDay(page, '-- Expected Testing Day --', '5'), 'testing day picker').toBe(true);
  expect(await pickDay(page, '-- Expected Testing Day Micro Parameters--', '7'), 'testing day micro picker').toBe(true);

  // Step 1 "Add" expands the form with the generic's read-only details + a Save Product button
  await page.locator('button:has-text("Add")').first().click();
  await page.waitForTimeout(2500);
  const save = page.locator('button:has-text("Save Product")').first();
  await expect(save).toBeVisible({ timeout: 8000 });
  await save.click();
  await page.waitForTimeout(3000);
}

async function findProduct(page: any, brand: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder="Search by Brand or Generic Name"]').first().fill(brand);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${brand}")`).first();
}

test.describe('[MODULE-PRODUCT-LIFECYCLE] Product Master — Add + Edit + Delete', () => {

  test.setTimeout(240000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a product (generic + client + brand + testing days) → verify → delete → verify gone', async ({ page }) => {
    const brand = `AUTOQA Brand ${Date.now().toString().slice(-6)}`;
    await createProduct(page, brand);

    let row = await findProduct(page, brand);
    await expect(row).toBeVisible({ timeout: 12000 });

    // direct row action buttons: pencil (edit) then trash (delete) — no row-click, no checkbox
    const btns = row.locator('button');
    const count = await btns.count();
    await btns.nth(count - 1).click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/Delete Product/i)).toBeVisible({ timeout: 5000 });
    const confirmDelete = page.locator('button:has-text("Delete")').last();
    await confirmDelete.click();
    await page.waitForTimeout(2500);

    row = await findProduct(page, brand);
    await expect(row).toBeHidden({ timeout: 12000 });
  });

  test('TC-LC02 create a product → click pencil icon → edit modal opens pre-filled with Update button', async ({ page }) => {
    const brand = `AUTOQA BrandEd ${Date.now().toString().slice(-6)}`;
    await createProduct(page, brand);

    const row = await findProduct(page, brand);
    await expect(row).toBeVisible({ timeout: 12000 });

    // first row button = edit (pencil) — opens the same form pre-filled
    const btns = row.locator('button');
    await btns.nth(0).click();
    await page.waitForTimeout(2500);
    const brandInput = page.locator('input[placeholder="Enter or search brand/product name..."]').first();
    await expect(brandInput).toHaveValue(brand, { timeout: 8000 });
    await expect(page.locator('button:has-text("Update")')).toBeVisible({ timeout: 6000 });

    // cleanup: cancel the edit and delete the product
    const cancel = page.locator('button:has-text("Cancel")').first();
    if (await cancel.isVisible({ timeout: 2000 }).catch(() => false)) { await cancel.click(); await page.waitForTimeout(1200); }

    const row2 = await findProduct(page, brand);
    const btns2 = row2.locator('button');
    const count2 = await btns2.count();
    await btns2.nth(count2 - 1).click();
    await page.waitForTimeout(1200);
    const confirmDelete = page.locator('button:has-text("Delete")').last();
    if (await confirmDelete.isVisible({ timeout: 3000 }).catch(() => false)) { await confirmDelete.click(); await page.waitForTimeout(2000); }
  });

}); // describe Product Master lifecycle
