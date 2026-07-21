/**
 * Method Validation Upload — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/method/validation-upload  (nav: Document Management → Method
 *        Validation Upload — note the URL segment is "validation-upload", NOT
 *        "method-validation-upload" as the nav label would suggest)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * Discovered flow:
 *   • "New Method Validation" — Method Name* (plain text), Client Name* (a
 *     REAL filtering combobox, `[role="option"]`), Report/Protocol No*
 *     (plain text), Method Type* (a genuine native `<select>` — Report /
 *     Protocol, unlike almost every other "dropdown" in this app), Supersedes
 *     No (optional text), Creation date (a real `<input type="date">`,
 *     pre-filled with today and NOT disabled), Effective Date (a real
 *     `<input type="date">` but DISABLED — left blank), Department Name* (a
 *     REAL filtering combobox), Upload Method File* (required, same
 *     PDF/DOC/DOCX/XLS/XLSX/PNG/JPG constraints as Method Upload).
 *   • Unlike Method Upload, there is no Method-ID-uniqueness trap here — Save
 *     succeeds on the first attempt and the panel actually closes.
 *   • Edit (row's single pencil icon) opens "Edit Method Validation Upload"
 *     with the same fields pre-filled plus a read-only file list; the submit
 *     button here is "Update".
 *
 * DESTRUCTIVE: creates a real AUTOQA method validation upload record and
 * edits it. UAT only.
 */
import path from 'path';
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/method/validation-upload';
const LAB = 'Arbro - Delhi';
const DUMMY_FILE = path.join(__dirname, '..', 'fixtures', 'dummy.pdf');

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

async function createMethodValidation(page: any, methodName: string, protocolNo: string) {
  await page.click('button:has-text("New Method Validation")');
  await page.waitForTimeout(2500);

  await page.locator('input[name="methodName"]').fill(methodName);
  expect(await pickCombo(page, 'Search and select client...', 'lab'), 'client option').toBe(true);
  await page.locator('input[name="reportProtocolNo"]').fill(protocolNo);
  await page.locator('select[name="methodType"]').selectOption({ label: 'Report' });
  expect(await pickCombo(page, 'Search and select department...', 'a'), 'department option').toBe(true);
  await page.locator('input[type="file"]').setInputFiles(DUMMY_FILE);
  await page.waitForTimeout(1000);

  const saveBtn = page.locator('button:has-text("SAVE")').first();
  await expect(saveBtn).toBeEnabled({ timeout: 5000 });
  await saveBtn.click();
  await page.waitForTimeout(4000);
}

async function findMethodValidationRow(page: any, methodName: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(methodName);
  await page.waitForTimeout(2500);
  return page.locator('table tbody tr', { hasText: methodName }).first();
}

test.describe('[MODULE-METHOD-VALIDATION-UPLOAD-LIFECYCLE] Method Validation Upload — Add + Edit', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 create a method validation upload → verify in list', async ({ page }) => {
    const methodName = `AUTOQA Method Validation ${Date.now().toString().slice(-6)}`;
    await createMethodValidation(page, methodName, `RPT-AUTOQA-${Date.now().toString().slice(-6)}`);

    const row = await findMethodValidationRow(page, methodName);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 create a method validation upload → Edit icon → change Supersedes No → Update → verify', async ({ page }) => {
    const methodName = `AUTOQA Method Validation Edit ${Date.now().toString().slice(-6)}`;
    await createMethodValidation(page, methodName, `RPT-AUTOQA-${Date.now().toString().slice(-6)}`);

    const row = await findMethodValidationRow(page, methodName);
    await expect(row).toBeVisible({ timeout: 12000 });

    await row.locator('button').first().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText('Edit Method Validation Upload')).toBeVisible({ timeout: 8000 });

    await page.locator('input[name="supersedesNo"]').fill('SUP-AUTOQA-001');
    const updateBtn = page.locator('button:has-text("Update")').first();
    await updateBtn.click();
    await page.waitForTimeout(4000);

    await expect(page.getByText('Edit Method Validation Upload')).toBeHidden({ timeout: 10000 });
  });

}); // describe Method Validation Upload lifecycle
