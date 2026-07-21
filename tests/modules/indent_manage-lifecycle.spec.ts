/**
 * Indent Manage — Full Lifecycle Suite (Add + Reply/Close)  [DESTRUCTIVE]
 * URL  : /dashboard/purchase/indent  (nav: Purchase & Indent → Indent Manage)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * Discovered flow:
 *   • "New Indent" is a 2-part form: header fields (Department pre-filled,
 *     Assigned To*, Priority, PO No, Subject/Heading*) plus a repeatable
 *     "Products/Items" sub-form (Product Type, Instrument ID, Product/Item
 *     Name*, Quantity*, Part No*, CAS No, Company/Make Name*, Remarks) with an
 *     "Add Product" button that appends a row to a table before the whole
 *     indent is submitted via "Generate Indent".
 *   • MOST PRODUCT FIELDS HAVE NO `name`/`placeholder` ATTRIBUTE AT ALL — they
 *     can only be reached positionally (`input, textarea` combined locator,
 *     0-indexed: 7=PO No, 8=Heading, 12=Product/Item Name, 13=Quantity,
 *     14=Part No, 15=CAS No, 17=Remarks/Specification) since there's no
 *     semantic selector to hook onto.
 *   • "ASSIGNED TO" IS A "Type to search..." DROPDOWN WHERE A BARE SINGLE-LETTER
 *     FILTER LIKE "a" CAN LEAVE THE SELECTION EMPTY even though the search box
 *     itself is real and working — search with an actual name fragment (e.g.
 *     "Ajay") instead. This silently fails validation ("Assigned To is
 *     required") with no thrown Playwright error, same trap as Ticket's Category
 *     dropdown.
 *   • THE INDENT NUMBER IN THE LIST IS A `<button>`, NOT AN `<a>` — despite
 *     rendering as a blue underlined link. `row.locator('a')` finds nothing;
 *     use `row.locator('button:has-text("IND#")')`.
 *   • THE DETAIL VIEW ("Indent Details: IND#...") shows Indent Information,
 *     an editable Products/Items table (PO No/Received Date/Invoice No columns
 *     — a note states "PO No will only be saved when 'Close Indent' checkbox is
 *     checked"), a Reply History log, and an "Add Reply" section (Message* +
 *     "Close Indent" checkbox) with "Update & Reply" as the single combined
 *     action — there's no separate "close" button.
 *   • CLOSING AN INDENT REMOVES IT FROM THE DEFAULT LIST VIEW (which appears
 *     scoped to open/pending indents), matching the same pattern as deactivating
 *     an Employee Profile — a plain re-search for the row after closing is not a
 *     reliable success signal. THE DETAIL PANEL ALSO DOES NOT AUTO-CLOSE after a
 *     successful "Update & Reply" — it stays open with the new entry appended to
 *     Reply History, which is what this spec verifies instead.
 *
 * DESTRUCTIVE: creates a real AUTOQA indent with a product line item, replies
 * to it, and closes it. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/indent';
const LAB = 'Arbro - Delhi';

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(1000);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.fill(term);
  await page.waitForTimeout(800);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function pickCombo(page: any, placeholder: string, term: string) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
  await c.click().catch(() => {});
  await c.fill(term);
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"]').filter({ hasText: /\S/ }).first();
    const t = await first.innerText({ timeout: 1000 }).catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(900); return true; }
  }
  return false;
}

async function generateIndent(page: any, subject: string) {
  await page.click('button:has-text("New Indent")');
  await page.waitForTimeout(3000);

  // "a" alone can leave this unset — use a real name fragment
  await pickTypeSearch(page, 'Select an option', 'Ajay');

  const fields = page.locator('input, textarea');
  await fields.nth(8).fill(subject); // Heading
  await fields.nth(12).fill('AUTOQA Test Item'); // Product/Item Name
  await fields.nth(13).fill('2'); // Quantity
  await fields.nth(14).fill('PN-001'); // Part No
  expect(await pickCombo(page, 'Search and select company...', 'a'), 'company option').toBe(true);

  await page.locator('button:has-text("Add Product")').first().click();
  await page.waitForTimeout(1500);

  const genBtn = page.locator('button:has-text("Generate Indent")').first();
  await expect(genBtn).toBeEnabled({ timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(3500);
}

async function findIndentRow(page: any, subject: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(subject);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${subject}")`).first();
}

test.describe('[MODULE-INDENT-MANAGE-LIFECYCLE] Indent Manage — Add + Reply/Close', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 generate an indent with a product line item → verify in list', async ({ page }) => {
    const subject = `AUTOQA Indent ${Date.now().toString().slice(-6)}`;
    await generateIndent(page, subject);

    const row = await findIndentRow(page, subject);
    await expect(row).toBeVisible({ timeout: 12000 });
    await expect(row).toContainText('Ajay Kadyan');
  });

  test('TC-LC02 generate an indent → open detail (button, not link) → reply + Close Indent → Update & Reply', async ({ page }) => {
    const subject = `AUTOQA IndentClose ${Date.now().toString().slice(-6)}`;
    await generateIndent(page, subject);

    const row = await findIndentRow(page, subject);
    await expect(row).toBeVisible({ timeout: 12000 });

    // the IND# cell is a <button>, not an <a>
    await row.locator('button:has-text("IND#")').first().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/Indent Details:/i)).toBeVisible({ timeout: 8000 });

    await page.locator('textarea').last().fill('AUTOQA reply message for indent');
    const closeCheckbox = page.locator('input[type="checkbox"]').last();
    await closeCheckbox.check();
    await page.waitForTimeout(500);

    const updateBtn = page.locator('button:has-text("Update & Reply")').first();
    await expect(updateBtn).toBeEnabled({ timeout: 5000 });
    await updateBtn.click();
    await page.waitForTimeout(3000);

    // the panel stays open after a successful update (it does not auto-close) —
    // the new reply appearing in Reply History is the reliable success signal
    await expect(page.getByText('AUTOQA reply message for indent')).toBeVisible({ timeout: 10000 });
  });

}); // describe Indent Manage lifecycle
