/**
 * Admin Indent Manage — Full Lifecycle Suite (Add + Reply/Close)  [DESTRUCTIVE]
 * URL  : /dashboard/purchase/admin-indent  (nav: Purchase & Indent → Admin Indent Manage)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21. This is an admin-scoped
 * view over the SAME underlying indent data as Indent Manage (records created in
 * indent_manage-lifecycle.spec.ts show up here too) — the "New Indent" form,
 * field layout, and detail/reply modal are structurally identical, just with a
 * few more filter checkboxes present in the DOM ahead of the form fields, which
 * shifts the positional field indices slightly from Indent Manage's.
 *
 * Discovered flow (see indent_manage-lifecycle.spec.ts for the fuller narrative —
 * the same lessons apply here):
 *   • "New Indent" — Department (pre-filled ADMIN), Assigned To* ("Type to
 *     search..." dropdown — use a real name fragment like "Ajay", a bare "a" can
 *     leave it unset), Priority, PO No, Subject/Heading*, then a Products/Items
 *     sub-form (Product/Item Name*, Quantity*, Part No*, CAS No, Company/Make
 *     Name* combobox, Remarks) with "Add Product" appending to a table before
 *     "Generate Indent" submits the whole thing.
 *   • Most product fields have no name/placeholder — reached positionally via
 *     the combined `input, textarea` locator: 20=Heading, 22=Product/Item Name,
 *     23=Quantity, 24=Part No.
 *   • The indent number in the list is a `<button>`, not a link — same as
 *     Indent Manage.
 *   • The detail view ("Indent Details: IND#...") has the same Reply History +
 *     "Add Reply" (Message* + "Close Indent" checkbox) + "Update & Reply" combo
 *     action, and the same panel-stays-open-after-success behavior.
 *
 * DESTRUCTIVE: creates a real AUTOQA indent with a product line item, replies to
 * it, and closes it. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/admin-indent';
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

async function generateAdminIndent(page: any, subject: string) {
  await page.click('button:has-text("New Indent")');
  await page.waitForTimeout(3000);

  await pickTypeSearch(page, 'Select an option', 'Ajay'); // Assigned To
  const fields = page.locator('input, textarea');
  await fields.nth(20).fill(subject); // Heading
  await fields.nth(22).fill('AUTOQA Product'); // Product/Item Name
  await fields.nth(23).fill('2'); // Quantity
  await fields.nth(24).fill('PN-001'); // Part No
  expect(await pickCombo(page, 'Search and select company...', 'a'), 'company option').toBe(true);

  await page.locator('button:has-text("Add Product")').first().click();
  await page.waitForTimeout(1500);

  const genBtn = page.locator('button:has-text("Generate Indent")').first();
  await expect(genBtn).toBeEnabled({ timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(3500);
}

async function findAdminIndentRow(page: any, subject: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(subject);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${subject}")`).first();
}

test.describe('[MODULE-ADMIN-INDENT-MANAGE-LIFECYCLE] Admin Indent Manage — Add + Reply/Close', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 generate an admin indent with a product line item → verify in list', async ({ page }) => {
    const subject = `AUTOQA AdminIndent ${Date.now().toString().slice(-6)}`;
    await generateAdminIndent(page, subject);

    const row = await findAdminIndentRow(page, subject);
    await expect(row).toBeVisible({ timeout: 12000 });
    await expect(row).toContainText('Ajay Kadyan');
  });

  test('TC-LC02 generate an admin indent → open detail → reply + Close Indent → Update & Reply', async ({ page }) => {
    const subject = `AUTOQA AdminIndentClose ${Date.now().toString().slice(-6)}`;
    await generateAdminIndent(page, subject);

    const row = await findAdminIndentRow(page, subject);
    await expect(row).toBeVisible({ timeout: 12000 });

    await row.locator('button:has-text("IND#")').first().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/Indent Details:/i)).toBeVisible({ timeout: 8000 });

    await page.locator('textarea').last().fill('AUTOQA reply message for admin indent');
    const closeCheckbox = page.locator('input[type="checkbox"]').last();
    await closeCheckbox.check();
    await page.waitForTimeout(500);

    const updateBtn = page.locator('button:has-text("Update & Reply")').first();
    await expect(updateBtn).toBeEnabled({ timeout: 5000 });
    await updateBtn.click();
    await page.waitForTimeout(3000);

    // the panel stays open — new reply in Reply History is the success signal
    await expect(page.getByText('AUTOQA reply message for admin indent')).toBeVisible({ timeout: 10000 });
  });

}); // describe Admin Indent Manage lifecycle
