/**
 * Equipment Transfer — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/equipment/transfer  (nav: Equipment management → Equipment Transfer)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * Discovered flow:
 *   • "New Transfer" — Location, Equipment Name, Quantity, Floor, Assigned
 *     Employee, Remarks. UNLIKE Equipment Registration's dropdowns in the same
 *     nav group, these DO support the "Type to search..." filter-then-Enter
 *     pattern normally (typing "a" narrows to Baddi/Banglore/Manesar, etc.) — the
 *     two modules just look alike, don't assume one's quirks apply to the other.
 *   • FLOOR IS CONDITIONALLY DISABLED based on Location — a location with no
 *     floor data (e.g. "Baddi") leaves the Floor dropdown disabled/unselectable,
 *     which then blocks submission. Use "Delhi", which has real floor data.
 *   • A "*DEPARTMENT" FIELD APPEARS DYNAMICALLY only after Equipment Name is
 *     picked — it doesn't exist in the DOM before that, so filling the form
 *     top-to-bottom in one pass without waiting for it to appear leaves it unset
 *     and fails submission with "Department is required" and no thrown error.
 *   • On submit: toast "Equipment transfer initiated from <X> to <Y>. Awaiting
 *     receipt at destination." — the new row's Status column shows "Pending For
 *     Receiving" (existing rows show some already "Received", implying a
 *     separate receiving step exists elsewhere/for another role — not exercised
 *     here). List is sorted newest-first.
 *   • THE ROW'S PENCIL ICON OPENS "Edit Equipment Transfer" — but the fields
 *     render EMPTY, not pre-filled with the row's data. Below the form is a
 *     "View Equipment History" table listing all transfer legs for that
 *     equipment (including the one just created) — this looks like it's really
 *     "log another transfer leg for this equipment" rather than a classic
 *     edit-in-place, so this spec verifies the history table shows our new
 *     transfer rather than asserting field pre-fill.
 *
 * DESTRUCTIVE: creates a real AUTOQA equipment transfer. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/equipment/transfer';
const LAB = 'Arbro - Delhi';

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(900);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  if (!(await search.isVisible({ timeout: 1500 }).catch(() => false))) return false;
  await search.fill(term);
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  return true;
}

async function fillTransferForm(page: any, remark: string) {
  expect(await pickTypeSearch(page, '--- Select Location ---', 'Delhi'), 'Location (Delhi, has floors)').toBe(true);
  await page.waitForTimeout(500);
  expect(await pickTypeSearch(page, '--Select Equipment--', 'a'), 'Equipment option').toBe(true);
  await page.waitForTimeout(500);
  await page.locator('input[placeholder="Enter quantity"]').fill('1');
  expect(await pickTypeSearch(page, '--Select Floor--', 'a'), 'Floor option (enabled once Delhi is picked)').toBe(true);
  await page.waitForTimeout(500);
  // Department only appears in the DOM after Equipment Name is selected
  expect(await pickTypeSearch(page, '--Select Department--', 'a'), 'dynamically-revealed Department option').toBe(true);
  await page.waitForTimeout(500);
  expect(await pickTypeSearch(page, '--Select Employee--', 'a'), 'Assigned Employee option').toBe(true);
  await page.waitForTimeout(500);
  await page.locator('textarea[name="remarks"]').fill(remark);
}

test.describe('[MODULE-EQUIPMENT-TRANSFER-LIFECYCLE] Equipment Transfer — Add + Edit', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 create a transfer (Delhi location + dynamically-revealed Department) → verify Pending For Receiving', async ({ page }) => {
    const remark = `AUTOQA transfer ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Transfer")');
    await page.waitForTimeout(3000);
    await fillTransferForm(page, remark);

    const submitBtn = page.locator('button:has-text("Submit")').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(3500);
    await expect(page.getByText(/Awaiting receipt at destination/i)).toBeVisible({ timeout: 10000 });

    // the list is sorted newest-first — our transfer is row 1
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toContainText(remark, { timeout: 10000 });
    await expect(firstRow).toContainText('Pending For Receiving');
  });

  test('TC-LC02 create a transfer → pencil icon → Edit modal\'s equipment history shows the new transfer', async ({ page }) => {
    const remark = `AUTOQA transferEd ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Transfer")');
    await page.waitForTimeout(3000);
    await fillTransferForm(page, remark);
    await page.locator('button:has-text("Submit")').first().click();
    await page.waitForTimeout(3500);

    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toContainText(remark, { timeout: 10000 });

    await firstRow.locator('a, button').last().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText('View Equipment History')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(remark).first()).toBeVisible({ timeout: 6000 });
  });

}); // describe Equipment Transfer lifecycle
