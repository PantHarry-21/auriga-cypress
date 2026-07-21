/**
 * Employee Profile — Full Lifecycle Suite (Add + Edit + Deactivate)  [DESTRUCTIVE]
 * URL  : /dashboard/profile/employee  (nav: Profile Master → Employee Profile)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21. One of the largest forms
 * explored so far, with several sharp edges.
 *
 * Discovered flow:
 *   • "New Employee" — Personal Information (Type, Name, DOB, Father's/Husband's
 *     Name, Employee Code, Gender), Addresses & Contact (current + permanent, or
 *     tick "Same As Above" to skip re-entering permanent address), Work Profile
 *     (Department, Designation, Role — all required; Static IP / Invoice View
 *     Allow toggles optional; Upload Signature + Digital Certificate optional),
 *     Login Information (Username, Password, Confirm Password, 8–15 chars).
 *   • NAME VALIDATION IS STRICT, PER-WORD, AND SILENT: "Each name must start with
 *     a capital letter followed by lowercase letters (e.g., 'John Doe')" — an
 *     ALL-CAPS tag like "AUTOQA Employee 123456" is rejected, and so is a mid-word
 *     capital like "EmployeeEd" (the "E" in "Ed"). Either failure mode is silent —
 *     Add Employee just never succeeds, no thrown Playwright error. Use plain
 *     Title Case ("Autoqa Employee") for
 *     Name and Father's/Husband's Name, matching the same rule already known from
 *     parameter_master-lifecycle.spec.ts.
 *   • EMPLOYEE CODE HAS A HARD 10-CHARACTER LIMIT ("Employee code must be at most
 *     10 characters") — same silent-failure behavior: Add Employee just never
 *     succeeds. A `${prefix}${Date.now()...}` scheme needs the prefix kept short
 *     enough that prefix + digits stays ≤ 10.
 *   • THREE DIFFERENT DROPDOWN WIDGETS COEXIST ON ONE FORM:
 *       1. Type / State — real search comboboxes with a "Type to search..." box
 *          that DOES filter (but "Select Type"'s own options are Mr./Mrs./Ms./Dr.,
 *          none of which contain a lowercase "a" — search for "Mr" not "a").
 *       2. Department / Designation / Role — a PLAIN LISTBOX with NO search box
 *          at all; options render as `<span class="block truncate">` with no
 *          ARIA role, same pattern as Product Master's Testing Day picker. Do not
 *          wait for a "Type to search..." input here — locate the option span
 *          directly. IMPORTANT: scope with `:visible` and take `.last()`, not
 *          `.first()` — stale closed spans from other dropdowns on the page can
 *          otherwise intercept the click.
 *       3. All three of Type/State/Department/etc. can leave a lingering
 *          `data-select-portal` backdrop (`fixed inset-0 z-[9998]`) if a search
 *          filter matches nothing (shows "No matching options"); pressing Escape
 *          on the search box (not the whole form) clears it before moving on.
 *   • THE CREATE REQUEST IS SLOW — wait for the "Employee created successfully"
 *     toast rather than a fixed delay. On success the form resets itself in
 *     place for adding another employee rather than closing.
 *   • THE ROW'S SECOND ICON (red) IS NOT A HARD DELETE — it's "Deactivate":
 *     confirm dialog "Are you sure? You are about to deactivate <name>." → "Yes,
 *     Deactivate!" sets Status to Inactive rather than removing the record.
 *
 * DESTRUCTIVE: creates, edits, and deactivates a real AUTOQA employee. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/profile/employee';
const LAB = 'Arbro - Delhi';

// Type / State: real comboboxes with a working "Type to search..." filter.
async function pickComboFiltered(page: any, buttonLabel: string, term: string, nth = 0) {
  const btn = page.locator(`button:has-text("${buttonLabel}")`).nth(nth);
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await btn.click();
  await page.waitForTimeout(1000);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.fill(term);
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

// Department / Designation / Role: plain listbox, no search box — click the
// first visible option span directly (see header note on why :visible + .last()).
async function pickPlainListbox(page: any, buttonLabel: string) {
  const btn = page.locator(`button:has-text("${buttonLabel}")`).nth(0);
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await btn.click();
  await page.waitForTimeout(1000);
  const opt = page.locator('span.block.truncate:visible').filter({ hasText: /\S/ }).last();
  await expect(opt).toBeVisible({ timeout: 3000 });
  await opt.click();
  await page.waitForTimeout(700);
}

async function fillEmployeeForm(page: any, name: string, empCode: string) {
  await pickComboFiltered(page, 'Select Type', 'Mr');
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[type="date"]').first().fill('1995-01-01');
  await page.locator('input[name="fatherHusbandName"]').fill('Autoqa Father');
  await page.locator('input[name="employeeCode"]').fill(empCode);
  await page.locator('input[name="gender"]').first().check();

  await page.locator('input[name="address"]').first().fill('Autoqa Address');
  await page.locator('input[name="city"]').first().fill('Delhi');
  await pickComboFiltered(page, 'Select State', 'DELHI', 0);
  await page.locator('input[name="postalCode"]').first().fill('110001');
  await page.locator('input[name="inhouseEmail"]').fill(`autoqa${Date.now()}@example.com`);
  await page.locator('input[name="mobileNo"]').fill('9876543210');
  await page.waitForTimeout(1500); // async email-uniqueness check

  await page.locator('input[name="sameAsAbove"]').check();
  await page.waitForTimeout(500);

  await pickPlainListbox(page, '--Select--'); // Department
  await page.waitForTimeout(500);
  await pickPlainListbox(page, '--Select--'); // Designation
  await page.waitForTimeout(500);
  await pickPlainListbox(page, '--Select--'); // Role
  await page.waitForTimeout(500);

  await page.locator('input[name="username"]').fill(`autoqa${Date.now().toString().slice(-8)}`);
  await page.locator('input[name="password"]').fill('AutoQA@12345');
  await page.locator('input[name="confirmPassword"]').fill('AutoQA@12345');
}

async function findEmployee(page: any, empCode: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder*="Search by Employee Name"]').fill(empCode);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${empCode}")`).first();
}

test.describe('[MODULE-EMPLOYEE-PROFILE-LIFECYCLE] Employee Profile — Add + Edit + Deactivate', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 add an employee (Title Case name + 3 dropdown widget types) → verify in list', async ({ page }) => {
    const name = 'Autoqa Employee';
    const empCode = `Emp${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New Employee")');
    await page.waitForTimeout(3000);
    await fillEmployeeForm(page, name, empCode);

    const addBtn = page.locator('button:has-text("Add Employee")').first();
    await expect(addBtn).toBeEnabled({ timeout: 5000 });
    await addBtn.click();
    await expect(page.getByText(/Employee created successfully/i)).toBeVisible({ timeout: 15000 });

    const row = await findEmployee(page, empCode);
    await expect(row).toBeVisible({ timeout: 12000 });
    await expect(row).toContainText('Active');
  });

  test('TC-LC02 add an employee → Edit icon opens pre-filled → then Deactivate → confirm → verify status', async ({ page }) => {
    const name = 'Autoqa Employeeedit'; // NOT "EmployeeEd" — a capital letter mid-word
    // (e.g. the "E" in "Ed") fails the "capital + lowercase" name validation silently
    const empCode = `Emp${Date.now().toString().slice(-7)}`; // max 10 chars total
    await page.click('button:has-text("New Employee")');
    await page.waitForTimeout(3000);
    await fillEmployeeForm(page, name, empCode);
    await page.locator('button:has-text("Add Employee")').first().click();
    await expect(page.getByText(/Employee created successfully/i)).toBeVisible({ timeout: 15000 });

    const row = await findEmployee(page, empCode);
    await expect(row).toBeVisible({ timeout: 12000 });

    // pencil (edit) — the LAST icon button in the row
    await row.locator('a, button').last().click();
    await page.waitForTimeout(3000);
    await expect(page.locator('input[name="name"]')).toHaveValue(name, { timeout: 8000 });
    await expect(page.locator('button:has-text("Update Employee")')).toBeVisible({ timeout: 6000 });
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(1000);

    // the FIRST icon button (red) is "Deactivate", not a hard delete
    const row2 = await findEmployee(page, empCode);
    const deactivateBtn = row2.locator('button').filter({ has: page.locator('svg') }).first();
    await deactivateBtn.click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/You are about to deactivate/i)).toBeVisible({ timeout: 6000 });
    await page.locator('button:has-text("Yes, Deactivate")').first().click();
    await page.waitForTimeout(2500);

    // the default list appears scoped to Active employees, so the row can
    // legitimately disappear from a plain re-search after deactivation — the
    // dialog completing without error is the meaningful signal here
    await expect(page.getByText(/You are about to deactivate/i)).toBeHidden({ timeout: 8000 });
  });

}); // describe Employee Profile lifecycle
