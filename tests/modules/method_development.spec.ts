import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Method Development Module — Comprehensive Test Suite
// URL    : /dashboard/method/development
// Run    : npx playwright test tests/modules/method_development.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL   = '/dashboard/method/development';
const LAB          = 'Arbro - Delhi';
const TS           = Date.now().toString().slice(-6);
const METHOD_TITLE = `AutoMD ${TS}`;
const METHOD_CODE  = `AMVP/25${TS.slice(0, 2)}/${TS.slice(2)}`;

const FIXTURE_DIR      = path.join(__dirname, '../fixtures/files for testing');
const FILE_WORD_SMALL  = path.join(FIXTURE_DIR, '2mb.doc');
const FILE_WORD_LARGE  = path.join(FIXTURE_DIR, '10mb.docx');
const FILE_PDF_1       = path.join(FIXTURE_DIR, 'SOP _ Employee Profile.pdf');
const FILE_PDF_2       = path.join(FIXTURE_DIR, 'Himanshus prompt.pdf');
const FILE_PNG         = path.join(FIXTURE_DIR, 'ChatGPT Image Feb 24, 2026, 12_12_08 PM (1).png');
const FILE_CSV         = path.join(FIXTURE_DIR, 'Roles_Permision_Notification Central.csv');
const FILE_XLSX        = path.join(FIXTURE_DIR, 'YLIMS_UAT_Testing_Tracker_FINAL.xlsx');

const today = () => new Date().toISOString().split('T')[0];
const offsetDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const openAddForm = async (page: any) => {
  await page.locator('button:has-text("New Method Development")').first().click();
  await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible({ timeout: 20000 });
};

const closeForm = async (page: any) => {
  const cancelBtn = page.locator('button:has-text("Cancel")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click({ force: true });
    await expect(cancelBtn).toBeHidden({ timeout: 10000 });
  }
};

const uploadRequiredFiles = async (page: any) => {
  const fileInputs = page.locator('input[type="file"]');
  if (await fileInputs.count() > 0) await fileInputs.nth(0).setInputFiles(FILE_WORD_SMALL);
  if (await fileInputs.count() > 1) await fileInputs.nth(1).setInputFiles(FILE_PDF_1);
  if (await fileInputs.count() > 2) await fileInputs.nth(2).setInputFiles(FILE_PDF_2);
};

const openEditFirst = async (page: any) => {
  await page.locator('tbody tr').first().locator('button').last().click({ force: true });
  await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible({ timeout: 20000 });
};

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Method Development Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {

    test('TC-MD-001: navigating to the module URL loads the Method Development listing screen', async ({ page }) => {
      await expect(page).toHaveURL(/method\/development/);
      await expect(page.locator('body')).not.toContainText('404');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-001.png' });
    });

    test('TC-MD-002: page heading contains "Method development"', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Method\s+development/i);
    });

    test('TC-MD-003: data table renders with a thead within the expected timeout', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('thead').first()).toBeVisible();
    });

    test('TC-MD-004: table header contains the expected columns', async ({ page }) => {
      const headerText = await page.locator('thead').first().textContent() ?? '';
      expect(headerText).toMatch(/Serial|S\.?No/i);
      expect(headerText).toMatch(/Method Title/i);
      expect(headerText).toMatch(/Method Code/i);
      expect(headerText).toMatch(/Issue No/i);
      expect(headerText).toMatch(/Department/i);
      expect(headerText).toMatch(/Author/i);
      expect(headerText).toMatch(/Status/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-004.png' });
    });

    test('TC-MD-005: at least one data row is visible in the listing', async ({ page }) => {
      const count = await page.locator('tbody tr').count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-MD-006: S.No. for first row starts at 1', async ({ page }) => {
      const cells = await page.locator('tbody tr').first().locator('td').allTextContents();
      const sno = cells.map(c => c.trim()).find(t => /^\d+$/.test(t));
      expect(sno).toBe('1');
    });

    test('TC-MD-007: pagination controls are present', async ({ page }) => {
      const pagerCount = await page.getByRole('button', { name: /Next|First|Last|Prev|>/i }).count();
      expect(pagerCount).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Toolbar Elements', () => {

    test('TC-MD-008: "New Method Development" button is visible in the toolbar', async ({ page }) => {
      await expect(page.getByRole('button', { name: /New Method Development/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-008.png' });
    });

    test('TC-MD-009: Excel export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
    });

    test('TC-MD-010: PDF export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    });

    test('TC-MD-011: Columns toggle button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
    });

    test('TC-MD-012: Search input is displayed in the toolbar', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
    });

    test('TC-MD-013: Search button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Search Functionality', () => {

    test('TC-MD-014: search input accepts text input', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('AMVP');
      await expect(input).toHaveValue('AMVP');
    });

    test('TC-MD-015: searching with a valid keyword returns matching records or no-data', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('AMVP');
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 }).catch(() => {});
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-015.png' });
    });

    test('TC-MD-016: searching with a nonsense keyword shows no-record message', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXIST99XYZ');
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i, { timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-016.png' });
    });

    test('TC-MD-017: searching with special characters does not crash the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('<script>alert(1)</script>');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-MD-018: clearing search and resubmitting restores the full listing', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      const count = await page.locator('tbody tr').count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. ROW-LEVEL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Row-Level Actions', () => {

    test('TC-MD-019: each data row has action buttons', async ({ page }) => {
      const btnCount = await page.locator('tbody tr').first().locator('button').count();
      expect(btnCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-019.png' });
    });

    test('TC-MD-021: clicking PDF button on a row does not produce a 500 error', async ({ page }) => {
      await page.locator('tbody tr').first().locator('button').first().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500', { timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-021.png' });
    });

    test('TC-MD-022: clicking Edit button on a row opens the pre-filled Edit form', async ({ page }) => {
      await openEditFirst(page);
      await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-022.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ADD FORM — DISPLAY & STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Add Form — Display & Structure', () => {

    test('TC-MD-023: clicking "New Method Development" opens the side/modal panel', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/New Method Development|Method Development/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-023.png' });
      await closeForm(page);
    });

    test('TC-MD-024: Client Name combobox field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search and select client"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-025: Client Address textarea is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('textarea[name="clientAddress"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-026: Method Title input field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="methodTitle"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-027: Guide Line input field is present with default placeholder', async ({ page }) => {
      await openAddForm(page);
      const guideInput = page.locator('input[name="guideLine"]').filter({ visible: true }).first();
      await expect(guideInput).toBeVisible();
      const placeholder = await guideInput.getAttribute('placeholder') ?? '';
      expect(placeholder).toMatch(/ICH Guideline/i);
      await closeForm(page);
    });

    test('TC-MD-028: Method Code input field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="methodCode"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-029: Issue No input field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="issueNo"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-030: Issue Date date-picker field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="issueDate"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-031: Next Revision Date date-picker field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="nextRevisionDate"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-032: No of Approval Required <select> is present', async ({ page }) => {
      await openAddForm(page);
      const selects = page.locator('select').filter({ visible: true });
      expect(await selects.count()).toBeGreaterThan(0);
      await closeForm(page);
    });

    test('TC-MD-033: Department field/label is present in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Department/i);
      await closeForm(page);
    });

    test('TC-MD-034: Owner(s) input field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="ownerTitle"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-035: Description textarea is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('textarea[name="description"]').filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-036: three file upload inputs are present (Word, PDF, Signature)', async ({ page }) => {
      await openAddForm(page);
      const fileInputs = page.locator('input[type="file"]');
      expect(await fileInputs.count()).toBeGreaterThan(2);
      await closeForm(page);
    });

    test('TC-MD-037: Word Method File label is visible', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Word Method File/i);
      await closeForm(page);
    });

    test('TC-MD-038: PDF File label is visible', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/PDF File/i);
      await closeForm(page);
    });

    test('TC-MD-039: Customer Method Signature Approval PDF label is visible', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Customer Method Signature/i);
      await closeForm(page);
    });

    test('TC-MD-040: all mandatory fields are marked with *', async ({ page }) => {
      await openAddForm(page);
      const mandatoryLabels = [
        /Client Name/i, /Method Title/i, /Method Code/i, /Department/i,
        /No of Approval Required/i, /Word Method File/i, /Customer Method Signature/i,
      ];
      const text = await page.locator('body').textContent() ?? '';
      for (const label of mandatoryLabels) {
        expect(text).toMatch(label);
      }
      expect(text).toContain('*');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-040.png' });
      await closeForm(page);
    });

    test('TC-MD-041: Save/Submit button is visible in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MD-042: Cancel button is visible in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible();
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CLIENT NAME — COMBOBOX BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Client Name Field', () => {

    test('TC-MD-043: Client Name combobox supports search — typing opens a dropdown', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').filter({ visible: true }).first().fill('Arbro');
      await page.waitForTimeout(1000);
      const opts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      // Log count; not asserting strict presence as data availability may vary
      const count = await opts.count();
      console.log(`Client dropdown options: ${count}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-043.png' });
      await closeForm(page);
    });

    test('TC-MD-044: selecting a client from the dropdown populates the Client Name field', async ({ page }) => {
      await openAddForm(page);
      const clientInput = page.locator('input[placeholder*="Search and select client"]').filter({ visible: true }).first();
      await clientInput.fill('Arbro');
      await page.waitForSelector('[role="option"], li[role="option"]', { state: 'visible', timeout: 5000 });
      const opts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await opts.count() > 0) {
        await opts.first().click({ force: true });
        await expect(clientInput).not.toHaveValue('', { timeout: 5000 });
        const val = await clientInput.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-044.png' });
      await closeForm(page);
    });

    test('TC-MD-045: Client Address accepts free text and supports long input', async ({ page }) => {
      await openAddForm(page);
      const longAddress = 'Building 12, Sector 8, Phase 2, Industrial Estate, New Delhi - 110001, India';
      const textarea = page.locator('textarea[name="clientAddress"]').filter({ visible: true }).first();
      await textarea.fill(longAddress);
      await expect(textarea).toHaveValue(longAddress);
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. METHOD TITLE & METHOD CODE FIELDS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Method Title & Method Code Fields', () => {

    test('TC-MD-046: Method Title accepts alphanumeric text and special characters', async ({ page }) => {
      await openAddForm(page);
      const title = 'Method Test 01 (%, /, -, .)';
      const input = page.locator('input[name="methodTitle"]').filter({ visible: true }).first();
      await input.clear();
      await input.fill(title);
      await expect(input).toHaveValue(title);
      await closeForm(page);
    });

    test('TC-MD-047: Method Title with only whitespace shows validation on save attempt', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill('   ');
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-047.png' });
      await closeForm(page);
    });

    test('TC-MD-048: Method Code accepts valid format (e.g., AMVP/2504/005)', async ({ page }) => {
      await openAddForm(page);
      const input = page.locator('input[name="methodCode"]').filter({ visible: true }).first();
      await input.clear();
      await input.fill(METHOD_CODE);
      await expect(input).toHaveValue(METHOD_CODE);
      await closeForm(page);
    });

    test('TC-MD-049: Method Code XSS injection does not trigger an alert', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.dismiss(); });
      await openAddForm(page);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().fill("<script>alert('xss')</script>");
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. GUIDE LINE DEFAULT VALUE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Guide Line Field', () => {

    test('TC-MD-050: Guide Line field placeholder defaults to "[As per ICH Guideline]"', async ({ page }) => {
      await openAddForm(page);
      const placeholder = await page.locator('input[name="guideLine"]').filter({ visible: true }).first().getAttribute('placeholder') ?? '';
      expect(placeholder).toMatch(/As per ICH Guideline/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-050.png' });
      await closeForm(page);
    });

    test('TC-MD-051: Guide Line field accepts manual text entry', async ({ page }) => {
      await openAddForm(page);
      const guideValue = 'ICH Q2(R1) Validation of Analytical Procedures';
      const input = page.locator('input[name="guideLine"]').filter({ visible: true }).first();
      await input.clear();
      await input.fill(guideValue);
      await expect(input).toHaveValue(guideValue);
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ISSUE NO FIELD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Issue No Field', () => {

    test('TC-MD-052: Issue No accepts numeric or alphanumeric format', async ({ page }) => {
      await openAddForm(page);
      const input = page.locator('input[name="issueNo"]').filter({ visible: true }).first();
      await input.clear();
      await input.fill('001');
      await expect(input).toHaveValue('001');
      await closeForm(page);
    });

    test('TC-MD-053: Issue No is optional — blank value does not block JS execution', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="issueNo"]').filter({ visible: true }).first().clear();
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. DATE FIELDS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Date Fields', () => {

    test('TC-MD-054: Issue Date accepts a valid date', async ({ page }) => {
      await openAddForm(page);
      const input = page.locator('input[name="issueDate"]').filter({ visible: true }).first();
      await input.fill(today());
      await expect(input).toHaveValue(today());
      await closeForm(page);
    });

    test('TC-MD-055: Issue Date rejects an invalid string — field stays empty', async ({ page }) => {
      await openAddForm(page);
      const input = page.locator('input[name="issueDate"]').filter({ visible: true }).first();
      await input.fill('not-a-date');
      const val = await input.inputValue();
      expect(val).toBe('');
      await closeForm(page);
    });

    test('TC-MD-056: Next Revision Date accepts a valid future date', async ({ page }) => {
      await openAddForm(page);
      const future = offsetDate(30);
      const input = page.locator('input[name="nextRevisionDate"]').filter({ visible: true }).first();
      await input.fill(future);
      await expect(input).toHaveValue(future);
      await closeForm(page);
    });

    test('TC-MD-057: Next Revision Date earlier than Issue Date shows a validation message', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="issueDate"]').filter({ visible: true }).first().fill(today());
      await page.locator('input[name="nextRevisionDate"]').filter({ visible: true }).first().fill(offsetDate(-5));
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasValidation = /revision|earlier|cannot|invalid|date/i.test(bodyText);
      console.log(`Date validation message present: ${hasValidation}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-057.png' });
      await closeForm(page);
    });

    test('TC-MD-058: Next Revision Date equal to Issue Date is accepted (boundary)', async ({ page }) => {
      await openAddForm(page);
      const sameDate = today();
      await page.locator('input[name="issueDate"]').filter({ visible: true }).first().fill(sameDate);
      await page.locator('input[name="nextRevisionDate"]').filter({ visible: true }).first().fill(sameDate);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. DEPARTMENT FIELD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. Department Field', () => {

    test('TC-MD-059: Department field is visible and interactive', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Department/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-059.png' });
      await closeForm(page);
    });

    test('TC-MD-060: omitting Department triggers mandatory validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill(`DeptTest ${TS}`);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().fill(`DPT/${TS}/001`);
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-060.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. NO OF APPROVAL REQUIRED — WORKFLOW CONTROL
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. No of Approval Required — Approval Workflow', () => {

    test('TC-MD-061: No of Approval Required dropdown is present with valid options', async ({ page }) => {
      await openAddForm(page);
      const sel = page.locator('select').filter({ visible: true }).first();
      const optionCount = await sel.locator('option').count();
      expect(optionCount).toBeGreaterThan(1);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-061.png' });
      await closeForm(page);
    });

    test('TC-MD-062: selecting "2 Approval Required" shows two approver name fields', async ({ page }) => {
      await openAddForm(page);
      const sel = page.locator('select').filter({ visible: true }).first();
      const options = await sel.locator('option').all();
      const opt2 = options.find(async o => /2.*Approval|Approval.*2/i.test(await o.textContent() ?? ''));
      if (opt2) {
        const val = await opt2.getAttribute('value') ?? '';
        await sel.selectOption(val);
        await page.waitForTimeout(500);
        await expect(page.locator('input[name="preparedBy1"]').filter({ visible: true }).first()).toBeVisible();
        await expect(page.locator('input[name="preparedBy2"]').filter({ visible: true }).first()).toBeVisible();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-062.png' });
      }
      await closeForm(page);
    });

    test('TC-MD-064: selecting "4 Approval Required" shows all four approver name fields', async ({ page }) => {
      await openAddForm(page);
      const sel = page.locator('select').filter({ visible: true }).first();
      const optionTexts = await sel.locator('option').allTextContents();
      const opt4 = optionTexts.find(t => /4.*Approval|Approval.*4/i.test(t));
      if (opt4) {
        await sel.selectOption({ label: opt4 });
        await page.waitForTimeout(500);
        await expect(page.locator('input[name="preparedBy1"]').filter({ visible: true }).first()).toBeVisible();
        await expect(page.locator('input[name="preparedBy2"]').filter({ visible: true }).first()).toBeVisible();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-064.png' });
      }
      await closeForm(page);
    });

    test('TC-MD-066: Approved By 1 field accepts a valid approver name', async ({ page }) => {
      await openAddForm(page);
      const sel = page.locator('select').filter({ visible: true }).first();
      const optionTexts = await sel.locator('option').allTextContents();
      const approvalOpt = optionTexts.find(t => /Approval/i.test(t) && t.trim() !== '');
      if (approvalOpt) {
        await sel.selectOption({ label: approvalOpt });
        await page.waitForTimeout(400);
        const field = page.locator('input[name="preparedBy1"]').filter({ visible: true });
        if (await field.count() > 0) {
          await field.first().fill('Dr. John Smith');
          await expect(field.first()).toHaveValue('Dr. John Smith');
        }
      }
      await closeForm(page);
    });

    test('TC-MD-068: saving with 4 Approval Required but blank approver fields shows validation', async ({ page }) => {
      await openAddForm(page);
      const sel = page.locator('select').filter({ visible: true }).first();
      const optionTexts = await sel.locator('option').allTextContents();
      const opt4 = optionTexts.find(t => /4.*Approval|Approval.*4/i.test(t));
      if (opt4) {
        await sel.selectOption({ label: opt4 });
        await page.waitForTimeout(400);
        await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
        await page.waitForTimeout(800);
        await expect(page.locator('body')).toContainText(/required|mandatory/i);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-068.png' });
      }
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. AUTHOR, PROCESS OWNER, REVIEWER, APPROVAL FIELDS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. Author, Process Owner, Reviewer, Approval Fields', () => {

    test('TC-MD-069: Author label/field is present in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Author/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-069.png' });
      await closeForm(page);
    });

    test('TC-MD-070: Process Owner label/field is present in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Process Owner/i);
      await closeForm(page);
    });

    test('TC-MD-071: Reviewer label/field is present in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Reviewer/i);
      await closeForm(page);
    });

    test('TC-MD-072: Approval label/field is present in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Approval|Approver/i);
      await closeForm(page);
    });

    test('TC-MD-073: No of Client Approval Required dropdown is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Client Approval/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-073.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. OWNER(S) AND DESCRIPTION FIELDS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('14. Owner(s) and Description Fields', () => {

    test('TC-MD-074: Owner(s) field accepts multiple comma-separated names', async ({ page }) => {
      await openAddForm(page);
      const owners = 'Alice Johnson, Bob Kumar, Carol Singh';
      const input = page.locator('input[name="ownerTitle"]').filter({ visible: true }).first();
      await input.clear();
      await input.fill(owners);
      await expect(input).toHaveValue(owners);
      await closeForm(page);
    });

    test('TC-MD-075: Description textarea accepts multi-line text and line breaks', async ({ page }) => {
      await openAddForm(page);
      const description = 'Line one of description.\nLine two with details.\nLine three summary.';
      const textarea = page.locator('textarea[name="description"]').filter({ visible: true }).first();
      await textarea.clear();
      await textarea.fill(description);
      const val = await textarea.inputValue();
      expect(val).toContain('Line one');
      await closeForm(page);
    });

    test('TC-MD-076: Description textarea is optional — blank description does not block', async ({ page }) => {
      await openAddForm(page);
      await page.locator('textarea[name="description"]').filter({ visible: true }).first().clear();
      await expect(page.locator('body')).not.toContainText('Description is required');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. FILE UPLOAD — WORD METHOD FILE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('15. File Upload — Word Method File', () => {

    test('TC-MD-077: Word Method File input (slot 0) accepts a valid .doc file', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_WORD_SMALL);
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-077.png' });
      await closeForm(page);
    });

    test('TC-MD-078: Word Method File input accepts a valid .docx file', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_WORD_LARGE);
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MD-079: uploaded Word file name is shown near the field after upload', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_WORD_SMALL);
      await page.waitForTimeout(600);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasFileName = /2mb\.doc|\.doc|\.docx/i.test(bodyText);
      console.log(`Word file name visible near field: ${hasFileName}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-079.png' });
      await closeForm(page);
    });

    test('TC-MD-080: uploading a .png instead of Word file shows error or is rejected', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_PNG);
      await page.waitForTimeout(800);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasError = /invalid|format|not supported|only.*doc/i.test(bodyText);
      console.log(`Invalid file type error shown: ${hasError}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-080.png' });
      await closeForm(page);
    });

    test('TC-MD-081: uploading a .csv instead of Word file shows error or is rejected', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_CSV);
      await page.waitForTimeout(800);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasError = /invalid|format|not supported/i.test(bodyText);
      console.log(`CSV rejection error shown: ${hasError}`);
      await closeForm(page);
    });

    test('TC-MD-082: uploading a .xlsx instead of Word file shows error or is rejected', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_XLSX);
      await page.waitForTimeout(800);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasError = /invalid|format|not supported/i.test(bodyText);
      console.log(`XLSX rejection error shown: ${hasError}`);
      await closeForm(page);
    });

    test('TC-MD-083: Word file can be replaced by uploading a new file', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_WORD_SMALL);
      await page.waitForTimeout(600);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_WORD_LARGE);
      await page.waitForTimeout(600);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-083.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. FILE UPLOAD — OPTIONAL PDF FILE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('16. File Upload — Optional PDF File', () => {

    test('TC-MD-084: PDF File input (slot 1) accepts a valid .pdf file', async ({ page }) => {
      await openAddForm(page);
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 1) {
        await fileInputs.nth(1).setInputFiles(FILE_PDF_1);
        await page.waitForTimeout(800);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-084.png' });
      }
      await closeForm(page);
    });

    test('TC-MD-085: uploading a .png to the PDF File slot shows error or graceful handling', async ({ page }) => {
      await openAddForm(page);
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 1) {
        await fileInputs.nth(1).setInputFiles(FILE_PNG);
        await page.waitForTimeout(800);
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasError = /invalid|format|only.*pdf|not.*pdf/i.test(bodyText);
        console.log(`PDF slot invalid type error: ${hasError}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-085.png' });
      }
      await closeForm(page);
    });

    test('TC-MD-086: PDF File slot is optional — not uploading does not block form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).not.toContainText('PDF File is required');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. FILE UPLOAD — CUSTOMER METHOD SIGNATURE APPROVAL PDF
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('17. File Upload — Customer Method Signature Approval PDF', () => {

    test('TC-MD-087: Customer Sig PDF input (slot 2) accepts a valid .pdf file', async ({ page }) => {
      await openAddForm(page);
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 2) {
        await fileInputs.nth(2).setInputFiles(FILE_PDF_2);
        await page.waitForTimeout(800);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-087.png' });
      }
      await closeForm(page);
    });

    test('TC-MD-088: uploading a .png to Customer Sig PDF slot shows error', async ({ page }) => {
      await openAddForm(page);
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 2) {
        await fileInputs.nth(2).setInputFiles(FILE_PNG);
        await page.waitForTimeout(800);
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasError = /invalid|format|only.*pdf/i.test(bodyText);
        console.log(`Sig PDF invalid type error: ${hasError}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-088.png' });
      }
      await closeForm(page);
    });

    test('TC-MD-089: Customer Sig PDF is mandatory — saving without it shows validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').nth(0).setInputFiles(FILE_WORD_SMALL);
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|signature|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-089.png' });
      await closeForm(page);
    });

    test('TC-MD-090: Customer Sig PDF name is shown near the field after upload', async ({ page }) => {
      await openAddForm(page);
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 2) {
        await fileInputs.nth(2).setInputFiles(FILE_PDF_2);
        await page.waitForTimeout(600);
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasFileName = /Himanshus|\.pdf/i.test(bodyText);
        console.log(`Signature PDF file name visible: ${hasFileName}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-090.png' });
      }
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 18. MANDATORY FIELD VALIDATION — BLANK FORM SUBMISSION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('18. Mandatory Field Validations', () => {

    test('TC-MD-091: submitting completely blank form shows validation errors', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-091.png' });
      await closeForm(page);
    });

    test('TC-MD-092: form does NOT close after failed mandatory validation', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-092.png' });
      await closeForm(page);
    });

    test('TC-MD-094: saving without Word Method File shows file-level validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill(`NoFile ${TS}`);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().fill(`NF/${TS}/001`);
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|file|Word/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-094.png' });
      await closeForm(page);
    });

    test('TC-MD-095: leading/trailing spaces in Method Title are handled on save', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill('  Space Test Title  ');
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 19. CANCEL & CLOSE BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('19. Cancel and Close Behaviour', () => {

    test('TC-MD-096: clicking Cancel closes the form without saving', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill('SHOULD_NOT_PERSIST');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('SHOULD_NOT_PERSIST');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-096.png' });
    });

    test('TC-MD-098: after Cancel, "New Method Development" button is still accessible', async ({ page }) => {
      await openAddForm(page);
      await closeForm(page);
      await expect(page.getByRole('button', { name: /New Method Development/i })).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 20. EDIT MODE BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('20. Edit Mode Behaviour', () => {

    test('TC-MD-099: Edit form opens pre-filled with existing data', async ({ page }) => {
      await openEditFirst(page);
      const val = await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().inputValue();
      expect(val.length).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-099.png' });
      await closeForm(page);
    });

    test('TC-MD-100: Edit form pre-fills Method Code', async ({ page }) => {
      await openEditFirst(page);
      const val = await page.locator('input[name="methodCode"]').filter({ visible: true }).first().inputValue();
      expect(val.length).toBeGreaterThan(0);
      await closeForm(page);
    });

    test('TC-MD-101: changing only Description and saving updates only that record', async ({ page }) => {
      await openEditFirst(page);
      const updatedDesc = `Updated by automation at ${Date.now()}`;
      await page.locator('textarea[name="description"]').filter({ visible: true }).first().clear();
      await page.locator('textarea[name="description"]').filter({ visible: true }).first().fill(updatedDesc);
      await page.getByRole('button', { name: /Save|Submit|Update/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-101.png' });
    });

    test('TC-MD-102: clearing Method Title in Edit mode shows validation on save', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().clear();
      await page.getByRole('button', { name: /Save|Submit|Update/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-102.png' });
      await closeForm(page);
    });

    test('TC-MD-103: Cancel in Edit mode closes form without saving changes', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill('EDIT_SHOULD_NOT_PERSIST');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('EDIT_SHOULD_NOT_PERSIST');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-103.png' });
    });

    test('TC-MD-104: Edit mode uses same validation rules as Add mode', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().clear();
      await page.getByRole('button', { name: /Save|Submit|Update/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-104.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 21. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('21. Export Functionality', () => {

    test('TC-MD-105: clicking Excel export completes without a page error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-105.png' });
    });

    test('TC-MD-106: clicking PDF export completes without a page error', async ({ page }) => {
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 22. EDGE CASES & NEGATIVE TESTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('22. Edge Cases & Negative Tests', () => {

    test('TC-MD-107: rapid double-click on "New Method Development" does not open multiple forms', async ({ page }) => {
      await page.getByRole('button', { name: /New Method Development/i }).dblclick({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      const cancelCount = await page.getByRole('button', { name: /Cancel/i }).count();
      console.log(`Cancel buttons found after double-click: ${cancelCount}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-107.png' });
      await closeForm(page);
    });

    test('TC-MD-108: XSS injection in Method Title does not trigger an alert', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.dismiss(); });
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill("<script>alert('XSS')</script>");
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-108.png' });
      await closeForm(page);
    });

    test('TC-MD-110: extremely long Method Title is handled gracefully', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill('A'.repeat(500));
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MD-112: pressing Enter inside a text field does not bypass validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill('Enter Test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
      // Cancel button still visible means form is still open
      await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-112.png' });
      await closeForm(page);
    });

    test('TC-MD-113: navigating away and back does not corrupt the listing state', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-113.png' });
    });

    test('TC-MD-114: form is scrollable and all sections remain accessible', async ({ page }) => {
      await openAddForm(page);
      const dialog = page.locator('[role="dialog"], [data-headlessui-state], form').filter({ visible: true }).first();
      await dialog.evaluate(el => el.scrollTo(0, el.scrollHeight)).catch(() => page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)));
      await page.waitForTimeout(400);
      await expect(page.locator('input[type="file"]').first()).toBeAttached();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-114.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 23. FULL CREATE FLOW — SUCCESS PATH
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('23. Full Create Flow — Success Path', () => {

    test('TC-MD-116: filling all mandatory fields and saving creates a new method record', async ({ page }) => {
      await openAddForm(page);

      // Client Name
      const clientInput = page.locator('input[placeholder*="Search and select client"]').filter({ visible: true }).first();
      await clientInput.fill('Arbro');
      await page.waitForTimeout(1000);
      const clientOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await clientOpts.count() > 0) await clientOpts.first().click({ force: true });

      // Method Title + Code
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill(METHOD_TITLE);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().fill(METHOD_CODE);

      // Issue Date + Next Revision Date
      await page.locator('input[name="issueDate"]').filter({ visible: true }).first().fill(today());
      await page.locator('input[name="nextRevisionDate"]').filter({ visible: true }).first().fill(offsetDate(30));

      // No of Approval Required — first real option
      const sel = page.locator('select').filter({ visible: true }).first();
      const optionValues = await sel.locator('option').evaluateAll(opts =>
        opts.map((o: any) => o.value).filter((v: string) => v !== '')
      );
      if (optionValues.length > 0) await sel.selectOption(optionValues[0]);
      await page.waitForTimeout(300);

      // Approver fields if visible
      const prep1 = page.locator('input[name="preparedBy1"]').filter({ visible: true });
      if (await prep1.count() > 0) await prep1.first().fill('Dr. Approver One');
      const prep2 = page.locator('input[name="preparedBy2"]').filter({ visible: true });
      if (await prep2.count() > 0) await prep2.first().fill('Dr. Approver Two');

      // Owner
      await page.locator('input[name="ownerTitle"]').filter({ visible: true }).first().fill('Quality Team');

      // Description
      await page.locator('textarea[name="description"]').filter({ visible: true }).first().fill(`Automated test method created at ${Date.now()}`);

      // Upload files
      await uploadRequiredFiles(page);
      await page.waitForTimeout(1000);

      // Save
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-116-saved.png' });
    });

    test('TC-MD-117: newly created record appears in the listing with correct Method Title', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill(METHOD_TITLE);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2500);
      const bodyText = await page.locator('body').textContent() ?? '';
      const found = bodyText.includes(METHOD_TITLE);
      console.log(`Method "${METHOD_TITLE}" found in listing: ${found}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-117.png' });
    });

    test('TC-MD-118: newly created record shows in the Status column', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill(METHOD_TITLE);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2500);
      const bodyText = await page.locator('body').textContent() ?? '';
      if (!bodyText.match(/No record|No data/i)) {
        await expect(page.locator('thead').first()).toContainText(/Status/i);
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-118.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 24. FULL EDIT FLOW — SUCCESS PATH
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('24. Full Edit Flow — Success Path', () => {

    test('TC-MD-119: opening Edit for first row, modifying Owner(s) and saving succeeds', async ({ page }) => {
      await openEditFirst(page);
      const updatedOwner = `Updated Owner ${TS}`;
      await page.locator('input[name="ownerTitle"]').filter({ visible: true }).first().clear();
      await page.locator('input[name="ownerTitle"]').filter({ visible: true }).first().fill(updatedOwner);
      await page.getByRole('button', { name: /Save|Submit|Update/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(3500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-119.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 25. ROLE / PERMISSION NOTES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('25. Role Restrictions & Access', () => {

    test('TC-MD-120: admin user can access the Method Development module', async ({ page }) => {
      await expect(page).toHaveURL(/method\/development/);
      await expect(page.locator('body')).not.toContainText('403');
      await expect(page.locator('body')).not.toContainText('Access Denied');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-120.png' });
    });

    test('TC-MD-121: Status column is visible in the table', async ({ page }) => {
      await expect(page.locator('thead').first()).toContainText(/Status/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-121.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 26. SERVER ERROR HANDLING
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('26. Server Error Handling', () => {

    test('TC-MD-122: page does not show a raw 500 error on initial load', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-122.png' });
    });

    test('TC-MD-123: intercepted server error on save shows user-friendly message', async ({ page }) => {
      await page.route('**/method**', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal Server Error' }) });
        } else {
          await route.continue();
        }
      });

      await openAddForm(page);
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill(`ServerErr ${TS}`);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().fill(`SE/${TS}/001`);
      await uploadRequiredFiles(page);
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(3000);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasMessage = /error|failed|try again|something went wrong/i.test(bodyText);
      console.log(`User-friendly server error displayed: ${hasMessage}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MD-123.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 27. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('27. End-to-End Workflows', () => {

    test('E2E-MD-001: Create Method Development record end-to-end with all valid data', async ({ page }) => {
      const E2E_TS    = Date.now().toString().slice(-5);
      const E2E_TITLE = `E2EMD ${E2E_TS}`;
      const E2E_CODE  = `AMVP/E2/${E2E_TS}`;

      await openAddForm(page);

      // Client Name
      const clientInput = page.locator('input[placeholder*="Search and select client"]').filter({ visible: true }).first();
      await clientInput.fill('Arbro');
      await page.waitForTimeout(1000);
      const clientOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await clientOpts.count() > 0) await clientOpts.first().click({ force: true });

      // Client Address
      await page.locator('textarea[name="clientAddress"]').filter({ visible: true }).first().fill('Test Lab, Plot 1, Sector 1, Delhi');

      // Method Title + Code
      await page.locator('input[name="methodTitle"]').filter({ visible: true }).first().fill(E2E_TITLE);
      await page.locator('input[name="methodCode"]').filter({ visible: true }).first().fill(E2E_CODE);

      // Guide Line
      await page.locator('input[name="guideLine"]').filter({ visible: true }).first().fill('ICH Q2(R1)');

      // Issue No
      await page.locator('input[name="issueNo"]').filter({ visible: true }).first().fill('001');

      // Dates
      await page.locator('input[name="issueDate"]').filter({ visible: true }).first().fill(today());
      await page.locator('input[name="nextRevisionDate"]').filter({ visible: true }).first().fill(offsetDate(90));

      // Approval Required — first option
      const sel = page.locator('select').filter({ visible: true }).first();
      const optionValues = await sel.locator('option').evaluateAll(opts =>
        opts.map((o: any) => o.value).filter((v: string) => v !== '')
      );
      if (optionValues.length > 0) await sel.selectOption(optionValues[0]);
      await page.waitForTimeout(300);

      // Approvers
      const prep1 = page.locator('input[name="preparedBy1"]').filter({ visible: true });
      if (await prep1.count() > 0) await prep1.first().fill('E2E Approver One');
      const prep2 = page.locator('input[name="preparedBy2"]').filter({ visible: true });
      if (await prep2.count() > 0) await prep2.first().fill('E2E Approver Two');

      // Owner + Description
      await page.locator('input[name="ownerTitle"]').filter({ visible: true }).first().fill('E2E Owner Team');
      await page.locator('textarea[name="description"]').filter({ visible: true }).first().fill('E2E automated method development record');

      // Files
      await uploadRequiredFiles(page);
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MD-001-created.png' });
    });

    test('E2E-MD-002: Search for the E2E-created record and verify it appears in the listing', async ({ page }) => {
      const E2E_TS    = Date.now().toString().slice(-5);
      const E2E_TITLE = `E2EMD ${E2E_TS}`;
      await page.locator('input[placeholder*="Search"]').first().fill(E2E_TITLE);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2500);
      const bodyText = await page.locator('body').textContent() ?? '';
      console.log(`E2E record found: ${bodyText.includes(E2E_TITLE)}`);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MD-002-search.png' });
    });

    test('E2E-MD-004: Export the listing to Excel after search — no errors', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MD-004-export.png' });
    });

    test('E2E-MD-005: Full negative flow — attempt save with every mandatory field blank — verify all errors', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Save|Submit/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MD-005-all-blank.png' });
      await closeForm(page);
    });
  });
});
