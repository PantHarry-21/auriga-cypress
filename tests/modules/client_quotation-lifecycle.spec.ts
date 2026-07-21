/**
 * Client Quotation — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/quotation/client  (nav: Quotation & Pricing → Client Quotation)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20.
 *
 * Discovered flow:
 *   • "New Quotation" opens a slide-over with: Select Client (combobox,
 *     id="client-search", min 3 chars), Select Product(s) (multi-select combobox,
 *     tag-style — picking an option keeps the dropdown open with "N selected —
 *     type to add more..."), Quotation Title, Assign To (employee, custom Listbox
 *     with its own "Type to search..." box), Valid Till (prefilled), optional
 *     Contact Name/Mobile/Email, and a Product Type radio (With/Without Product,
 *     defaults to With Product).
 *   • Once a product is picked, a "Product STP Information" table appears BELOW —
 *     one row per STP for that product, each with its own row checkbox. THIS TABLE
 *     LOADS PROGRESSIVELY: ticking "Select All" immediately after picking the
 *     product only catches whatever subset has rendered so far, so you must wait
 *     for the row count to settle before selecting.
 *   • CHECKING ROWS IS NOT ENOUGH — there is a separate, easy-to-miss "+ Add"
 *     button directly under the STP table (a small enabled button; do not confuse
 *     it with the OTHER "Add" button further down for "Other Charges", which stays
 *     disabled until "Other Charge Name" is filled — `button:has-text("Add")`
 *     matches both, so use `.first()`). Clicking it fires a toast "Added N item(s)
 *     to quotation" and moves the checked rows into the real quotation basket.
 *     Skipping this step makes "Generate Quotation" fail with "Please add at least
 *     one STP item" even though the checkboxes all show checked.
 *   • "Generate Quotation" then succeeds with toast "Quotation <no> created
 *     successfully" and the record appears in the list with Status "Open".
 *   • EDIT — the list row has 3 direct icon buttons (pencil / printer / document,
 *     no row-click). The pencil opens the same slide-over pre-filled, with the
 *     footer CTA now reading "Update" instead of "Generate Quotation".
 *
 * DESTRUCTIVE: creates + edits real AUTOQA quotations for a real client (no delete
 * affordance was found for this module — quotations appear to be permanent once
 * generated, matching real business use). UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/quotation/client';
const LAB = 'Arbro - Delhi';
const CLIENT_TERM = 'ALCATEC';

async function pickFirstOption(page: any, locatorInput: any, term: string, retries = 8) {
  await locatorInput.click().catch(() => {});
  await locatorInput.fill(term);
  for (let i = 0; i < retries; i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"], ul[role="listbox"] li, li[class*="cursor"]').first();
    const t = await first.innerText({ timeout: 1000 }).catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(900); return t; }
  }
  return null;
}

async function fillQuotationForm(page: any, title: string) {
  const clientPicked = await pickFirstOption(page, page.locator('#client-search').first(), CLIENT_TERM);
  expect(clientPicked, 'client option').toBeTruthy();

  const productInput = page.locator('input[placeholder="--Select Product(s)--"]').first();
  const productPicked = await pickFirstOption(page, productInput, 'a');
  expect(productPicked, 'product option').toBeTruthy();
  // close the still-open multi-select dropdown with a neutral click (not Escape,
  // which risks closing the whole slide-over on this kind of form elsewhere in the app)
  await page.getByText('Basic Information').first().click().catch(() => {});
  await page.waitForTimeout(500);

  await page.locator('#quotationSubject, input[name="quotationSubject"]').first().fill(title);

  const assignBtn = page.locator('button:has-text("--Select Employee--")').first();
  await assignBtn.click();
  await page.waitForTimeout(1000);
  const empSearch = page.locator('input[placeholder="Type to search..."]').last();
  if (await empSearch.isVisible({ timeout: 1500 }).catch(() => false)) {
    await empSearch.fill('a');
    await page.waitForTimeout(800);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
  }

  // the STP table loads progressively — settle before selecting all
  await page.waitForTimeout(3500);
  const selectAll = page.locator('thead input[type="checkbox"], th input[type="checkbox"]').first();
  await expect(selectAll).toBeVisible({ timeout: 6000 });
  await selectAll.click();
  await page.waitForTimeout(1000);

  // commit the checked rows into the quotation — the FIRST "Add" button (the other
  // one, for Other Charges, stays disabled and would be `.last()`)
  const commitAdd = page.locator('button:has-text("Add")').first();
  await expect(commitAdd).toBeEnabled({ timeout: 5000 });
  await commitAdd.click();
  await page.waitForTimeout(1500);
  await expect(page.getByText(/Added \d+ item\(s\) to quotation/i)).toBeVisible({ timeout: 6000 });
}

async function findQuotation(page: any, title: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder*="Search by quotation"]').first().fill(title);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${title}")`).first();
}

test.describe('[MODULE-CLIENT-QUOTATION-LIFECYCLE] Client Quotation — Add + Edit', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('TC-LC01 create a quotation (client + product + STPs) → Generate → verify in list as Open', async ({ page }) => {
    const title = `AUTOQA Quotation ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Quotation")');
    await page.waitForTimeout(2500);
    await fillQuotationForm(page, title);

    const genBtn = page.locator('button:has-text("Generate Quotation")').first();
    await genBtn.click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 8000 });

    const row = await findQuotation(page, title);
    await expect(row).toBeVisible({ timeout: 12000 });
    await expect(row.locator('td, span').filter({ hasText: 'Open' }).first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-LC02 create a quotation → pencil icon → edit modal opens pre-filled with Update button', async ({ page }) => {
    const title = `AUTOQA QuotationEd ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Quotation")');
    await page.waitForTimeout(2500);
    await fillQuotationForm(page, title);
    await page.locator('button:has-text("Generate Quotation")').first().click();
    await page.waitForTimeout(3000);

    const row = await findQuotation(page, title);
    await expect(row).toBeVisible({ timeout: 12000 });

    // first row button = pencil (edit) — opens the same slide-over pre-filled
    const btns = row.locator('button');
    await btns.nth(0).click();
    await page.waitForTimeout(2500);
    const titleInput = page.locator('#quotationSubject, input[name="quotationSubject"]').first();
    await expect(titleInput).toHaveValue(title, { timeout: 8000 });
    await expect(page.locator('button:has-text("Update")')).toBeVisible({ timeout: 6000 });
  });

}); // describe Client Quotation lifecycle
