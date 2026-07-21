/**
 * Generate PO — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/purchase/generate-po  (nav: Purchase & Indent → Generate PO)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21. BY FAR the most complex and
 * fragile form explored in this whole suite — read the field-order note below
 * carefully, it is the difference between this spec passing and hanging forever.
 *
 * Discovered flow:
 *   • "Generate PO" opens a huge form: Company Name*, Address, Quotation No/Date,
 *     Bank Details, Heading*, Billing & Shipping, Payment, Warranty, Delivery,
 *     Currency*, PO Type, PO Location*, Close PO, GST No* (auto-splits into 6
 *     boxes: state/PAN/entity/blank/Z/checksum), GST State*, Department, PO Date*,
 *     Other Term & Condition — then a "Products/Items" sub-form (Product/Item
 *     Name, Serial No, Part No, Quantity*, Unit, Unit Price*, Tax%, Discount%,
 *     CAS No, HSN, Indent No/Date, Description*, Indent Product) with an "Add"
 *     button that appends to a line-items table, then Assignment (Assigned TO,
 *     Remarks) before the final "Generate PO" submit.
 *   • MOST PRODUCT FIELDS HAVE NO name/placeholder (same trap as Indent Manage) —
 *     reached positionally via the combined `input, textarea` locator: 8=Heading,
 *     16=GSTPrvisionalID, 28=Product/Item Name, 32=Unit Price, 39=Description.
 *   • ⚠️ CRITICAL FIELD-ORDER BUG (the actual reason this form is so hard): if you
 *     select "PO Location" and/or "GST State" BEFORE filling the product line
 *     item and clicking "Add", the Add button silently NO-OPS — the line items
 *     table still says "No line items added yet" even though every field looks
 *     correctly filled and Add threw no error. This is a real app defect: those
 *     two dropdowns' re-render appears to reset the uncommitted product sub-form
 *     state without visually clearing the text you can still see in the inputs.
 *     THE ONLY RELIABLE WORKAROUND: fill Company + Heading, then IMMEDIATELY fill
 *     the product line item and click Add FIRST, and only AFTER that succeeds
 *     fill PO Location / GST State / GST No. Filling them in this order also
 *     sidesteps a separate, harder-to-reproduce issue where those same two
 *     dropdowns can leave a full-screen `data-select-portal` backdrop
 *     (`fixed inset-0 z-[9998]`) open that blocks every subsequent click,
 *     including "Generate PO" itself.
 *   • The row's first icon button is Edit — opens the same form pre-filled with
 *     "Update PO" as the footer CTA (not "Generate PO").
 *
 * DESTRUCTIVE: creates + edits a real AUTOQA Purchase Order. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/generate-po';
const LAB = 'Arbro - Delhi';

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(1000);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.fill(term);
  await page.waitForTimeout(1200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500); // generous settle — see header note on stray overlays
}

async function pickCombo(page: any, placeholder: string, term: string) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
  await c.click().catch(() => {});
  await c.fill(term);
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"]').filter({ hasText: /\S/ }).first();
    const t = await first.innerText({ timeout: 1000 }).catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(1500); return true; }
  }
  return false;
}

async function generatePO(page: any, subject: string) {
  await page.click('button:has-text("Generate PO")');
  await page.waitForTimeout(3000);

  await pickTypeSearch(page, '-- Select Company --', 'test');
  const fields = page.locator('input, textarea');
  await fields.nth(8).fill(subject); // Heading

  // CRITICAL: product line item + Add MUST happen before PO Location/GST State
  // (see header note) — do not reorder this.
  await fields.nth(28).fill('AUTOQA Product');
  expect(await pickCombo(page, 'Search unit...', 'a'), 'unit option').toBe(true);
  await fields.nth(32).fill('100'); // Unit Price
  await fields.nth(39).fill('AUTOQA PO line item description');

  const addBtn = page.locator('button:has-text("Add")').first();
  await addBtn.click();
  await page.waitForTimeout(2000);
  const lineItemsTable = page.locator('table').filter({ has: page.locator('th:has-text("Serial No")') });
  await expect(lineItemsTable.getByText('AUTOQA Product')).toBeVisible({ timeout: 8000 });

  // now safe to touch these dropdowns
  await pickTypeSearch(page, '-- Select PO Location --', 'Baddi');
  await pickTypeSearch(page, '-- Select GST State --', 'Andhra Pradesh');
  await fields.nth(16).fill('22AAAAA0000A1Z5'); // GST No

  const genBtn = page.locator('button:has-text("Generate PO")').last();
  await expect(genBtn).toBeEnabled({ timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(4000);
}

async function findPO(page: any, subject: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(subject);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${subject}")`).first();
}

test.describe('[MODULE-GENERATE-PO-LIFECYCLE] Generate PO — Add + Edit', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 generate a PO (product line item added before PO Location/GST State) → verify in list', async ({ page }) => {
    const subject = `AUTOQA PO ${Date.now().toString().slice(-6)}`;
    await generatePO(page, subject);
    await expect(page.getByText(/Purchase Order .* created successfully/i)).toBeVisible({ timeout: 10000 });

    const row = await findPO(page, subject);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 generate a PO → Edit icon opens pre-filled with Update PO button', async ({ page }) => {
    const subject = `AUTOQA POEd ${Date.now().toString().slice(-6)}`;
    await generatePO(page, subject);
    await expect(page.getByText(/Purchase Order .* created successfully/i)).toBeVisible({ timeout: 10000 });

    const row = await findPO(page, subject);
    await expect(row).toBeVisible({ timeout: 12000 });

    await row.locator('button').first().click();
    await page.waitForTimeout(2500);
    await expect(page.locator('button:has-text("Update PO")')).toBeVisible({ timeout: 8000 });
  });

}); // describe Generate PO lifecycle
