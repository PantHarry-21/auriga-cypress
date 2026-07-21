/**
 * Equipment Registration — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/equipment/equipment  (nav: Equipment management → Equipment Registration)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * Discovered flow:
 *   • "Equipment Registration" (the toolbar button, same name as the module) opens
 *     a large form: Equipment Name, Equipment ID, Serial No., Make/Supplier Name
 *     (real search combobox), Calibration Date/Due Date, Maintenance Contract
 *     Type, Calibration Type, Equipment Category, Department Head, Department, PM
 *     Date/Next PM Date, Model No, AMC Date Start/End, SOPs — most required.
 *   • THE CUSTOM DROPDOWNS (Maintenance Contract Type, Calibration Type, Equipment
 *     Category, Department Head, Department, SOPs) LOOK LIKE the "Type to
 *     search..." filter-then-Enter pattern from other modules, but THE FILTER
 *     DOES NOT WORK HERE — typing a letter and pressing Enter leaves the
 *     dropdown's own selection unchanged (confirmed: typing "a" doesn't even
 *     narrow the option list). This widget only responds to real keyboard
 *     navigation: click to open, `ArrowDown` (twice, to skip the placeholder
 *     "--Select--" row) then `Enter`. Using the filter-box pattern here silently
 *     leaves the field unset and fails validation ("X is required") with no
 *     thrown Playwright error, since the click/fill/Enter calls all "succeed".
 *   • Maintenance Contract Type and Calibration Type both render as literal
 *     `--- Select ---` (three dashes) while Equipment Category is `--Select--`
 *     (two dashes, no spaces) — distinguishable text, but after the first of the
 *     pair is picked its label changes, so `nth(0)` naturally targets whichever
 *     of the two hasn't been set yet (same "shared placeholder" trick as Column
 *     Details' two "Select an option" dropdowns).
 *   • THE LIST ROW'S ACTION IS A SINGLE KEBAB (⋮) MENU with only "Edit" and
 *     "Report issue" — no Delete. The list is sorted newest-first, so the just-
 *     created row is row 1. THE EDIT MODAL IS SLOW — "Loading equipment
 *     details..." can take several seconds before the form is actually
 *     interactive; a short fixed wait reads as an empty/broken form.
 *
 * DESTRUCTIVE: creates + edits a real AUTOQA equipment record. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/equipment/equipment';
const LAB = 'Arbro - Delhi';

async function pickCombo(page: any, placeholder: string, term: string) {
  const c = page.locator(`input[placeholder="${placeholder}"]`).first();
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

// This widget's "Type to search..." box does NOT actually filter — only real
// keyboard navigation (ArrowDown + Enter) commits a selection. See header note.
async function pickArrowDown(page: any, buttonLabel: string, presses: number) {
  const btn = page.locator(`button:has-text("${buttonLabel}")`).first();
  await btn.click();
  await page.waitForTimeout(800);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.click().catch(() => {});
  for (let i = 0; i < presses; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function fillEquipmentForm(page: any, name: string) {
  await page.locator('input[placeholder="Enter equipment name"]').fill(name);
  await page.locator('input[placeholder="Enter equipment ID"]').fill(`EQID${Date.now().toString().slice(-6)}`);
  await page.locator('input[placeholder="Enter serial number"]').fill(`SN${Date.now().toString().slice(-6)}`);
  expect(await pickCombo(page, 'Search supplier...', 'a'), 'supplier option').toBe(true);

  await page.locator('input[name="calibrationDate"]').fill('2026-01-01');
  await page.locator('input[name="calibrationDueDate"]').fill('2027-01-01');

  await pickArrowDown(page, '--- Select ---', 2); // Maintenance Contract Type
  await page.waitForTimeout(400);
  await pickArrowDown(page, '--- Select ---', 2); // Calibration Type
  await page.waitForTimeout(400);
  await pickArrowDown(page, '--Select--', 2);     // Equipment Category
  await page.waitForTimeout(400);
  await pickArrowDown(page, '--Select Department Head--', 2);
  await page.waitForTimeout(400);
  await pickArrowDown(page, '--Select Department--', 2);
  await page.waitForTimeout(400);

  await page.locator('input[name="pmDate"]').fill('2026-01-01');
  await page.locator('input[name="nextPmDate"]').fill('2026-07-01');
  await page.locator('input[placeholder="Enter model number"]').fill('MODEL-X');
  await page.locator('input[name="amcDateStart"]').fill('2026-01-01');
  await page.locator('input[name="amcDateEnd"]').fill('2026-12-31');
  await pickArrowDown(page, '-- Select SOP --', 2);
  await page.waitForTimeout(400);
}

async function findEquipment(page: any, name: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search equipment name..."]').fill(name);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-EQUIPMENT-REGISTRATION-LIFECYCLE] Equipment Registration — Add + Edit', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(4000);
  });

  test('TC-LC01 register equipment (supplier combo + 5 keyboard-nav dropdowns) → verify in list', async ({ page }) => {
    const name = `AUTOQA Equipment ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("Equipment Registration")');
    await page.waitForTimeout(3000);
    await fillEquipmentForm(page, name);

    const submitBtn = page.locator('button:has-text("Submit")').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(3500);
    await expect(page.getByText(/Equipment registered successfully/i)).toBeVisible({ timeout: 10000 });

    const row = await findEquipment(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 register equipment → kebab menu → Edit (slow-loading modal) opens pre-filled with Update button', async ({ page }) => {
    const name = `AUTOQA EquipmentEd ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("Equipment Registration")');
    await page.waitForTimeout(3000);
    await fillEquipmentForm(page, name);
    await page.locator('button:has-text("Submit")').first().click();
    await page.waitForTimeout(3500);

    const row = await findEquipment(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });

    await row.locator('button[data-menu-button="true"]').click();
    await page.waitForTimeout(800);
    await page.getByText('Edit', { exact: true }).click();
    // the edit modal shows "Loading equipment details..." for several seconds
    // before becoming interactive — wait for the real field, not a fixed delay
    const nameInput = page.locator('input[placeholder="Enter equipment name"]').first();
    await expect(nameInput).toHaveValue(name, { timeout: 15000 });
    await expect(page.locator('button:has-text("Update")')).toBeVisible({ timeout: 6000 });
  });

}); // describe Equipment Registration lifecycle
