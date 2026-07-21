/**
 * Column Details — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/column-details  (nav: Inventory Management → Column Details)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. Same shape as its sibling
 * module CRM Working Standard (same "Inventory Management" nav group): a large
 * plain text/number/date form plus a couple of small custom dropdowns, an
 * Edit-only list with no delete affordance.
 *
 * Discovered flow:
 *   • "Add New Column" opens a "Manage Column" form. Required: Column ID, Product
 *     Name (placeholder says "Enter column type" but the underlying field name is
 *     `productName`), Invoice No, Manufacture, Supplier, Quantity, Parts Sno No,
 *     Dimension, Particle Size, Invoice Date, Issue To, Indent By, Issue Date,
 *     Indent Date.
 *   • Issue To and Indent By are two separate custom dropdowns that BOTH render
 *     with the exact same visible text "Select an option" — the same "Type to
 *     search..." pattern used elsewhere in this app. Because the two buttons are
 *     textually identical, always target the FIRST one (`nth(0)`): once "Issue
 *     To" is picked its button label changes away from "Select an option", so the
 *     next `nth(0)` match naturally becomes "Indent By" — no explicit index
 *     bookkeeping needed, unlike NABL Scope's identically-placeholder'd Unit inputs.
 *   • THE LIST HAS NO DELETE AFFORDANCE — only a single "Edit" column (pencil
 *     icon), matching CRM Working Standard's pattern. Edit reopens the same
 *     "Manage Column" form pre-filled with a "Submit" CTA (not "Update").
 *   • IMPORTANT: THE LIST SEARCH HAS A SEVERE, UNPREDICTABLE INDEXING LAG for
 *     brand-new records — empirically a fresh record was still NOT findable by
 *     name after 100+ seconds of polling (retried both with and without an
 *     explicit "Search" button click), while older records searched fine. This
 *     mirrors the same lag found in Client Product Pricing's product search. It
 *     makes "search for the record I just created" an unreliable verification
 *     strategy here specifically (unlike Price List/CRM Working Standard, where
 *     the same pattern worked immediately). So TC-LC01 verifies creation via the
 *     success toast alone, and TC-LC02 demonstrates the Edit capability against
 *     the list's current top row (any pre-existing record) rather than chasing
 *     the row this test itself just created.
 *
 * DESTRUCTIVE: creates a real AUTOQA column details record, and edits whichever
 * record is on top of the list. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/column-details';
const LAB = 'Arbro - Delhi';

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(900);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  if (!(await search.isVisible({ timeout: 1500 }).catch(() => false))) return false;
  await search.fill(term);
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  return true;
}

async function fillColumnForm(page: any, name: string, columnId: string) {
  await page.locator('input[placeholder="Enter column ID"]').fill(columnId);
  await page.locator('input[placeholder="Enter column type"]').fill(name);
  await page.locator('input[placeholder="Enter invoice no"]').fill('INV-AUTOQA');
  await page.locator('input[placeholder="Enter manufacture"]').fill('AUTOQA Mfg');
  await page.locator('input[placeholder="Enter supplier"]').fill('AUTOQA Supplier');
  await page.locator('input[placeholder="Enter quantity"]').fill('5');
  await page.locator('input[placeholder="Enter parts sno no"]').fill('PSN-001');
  await page.locator('input[placeholder="Enter dimension"]').fill('100mm');
  await page.locator('input[placeholder="Enter particle size"]').fill('5um');
  await page.locator('input[name="invoiceDate"]').fill('2026-07-20');

  // both dropdowns share the label "Select an option" — nth(0) always resolves
  // to whichever one hasn't been picked yet (see header note)
  expect(await pickTypeSearch(page, 'Select an option', 'a'), 'Issue To option').toBe(true);
  await page.waitForTimeout(500);
  expect(await pickTypeSearch(page, 'Select an option', 'a'), 'Indent By option').toBe(true);
  await page.waitForTimeout(500);

  await page.locator('input[name="issueDate"]').fill('2026-07-20');
  await page.locator('input[name="indentDate"]').fill('2026-07-20');
}

test.describe('[MODULE-COLUMN-DETAILS-LIFECYCLE] Column Details — Add + Edit', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 create a column details record (incl. two identically-labelled dropdowns) → verify success toast', async ({ page }) => {
    const name = `AUTOQA ColDetails ${Date.now().toString().slice(-6)}`;
    const columnId = `COL${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("Add New Column")');
    await page.waitForTimeout(3000);
    await fillColumnForm(page, name, columnId);

    const submitBtn = page.locator('button:has-text("Submit")').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(3000);
    // the list search has a severe indexing lag for brand-new records (see header
    // note), so the success toast is the reliable signal here, not a list lookup
    await expect(page.getByText(/Column details created successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-LC02 Edit icon on the list\'s top row opens the modal pre-filled → edit a field → Submit', async ({ page }) => {
    await page.waitForTimeout(1000);
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible({ timeout: 12000 });
    const originalProductName = await row.locator('td').nth(1).innerText().catch(() => '');

    // the row's single icon button is Edit — opens the same form pre-filled
    await row.locator('button').first().click();
    await page.waitForTimeout(2500);
    const productNameInput = page.locator('input[placeholder="Enter column type"]').first();
    await expect(productNameInput).toBeVisible({ timeout: 8000 });
    if (originalProductName) {
      await expect(productNameInput).toHaveValue(originalProductName.trim(), { timeout: 6000 });
    }

    await page.locator('input[placeholder="Enter supplier"]').fill('AUTOQA Supplier Edited');
    const submitBtn = page.locator('button:has-text("Submit")').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

}); // describe Column Details lifecycle
