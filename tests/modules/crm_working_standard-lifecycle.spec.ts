/**
 * CRM Working Standard — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/crm-working-standard  (nav: Inventory Management → CRM Working Standard)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. "CRM" here is Certified
 * Reference Material, not customer-relationship-management.
 *
 * Discovered flow:
 *   • "New CRM" opens a large plain form — most fields are ordinary text/number/
 *     date inputs (no comboboxes to poll for most of them). Required: Product
 *     Name, Code No., Version No., Storage Condition, Quantity, LOD / Water
 *     content, Category, Received Date, Issue Date, Issued To, Indent Date.
 *   • Category is a custom dropdown (button "--Select--") using the same "Type to
 *     search..." pattern seen elsewhere (Product Master's Testing Day, NABL
 *     Scope's Year/Type) — options are plain text with no ARIA role, so type the
 *     value and press Enter rather than trying to read/click an option node.
 *   • "Issued To" is the one real combobox (`input[placeholder="Search and select
 *     employee..."]`), standard search-and-poll.
 *   • THE LIST HAS NO DELETE AFFORDANCE ANYWHERE (no delete column, no row
 *     checkbox+bulk-action) — the columns are Download / View / Edit only. This
 *     is a versioned reference-material register: the pencil (Edit) icon reopens
 *     the SAME create form pre-filled, plus a "New Version" button (to roll a new
 *     version rather than mutate history) alongside the regular "Submit" CTA.
 *
 * DESTRUCTIVE: creates + edits a real AUTOQA CRM working standard record. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/crm-working-standard';
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

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(900);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.fill(term);
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function fillCrmForm(page: any, name: string, codeNo: string) {
  await page.locator('input[placeholder="Enter product name"]').fill(name);
  await page.locator('input[placeholder="Enter code no."]').fill(codeNo);
  await page.locator('input[placeholder="Enter version no."]').fill('v1');
  await page.locator('input[placeholder="Enter storage condition"]').fill('Room Temp');
  await page.locator('input[placeholder="Enter quantity"]').fill('10');
  await page.locator('input[placeholder="Enter LOD / Water content"]').fill('5%');

  await pickTypeSearch(page, '--Select--', 'General');

  await page.locator('input[name="receivedDate"]').fill('2026-07-20');
  await page.locator('input[name="issueDate"]').fill('2026-07-20');
  expect(await pickCombo(page, 'Search and select employee...', 'a'), 'issued-to employee option').toBe(true);
  await page.locator('input[name="indentDate"]').fill('2026-07-20');
}

async function findCrm(page: any, name: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder*="Search by product"]').first().fill(name);
  await page.waitForTimeout(2500);
  return page.locator(`table tbody tr:has-text("${name}")`).first();
}

test.describe('[MODULE-CRM-WORKING-STANDARD-LIFECYCLE] CRM Working Standard — Add + Edit', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(4000);
  });

  test('TC-LC01 create a CRM working standard record → verify in list', async ({ page }) => {
    const name = `AUTOQA CRMWS ${Date.now().toString().slice(-6)}`;
    const codeNo = `CODE${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New CRM")');
    await page.waitForTimeout(3000);
    await fillCrmForm(page, name, codeNo);

    const submitBtn = page.locator('button:has-text("Submit")').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(/CRM Working Standard created successfully/i)).toBeVisible({ timeout: 10000 });

    const row = await findCrm(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 create a CRM record → Edit icon → modal opens pre-filled → change storage condition → Submit', async ({ page }) => {
    const name = `AUTOQA CRMWSEd ${Date.now().toString().slice(-6)}`;
    const codeNo = `CODE${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("New CRM")');
    await page.waitForTimeout(3000);
    await fillCrmForm(page, name, codeNo);
    await page.locator('button:has-text("Submit")').first().click();
    await page.waitForTimeout(3000);

    const row = await findCrm(page, name);
    await expect(row).toBeVisible({ timeout: 12000 });

    // the row's single icon button is Edit — reopens the same form pre-filled
    await row.locator('button').first().click();
    await page.waitForTimeout(2500);
    const productNameInput = page.locator('input[placeholder="Enter product name"]').first();
    await expect(productNameInput).toHaveValue(name, { timeout: 8000 });

    await page.locator('input[placeholder="Enter storage condition"]').fill('2-8°C Refrigerated');
    await page.locator('button:has-text("Submit")').first().click();
    await page.waitForTimeout(3000);

    const row2 = await findCrm(page, name);
    await expect(row2).toBeVisible({ timeout: 12000 });
  });

}); // describe CRM Working Standard lifecycle
