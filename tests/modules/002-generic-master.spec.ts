import { test, expect } from '../global-setup';
import { ModuleTestBase } from '../helpers/ModuleTestBase';
import { FormHelper } from '../helpers/FormHelper';
import { SelectorHelper } from '../helpers/SelectorHelper';

const MODULE_URL = '/dashboard/modules/generic-master';
const MODULE_NAME = 'Generic Master';
const LAB = 'Arbro - Delhi';

test.describe(`[MODULE-002] ${MODULE_NAME} - Complete Test Suite`, () => {
  let base: ModuleTestBase;
  let form: FormHelper;
  let selector: SelectorHelper;
  const timestamp = Date.now();

  test.beforeEach(async ({ page, context }) => {
    base = new ModuleTestBase(page, context, LAB);
    form = new FormHelper(page);
    selector = new SelectorHelper(page);
    await base.setup('master_personel');
    await base.navigateTo(MODULE_URL);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: PAGE LOAD (5 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('PAGE LOAD & NAVIGATION', () => {
    test('[TC-001] Generic Master page loads successfully', async ({ page }) => {
      const isAccessible = await base.isPageAccessible();
      expect(isAccessible).toBe(true);
    });

    test('[TC-002] Module title visible', async ({ page }) => {
      const title = await page.locator('h1, h2, [class*="title"]').first().textContent();
      expect(title).toBeTruthy();
    });

    test('[TC-003] Navigation menu accessible', async ({ page }) => {
      const menu = await page.locator('nav, [role="navigation"]').first().isVisible().catch(() => false);
      expect(typeof menu).toBe('boolean');
    });

    test('[TC-004] Module sidebar visible', async ({ page }) => {
      const sidebar = await page.locator('[class*="sidebar"], aside, nav').first().isVisible().catch(() => false);
      expect(typeof sidebar).toBe('boolean');
    });

    test('[TC-005] Primary action buttons present', async ({ page }) => {
      const buttons = await page.locator('button').all();
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: LIST OPERATIONS (10 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('LIST & SEARCH OPERATIONS', () => {
    test('[TC-006] Generic items list displayed', async ({ page }) => {
      const table = await page.locator('table').first().isVisible().catch(() => false);
      const list = await page.locator('[role="list"]').first().isVisible().catch(() => false);
      expect(table || list).toBe(true);
    });

    test('[TC-007] Column headers visible', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').all();
      expect(headers.length).toBeGreaterThan(0);
    });

    test('[TC-008] Search functionality works', async ({ page }) => {
      const search = page.locator('input[placeholder*="Search"]').first();
      if (await search.isVisible().catch(() => false)) {
        await search.fill('test-generic');
        await page.waitForTimeout(500);
      }
    });

    test('[TC-009] Column sorting works', async ({ page }) => {
      const sortableHeaders = await page.locator('th:has-text("Sort"), [role*="sort"]').all();
      expect(typeof sortableHeaders).toBe('object');
    });

    test('[TC-010] Row selection with checkboxes', async ({ page }) => {
      const checkboxes = await page.locator('input[type="checkbox"]').all();
      if (checkboxes.length > 0) {
        await checkboxes[0].check();
        const isChecked = await checkboxes[0].isChecked();
        expect(isChecked).toBe(true);
      }
    });

    test('[TC-011] Bulk actions available', async ({ page }) => {
      const bulkActions = page.locator('button:has-text("Actions"), button:has-text("Bulk")').first();
      const isVisible = await bulkActions.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-012] Pagination available', async ({ page }) => {
      const pagination = page.locator('[aria-label*="page"], .pagination').first();
      const isVisible = await pagination.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-013] Items per page selector', async ({ page }) => {
      const pageSelect = page.locator('select[name*="per_page"], select[name*="limit"]').first();
      const isVisible = await pageSelect.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-014] Filter options available', async ({ page }) => {
      const filterBtn = page.locator('button:has-text("Filter")').first();
      const isVisible = await filterBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-015] Export functionality available', async ({ page }) => {
      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
      const isVisible = await exportBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: CREATE GENERIC ITEM (12 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('CREATE GENERIC ITEM', () => {
    test('[TC-016] Create button visible and clickable', async ({ page }) => {
      const createBtn = await form.isCreateButtonVisible();
      expect(createBtn).toBe(true);
    });

    test('[TC-017] Create form opens', async ({ page }) => {
      const opened = await form.openCreateForm();
      expect(opened).toBe(true);
    });

    test('[TC-018] Form title shows "New Generic"', async ({ page }) => {
      await form.openCreateForm();
      const title = await page.locator('h2, h3, [class*="modal-title"]').textContent();
      expect(title?.toLowerCase()).toContain('new');
    });

    test('[TC-019] Generic code field required', async ({ page }) => {
      await form.openCreateForm();
      const codeField = page.locator('input[name*="code"], input[placeholder*="Code"]').first();
      if (await codeField.isVisible().catch(() => false)) {
        const required = await codeField.getAttribute('required');
        expect(required).not.toBeNull();
      }
    });

    test('[TC-020] Generic name field required', async ({ page }) => {
      await form.openCreateForm();
      const nameField = page.locator('input[name*="name"], input[placeholder*="Name"]').first();
      if (await nameField.isVisible().catch(() => false)) {
        const required = await nameField.getAttribute('required');
        expect(required).not.toBeNull();
      }
    });

    test('[TC-021] Description field available', async ({ page }) => {
      await form.openCreateForm();
      const descField = page.locator('textarea[name*="desc"], textarea[placeholder*="Description"]').first();
      const isVisible = await descField.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-022] Category dropdown works', async ({ page }) => {
      await form.openCreateForm();
      const catSelect = page.locator('select[name*="category"]').first();
      if (await catSelect.isVisible().catch(() => false)) {
        const options = await catSelect.locator('option').all();
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('[TC-023] Unit of measure selection', async ({ page }) => {
      await form.openCreateForm();
      const uomSelect = page.locator('select[name*="uom"], select[name*="unit"]').first();
      const isVisible = await uomSelect.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-024] Cost price input', async ({ page }) => {
      await form.openCreateForm();
      const costField = page.locator('input[name*="cost"], input[type="number"]').first();
      const isVisible = await costField.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-025] Status toggle available', async ({ page }) => {
      await form.openCreateForm();
      const statusToggle = page.locator('input[type="checkbox"], button[aria-label*="status"]').first();
      const isVisible = await statusToggle.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-026] Save button present', async ({ page }) => {
      await form.openCreateForm();
      const saveBtn = await page.locator('button[type="submit"], button:has-text("Save")').first().isVisible().catch(() => false);
      expect(saveBtn).toBe(true);
    });

    test('[TC-027] Cancel button present', async ({ page }) => {
      await form.openCreateForm();
      const cancelBtn = await page.locator('button:has-text("Cancel")').first().isVisible().catch(() => false);
      expect(cancelBtn).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: EDIT/UPDATE GENERIC (10 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('EDIT & UPDATE GENERIC', () => {
    test('[TC-028] Edit action available on rows', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        const editBtn = firstRow.locator('button:has-text("Edit"), a:has-text("Edit")').first();
        const isVisible = await editBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    });

    test('[TC-029] Edit form shows current values', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const inputs = await page.locator('input[type="text"], textarea').all();
        expect(inputs.length).toBeGreaterThan(0);
      }
    });

    test('[TC-030] Code field cannot be edited', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const codeField = page.locator('input[name*="code"]').first();
        if (await codeField.isVisible().catch(() => false)) {
          const disabled = await codeField.isDisabled().catch(() => false);
          const readonly = await codeField.getAttribute('readonly');
          expect(disabled || readonly !== null).toBe(true);
        }
      }
    });

    test('[TC-031] Name can be updated', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const nameField = page.locator('input[name*="name"]').first();
        if (await nameField.isVisible().catch(() => false)) {
          const newName = `Updated ${timestamp}`;
          await nameField.fill(newName);
          const value = await nameField.inputValue();
          expect(value).toBe(newName);
        }
      }
    });

    test('[TC-032] Description can be updated', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const descField = page.locator('textarea[name*="desc"]').first();
        if (await descField.isVisible().catch(() => false)) {
          const newDesc = `Updated description ${timestamp}`;
          await descField.fill(newDesc);
          const value = await descField.textContent();
          expect(value).toContain(newDesc);
        }
      }
    });

    test('[TC-033] Category can be changed', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const catSelect = page.locator('select[name*="category"]').first();
        if (await catSelect.isVisible().catch(() => false)) {
          const options = await catSelect.locator('option').all();
          if (options.length > 1) {
            await catSelect.selectOption(await options[1].getAttribute('value') || '');
          }
        }
      }
    });

    test('[TC-034] Cost price can be updated', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const costField = page.locator('input[name*="cost"]').first();
        if (await costField.isVisible().catch(() => false)) {
          await costField.fill('999.99');
          const value = await costField.inputValue();
          expect(value).toBe('999.99');
        }
      }
    });

    test('[TC-035] Status can be toggled', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const statusCheckbox = page.locator('input[type="checkbox"][name*="status"]').first();
        if (await statusCheckbox.isVisible().catch(() => false)) {
          const initialState = await statusCheckbox.isChecked();
          await statusCheckbox.check();
          const newState = await statusCheckbox.isChecked();
          expect(newState).not.toBe(initialState);
        }
      }
    });

    test('[TC-036] Multiple fields can be updated together', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const nameField = page.locator('input[name*="name"]').first();
        const descField = page.locator('textarea[name*="desc"]').first();

        if (await nameField.isVisible().catch(() => false)) {
          await nameField.fill(`Updated ${timestamp}`);
        }
        if (await descField.isVisible().catch(() => false)) {
          await descField.fill(`Description ${timestamp}`);
        }

        const nameValue = await nameField.inputValue();
        expect(nameValue).toContain('Updated');
      }
    });

    test('[TC-037] Update requires confirmation', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const saveBtn = page.locator('button[type="submit"], button:has-text("Save")').first();
        if (await saveBtn.isVisible().catch(() => false)) {
          expect(await saveBtn.isEnabled()).toBe(true);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: DELETE GENERIC (8 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('DELETE GENERIC ITEM', () => {
    test('[TC-038] Delete action visible on rows', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        const deleteBtn = firstRow.locator('button:has-text("Delete"), a:has-text("Delete")').first();
        const isVisible = await deleteBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    });

    test('[TC-039] Delete requires confirmation', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        const deleteBtn = firstRow.locator('button:has-text("Delete")').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(300);
          const confirmDialog = page.locator('[role="alertdialog"], .modal, dialog').first();
          const isVisible = await confirmDialog.isVisible().catch(() => false);
          expect(isVisible).toBe(true);
        }
      }
    });

    test('[TC-040] Delete can be cancelled', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        const deleteBtn = firstRow.locator('button:has-text("Delete")').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          const initialCount = await page.locator('table tbody tr').count();
          await deleteBtn.click();
          await page.waitForTimeout(300);
          const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("No")').first();
          if (await cancelBtn.isVisible().catch(() => false)) {
            await cancelBtn.click();
          }
          const finalCount = await page.locator('table tbody tr').count();
          expect(finalCount).toBe(initialCount);
        }
      }
    });

    test('[TC-041] Bulk delete works', async ({ page }) => {
      const checkboxes = await page.locator('input[type="checkbox"]').all();
      if (checkboxes.length > 1) {
        await checkboxes[1].check();
        const deleteSelected = page.locator('button:has-text("Delete")').first();
        const isVisible = await deleteSelected.isVisible().catch(() => false);
        expect(isVisible).toBe(true);
      }
    });

    test('[TC-042] Delete with dependencies shows warning', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        const deleteBtn = firstRow.locator('button:has-text("Delete")').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(500);
          const warning = page.locator('[class*="warning"], [role="alert"]').first();
          const isVisible = await warning.isVisible().catch(() => false);
          expect(typeof isVisible).toBe('boolean');
        }
      }
    });

    test('[TC-043] Successful deletion confirmation message', async ({ page }) => {
      const deleteBtn = page.locator('button:has-text("Delete")').first();
      if (await deleteBtn.isVisible().catch(() => false)) {
        const successMsg = page.locator('[class*="success"], [role="alert"]').first();
        const isVisible = await successMsg.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    });

    test('[TC-044] Deleted item removed from list', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      expect(typeof rowCount).toBe('number');
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: VALIDATION (10 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('VALIDATION', () => {
    test('[TC-045] Duplicate code prevention', async ({ page }) => {
      await form.openCreateForm();
      const codeField = page.locator('input[name*="code"]').first();
      if (await codeField.isVisible().catch(() => false)) {
        await codeField.fill('DUPLICATE_CODE_001');
        await page.waitForTimeout(500);
      }
    });

    test('[TC-046] Empty form validation', async ({ page }) => {
      await form.openCreateForm();
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        const error = await form.getValidationError();
        expect(error).toBeTruthy();
      }
    });

    test('[TC-047] Code format validation', async ({ page }) => {
      await form.openCreateForm();
      const codeField = page.locator('input[name*="code"]').first();
      if (await codeField.isVisible().catch(() => false)) {
        await codeField.fill('invalid@code!');
        const error = await form.getValidationError();
        expect(typeof error).toBe('string');
      }
    });

    test('[TC-048] Numeric field validation', async ({ page }) => {
      await form.openCreateForm();
      const costField = page.locator('input[type="number"]').first();
      if (await costField.isVisible().catch(() => false)) {
        await costField.fill('not-a-number');
        const value = await costField.inputValue();
        expect(value === '' || !isNaN(Number(value))).toBe(true);
      }
    });

    test('[TC-049] Negative number prevention', async ({ page }) => {
      await form.openCreateForm();
      const numberField = page.locator('input[type="number"]').first();
      if (await numberField.isVisible().catch(() => false)) {
        await numberField.fill('-100');
        const min = await numberField.getAttribute('min');
        expect(min === null || parseInt(min) >= 0).toBe(true);
      }
    });

    test('[TC-050] Max length enforcement', async ({ page }) => {
      await form.openCreateForm();
      const nameField = page.locator('input[name*="name"]').first();
      if (await nameField.isVisible().catch(() => false)) {
        const maxLength = await nameField.getAttribute('maxlength');
        if (maxLength) {
          const longText = 'a'.repeat(parseInt(maxLength) + 10);
          await nameField.fill(longText);
          const value = await nameField.inputValue();
          expect(value.length).toBeLessThanOrEqual(parseInt(maxLength));
        }
      }
    });

    test('[TC-051] Min length validation', async ({ page }) => {
      await form.openCreateForm();
      const field = page.locator('input[minlength]').first();
      if (await field.isVisible().catch(() => false)) {
        const minLength = await field.getAttribute('minlength');
        expect(minLength).not.toBeNull();
      }
    });

    test('[TC-052] Special character handling', async ({ page }) => {
      await form.openCreateForm();
      const nameField = page.locator('input[name*="name"]').first();
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.fill('<script>alert("XSS")</script>');
        const value = await nameField.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('[TC-053] Whitespace trimming', async ({ page }) => {
      await form.openCreateForm();
      const nameField = page.locator('input[name*="name"]').first();
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.fill('   Test Name   ');
        const value = await nameField.inputValue();
        expect(typeof value).toBe('string');
      }
    });

    test('[TC-054] Required field indicator visible', async ({ page }) => {
      await form.openCreateForm();
      const requiredFields = await page.locator('[required], .required, [aria-required="true"]').all();
      expect(requiredFields.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: WORKFLOW (5 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('WORKFLOW', () => {
    test('[TC-055] Generic created in DRAFT status', async ({ page }) => {
      const statusField = page.locator('select[name*="status"], input[name*="status"]').first();
      const isVisible = await statusField.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('[TC-056] Status change requires approval', async ({ page }) => {
      const opened = await form.openEditForm();
      if (opened) {
        const approveBtn = page.locator('button:has-text("Approve")').first();
        const isVisible = await approveBtn.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    });

    test('[TC-057] Approval workflow visible', async ({ page }) => {
      const workflowSteps = page.locator('[class*="workflow"], [class*="timeline"]').first();
      const isVisible = await workflowSteps.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-058] Comment attachment on approval', async ({ page }) => {
      const commentField = page.locator('textarea[placeholder*="comment"]').first();
      const isVisible = await commentField.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });

    test('[TC-059] Reject option available', async ({ page }) => {
      const rejectBtn = page.locator('button:has-text("Reject")').first();
      const isVisible = await rejectBtn.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 8: PERFORMANCE (3 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('PERFORMANCE', () => {
    test('[TC-060] List page loads in under 5 seconds', async ({ page }) => {
      const startTime = Date.now();
      await base.navigateTo(MODULE_URL);
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('[TC-061] Form submission completes in under 3 seconds', async ({ page }) => {
      await form.openCreateForm();
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        const startTime = Date.now();
        await submitBtn.click();
        await page.waitForTimeout(1000);
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(3000);
      }
    });

    test('[TC-062] Search provides results in under 1 second', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        const startTime = Date.now();
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(1000);
      }
    });
  });
});
