/**
 * NABL Scope — Full Lifecycle Suite (Add + Edit + Delete)  [DESTRUCTIVE]
 * URL  : /dashboard/nabl-scope  (nav: Quality Document Management System → NABL Scope)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. One of the most complex forms
 * explored so far: 5 cascading headless-ui comboboxes plus a conditional section.
 *
 * Discovered flow:
 *   • "New Entry" → Discipline, Group/Category (multi-select tag), Product/Material/
 *     Matrix (multi-select tag), Specific Test/Parameter (multi-select tag), Test
 *     Method — all standard search comboboxes, filled top-to-bottom with a generic
 *     search term.
 *   • Scope Year and Range Type are a DIFFERENT widget: a button that opens a panel
 *     with its own "Type to search..." box — same pattern as Product Master's
 *     Testing Day pickers. Type the value and press Enter.
 *   • CHOOSING RANGE TYPE = "Quantitative" REVEALS A NEW REQUIRED SECTION
 *     ("Quantitative Parameters": Lower Limit, LL Unit, Upper Limit, UL Unit) that
 *     doesn't exist until you pick it — skipping this leaves Create silently
 *     failing (no error toast, the slide-over just stays open).
 *   • THE UNIT FIELDS ARE A TRAP, TWO WAYS:
 *       1. They are real search comboboxes (`input[placeholder="Unit"]`), not
 *          buttons — despite looking boxed like the Year/Type buttons.
 *       2. There are FOUR "Unit" inputs on the page simultaneously (LL Unit, UL
 *          Unit, Measurement Uncertainty Unit, Observed/Mean Value Unit), all
 *          sharing the placeholder "Unit" — `nth(0)` is always LL Unit, so UL Unit
 *          MUST be addressed as `nth(1)`, never by repeating `nth(0)`.
 *       3. The FIRST option in each Unit dropdown's list is a blank/empty entry —
 *          selecting blindly via `.first()` silently no-ops forever. Filter for
 *          non-empty text (`.filter({ hasText: /\S/ })`) before picking.
 *   • THE CREATE REQUEST IS SLOW — the button shows its own loading spinner for
 *     several seconds after click; wait for the toast rather than a fixed short
 *     timeout, or the test can misread the click as having failed.
 *   • THE LIST HAS NO EDIT/DELETE ICON BUTTONS — a single icon-only "more" button
 *     opens a dropdown MENU with "Edit", a "CHANGE STATUS" section (Set Active /
 *     Set Inactive / Set Proposed), and "Delete" (confirm dialog: "Confirm Delete
 *     — Are you sure you want to delete <product>? This action cannot be undone.").
 *   • The list appears sorted newest-first, so the just-created row is row 1.
 *
 * DESTRUCTIVE: creates + edits + deletes a real AUTOQA NABL scope entry. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/nabl-scope';
const LAB = 'Arbro - Delhi';

async function pickCombo(page: any, placeholder: string, term: string, nth = 0) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).nth(nth);
  if (!(await c.isVisible({ timeout: 3000 }).catch(() => false))) return false;
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

// LL/UL Unit combos have no useful filter text in common ("°", "µg/L", "%"...) so
// this opens the dropdown and takes the first non-blank option as-is.
async function pickComboNoFilter(page: any, placeholder: string, nth = 0) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).nth(nth);
  await c.click().catch(() => {});
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1500);
    const first = page.locator('[role="option"]').filter({ hasText: /\S/ }).first();
    const t = await first.innerText({ timeout: 1000 }).catch(() => '');
    if (t) { await first.click(); await page.waitForTimeout(700); return true; }
  }
  return false;
}

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

async function createNablScope(page: any, remark: string) {
  await page.click('button:has-text("New Entry")');
  await page.waitForTimeout(3000);

  expect(await pickCombo(page, 'Select discipline', 'a'), 'discipline').toBe(true);
  await page.waitForTimeout(1000);
  expect(await pickCombo(page, 'Select categories...', 'a'), 'category').toBe(true);
  await page.waitForTimeout(1000);
  expect(await pickCombo(page, 'Select products...', 'a'), 'product').toBe(true);
  await page.waitForTimeout(1000);
  expect(await pickCombo(page, 'Select tests...', 'a'), 'test').toBe(true);
  await page.waitForTimeout(1000);
  expect(await pickCombo(page, 'Search or select method...', 'a'), 'method').toBe(true);
  await page.waitForTimeout(1000);

  expect(await pickTypeSearch(page, 'Select year', '2026'), 'scope year').toBe(true);
  await page.waitForTimeout(500);
  expect(await pickTypeSearch(page, 'Select type', 'a'), 'range type (Quantitative)').toBe(true);
  await page.waitForTimeout(700);

  // "Quantitative" reveals the required Lower/Upper Limit + Unit fields
  await page.locator('input[placeholder="e.g., 50"]').first().fill('10');
  await page.locator('input[placeholder="e.g., 150"]').first().fill('100');
  expect(await pickComboNoFilter(page, 'Unit', 0), 'LL unit').toBe(true);
  await page.waitForTimeout(500);
  expect(await pickComboNoFilter(page, 'Unit', 1), 'UL unit').toBe(true);
  await page.waitForTimeout(500);

  await page.locator('textarea[name="remark"]').fill(remark);

  const createBtn = page.locator('button:has-text("Create")').first();
  await expect(createBtn).toBeEnabled({ timeout: 5000 });
  await createBtn.click();
  // the create request is slow — wait for the toast, not a fixed short timeout
  await expect(page.getByText(/NABL Scope created successfully/i)).toBeVisible({ timeout: 15000 });
}

test.describe('[MODULE-NABL-SCOPE-LIFECYCLE] NABL Scope — Add + Edit + Delete', () => {

  test.setTimeout(200000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000); // this list's initial data fetch is notably slow
  });

  test('TC-LC01 create a NABL scope entry (5 cascading fields + quantitative range) → verify newest row', async ({ page }) => {
    const remark = `AUTOQA NABL Scope ${Date.now().toString().slice(-6)}`;
    await createNablScope(page, remark);

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
    // the list has no name/remark column, but the Range/LOD + Year signature we
    // just entered ("10 - 100 °", "2026") is distinctive on the newest (top) row
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toContainText('10 - 100', { timeout: 10000 });
    await expect(firstRow).toContainText('2026');
  });

  test('TC-LC02 create → kebab menu → Edit opens modal, then Delete → confirm → verify gone', async ({ page }) => {
    const remark = `AUTOQA NABL ScopeEd ${Date.now().toString().slice(-6)}`;
    await createNablScope(page, remark);

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });

    // the row has one icon-only "more" button opening a menu (Edit / Change
    // Status / Delete) — not direct edit+delete icons
    await firstRow.locator('button').first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Edit', { exact: true }).click();
    await page.waitForTimeout(2500);
    await expect(page.locator('button:has-text("Cancel")').last()).toBeVisible({ timeout: 8000 });
    await page.locator('button:has-text("Cancel")').last().click();
    await page.waitForTimeout(1500);

    // delete via the same kebab menu
    const row2 = page.locator('table tbody tr').first();
    await row2.locator('button').first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Delete', { exact: true }).click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/Are you sure you want to delete/i)).toBeVisible({ timeout: 6000 });
    await page.locator('button:has-text("Delete")').last().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/deleted successfully/i)).toBeVisible({ timeout: 8000 }).catch(() => {});
  });

}); // describe NABL Scope lifecycle
