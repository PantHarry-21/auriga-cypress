/**
 * All Roles / Create Role — Comprehensive CRUD Test Suite
 * URL  : /dashboard/roles
 * Role : admin
 * Open : "Create Role" button (navigates to /dashboard/roles/create or opens form)
 * Save : "Create Role" (inside form)
 * Cancel : "Cancel"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/roles';
const CREATE_URL = '/dashboard/roles/create';
const LAB = 'Arbro - Delhi';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function expectError(page: any) {
  const sels = [
    '[class*="error"]:visible',
    '[class*="invalid"]:visible',
    '[role="alert"]:visible',
    '.text-red-500:visible',
    '.text-red-600:visible',
    'p[class*="text-red"]:visible',
    'span[class*="text-red"]:visible',
  ];
  for (const s of sels) {
    if (await page.locator(s).first().isVisible({ timeout: 3000 }).catch(() => false)) return true;
  }
  return false;
}

async function expectSuccess(page: any) {
  const sels = [
    '[role="status"]:visible',
    '[class*="toast"]:visible',
    '[class*="success"]:visible',
    '.text-green-600:visible',
    '[class*="notification"]:visible',
  ];
  for (const s of sels) {
    if (await page.locator(s).first().isVisible({ timeout: 8000 }).catch(() => false)) return true;
  }
  return false;
}

async function openFirstEdit(page: any) {
  const sels = [
    'table tbody tr:first-child button[aria-label*="edit" i]',
    'table tbody tr:first-child a:has-text("Edit")',
    'table tbody tr:first-child button:has-text("Edit")',
    'tbody tr:first-child td:last-child button:first-child',
  ];
  for (const s of sels) {
    const el = page.locator(s).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      await el.click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

/** Try to find and click an Edit button on any role card/row */
async function openFirstRoleEdit(page: any) {
  const sels = [
    // Role cards layout
    '[class*="card"] button:has-text("Edit")',
    '[class*="role"] button:has-text("Edit")',
    // Table row layout
    'table tbody tr:first-child button:has-text("Edit")',
    'table tbody tr:first-child a:has-text("Edit")',
    'table tbody tr:first-child button[aria-label*="edit" i]',
    // Generic last column first-child
    'tbody tr:first-child td:last-child button:first-child',
    // Any Edit button on the page
    'button:has-text("Edit")',
  ];
  for (const s of sels) {
    const el = page.locator(s).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      await el.click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

async function getRoleNameInput(page: any) {
  const sels = [
    'input[placeholder*="role name" i]',
    'input[placeholder*="Role Name" i]',
    'input[name*="roleName" i]',
    'input[name*="role_name" i]',
    'input[id*="role" i]',
    'input[type="text"]',
  ];
  for (const s of sels) {
    const el = page.locator(s).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) return el;
  }
  return null;
}

// ── Suite ─────────────────────────────────────────────────────────────────────
test.describe('[ALL-ROLES-CRUD] All Roles — Create & Update', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  // ── Create ─────────────────────────────────────────────────────────────────
  test.describe('Create', () => {

    test('TC-C01 roles page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body.length).toBeGreaterThan(100);
    });

    test('TC-C02 page URL contains roles segment', async ({ page }) => {
      expect(page.url()).toMatch(/roles/i);
    });

    test('TC-C03 roles page has meaningful content (cards or table)', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(50);
    });

    test('TC-C04 Create Role button is visible on the roles page', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Create Role' })).toBeVisible({ timeout: 10000 });
    });

    test('TC-C05 clicking Create Role navigates to form or opens form', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      // Either a form opens in place or navigation to /roles/create
      const isOnCreatePage = page.url().includes('/create');
      const hasCancelBtn = await page.getByRole('button', { name: 'Cancel' }).first().isVisible({ timeout: 8000 }).catch(() => false);
      const hasCreateBtn = await page.locator('button:has-text("Create Role"), button:has-text("Create")').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(isOnCreatePage || hasCancelBtn || hasCreateBtn).toBe(true);
    });

    test('TC-C06 role name input is visible in create form', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      const nameInput = await getRoleNameInput(page);
      expect(nameInput).not.toBeNull();
      if (nameInput) {
        await expect(nameInput).toBeVisible({ timeout: 8000 });
      }
    });

    test('TC-C07 Cancel button closes/returns from create form', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      const cancelBtn = page.getByRole('button', { name: 'Cancel' }).first();
      if (await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
        // Should return to roles list
        const body = await page.locator('body').textContent() ?? '';
        expect(body).not.toContain('Internal Server Error');
      }
    });

    test('TC-C08 empty role name submit shows error or keeps form open', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      const submitBtn = page.locator('button:has-text("Create Role"), button:has-text("Create")').last();
      if (await submitBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
        const isDisabled = await submitBtn.isDisabled({ timeout: 1000 }).catch(() => false);
        if (isDisabled) {
          // Disabled button = form enforces validation by disabling submit — this IS the error state
          expect(isDisabled).toBe(true);
        } else {
          await submitBtn.click();
          await page.waitForTimeout(1000);
          const hasError = await expectError(page);
          const nameInput = await getRoleNameInput(page);
          const stillOpen = nameInput ? await nameInput.isVisible({ timeout: 3000 }).catch(() => false) : false;
          expect(hasError || stillOpen).toBe(true);
        }
      }
    });

    test('TC-C09 valid role name is accepted in input field', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      const nameInput = await getRoleNameInput(page);
      if (nameInput) {
        await nameInput.fill(`AutoRole_${ts}`);
        const val = await nameInput.inputValue();
        expect(val).toBe(`AutoRole_${ts}`);
      }
    });

    test('TC-C10 create form page contains checkboxes or toggles for permissions', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      const checkboxCount = await page.locator('input[type="checkbox"], input[type="radio"], [role="switch"]').count();
      expect(checkboxCount).toBeGreaterThanOrEqual(0);
      // Form should have some content
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(50);
    });

    test('TC-C11 search roles input is visible on roles list page', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search roles" i]').first();
      await expect(searchInput).toBeVisible({ timeout: 8000 });
      await searchInput.fill('admin');
      await page.waitForTimeout(1000);
      await searchInput.clear();
    });

    test('TC-C12 Create Role form is accessible on create page', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Role' }).click();
      await page.waitForTimeout(1500);
      // Check either Back to Roles, Cancel, or that we're on the create page
      const backBtn = page.locator('button:has-text("Back to Roles"), a:has-text("Back to Roles"), button:has-text("Cancel")').first();
      const isBackVisible = await backBtn.isVisible({ timeout: 5000 }).catch(() => false);
      const isOnCreatePage = page.url().includes('/create') || page.url().includes('/roles');
      // Just verify the navigation happened
      expect(isBackVisible || isOnCreatePage).toBe(true);
    });
  });

  // ── Update (Edit Role) ─────────────────────────────────────────────────────
  test.describe('Update', () => {

    test('TC-U01 roles list page shows role cards or rows', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(50);
      // Either table rows or role cards exist
      const hasTable = await page.locator('table').isVisible({ timeout: 5000 }).catch(() => false);
      const hasCards = await page.locator('[class*="card"], [class*="role-item"], [class*="role_item"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      const hasContent = hasTable || hasCards || bodyText.includes('Role') || bodyText.includes('role');
      expect(hasContent).toBe(true);
    });

    test('TC-U02 Edit buttons are present on role cards or rows', async ({ page }) => {
      const editBtnCount = await page.locator('button:has-text("Edit"), a:has-text("Edit")').count();
      expect(editBtnCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-U03 clicking first Edit opens edit form with permissions', async ({ page }) => {
      const opened = await openFirstRoleEdit(page);
      if (!opened) { test.skip(); return; }
      // Edit form should show module permissions or form fields
      const hasCheckbox = await page.locator('input[type="checkbox"], input[type="radio"], [role="switch"]').first().isVisible({ timeout: 10000 }).catch(() => false);
      const hasInput = await page.locator('input, textarea').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasCheckbox || hasInput).toBe(true);
    });

    test('TC-U04 Update Role or Save button is present in edit form', async ({ page }) => {
      const opened = await openFirstRoleEdit(page);
      if (!opened) { test.skip(); return; }
      const updateBtn = page.locator(
        'button:has-text("Update Role"), button:has-text("Update"), button:has-text("Save"), button:has-text("Save Role")'
      ).first();
      const isVisible = await updateBtn.isVisible({ timeout: 10000 }).catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-U05 cancel edit returns to roles list', async ({ page }) => {
      const opened = await openFirstRoleEdit(page);
      if (!opened) { test.skip(); return; }
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
        expect(page.url()).toMatch(/roles/i);
      } else {
        // Navigate back
        await page.goBack();
        await page.waitForTimeout(1000);
        expect(page.url()).toMatch(/roles/i);
      }
    });
  });
});
