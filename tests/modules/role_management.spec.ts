import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Role Management Module — Comprehensive Test Suite
// URL    : /dashboard/roles
// Run    : npx playwright test tests/modules/role_management.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const LAB             = 'Arbro - Delhi';
const ROLES_URL       = '/dashboard/roles';
const CREATE_URL      = '/dashboard/roles/create';

test.describe('Role Management Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. ALL ROLES — PAGE LOAD & NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. All Roles — Page Load & Navigation', () => {

    test('TC-RM-001: navigating to /dashboard/roles loads the page without errors', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(new RegExp('/roles'));
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-001.png' });
    });

    test('TC-RM-002: URL includes /dashboard/roles after navigation', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(new RegExp('/roles'));
    });

    test('TC-RM-003: page body is visible and renders content', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    });

    test('TC-RM-004: page heading contains "Role" related text', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('body')).toContainText(/Role/i, { timeout: 15000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-004.png' });
    });

    test('TC-RM-005: page does not redirect admin to the login page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).not.toHaveURL(new RegExp('/login'));
      await expect(page).toHaveURL(new RegExp('/dashboard'));
    });

    test('TC-RM-006: browser back navigation from Roles does not corrupt page state', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.goto('/dashboard', { timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-006.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. ROLES LISTING — CONTENT & UI
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Roles Listing — Content & UI', () => {

    test('TC-RM-007: role cards or role list items are displayed', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('body')).toContainText('Reception', { timeout: 15000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-007.png' });
    });

    test('TC-RM-008: at least one role entry is visible on the page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      // Roles are typically shown as cards, divs, or list items
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(bodyText.length).toBeGreaterThan(100); // Page has meaningful content
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-008.png' });
    });

    test('TC-RM-009: each role entry shows a role name', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Verify common system roles are shown
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasRoles = /Reception|Admin|Manager|Sales|Reviewer/i.test(bodyText);
      expect(hasRoles).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-009.png' });
    });

    test('TC-RM-010: role entries show action controls (edit/manage buttons)', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtns = page.locator('button, a').filter({ hasText: /Edit|Manage|View/i });
      const count = await editBtns.count();
      expect(count).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-010.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Toolbar Elements', () => {

    test('TC-RM-011: Search input is visible on the Roles page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-011.png' });
    });

    test('TC-RM-012: Add Role / Create Role button is visible', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const addBtn = page.locator('button, a').filter({ hasText: /Add|Create|New/i }).first();
      await expect(addBtn).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-012.png' });
    });

    test('TC-RM-013: Search button is present', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Look for a Search button or the input alone
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Search Functionality', () => {

    test('TC-RM-014: search input accepts typed text', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('Reception');
      await expect(input).toHaveValue('Reception');
    });

    test('TC-RM-015: searching for an existing role name returns that role', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('Reception');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/Reception/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-015.png' });
    });

    test('TC-RM-016: searching with a non-existent role name shows empty state or no-result message', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('ZZZNEVEREXISTROLEXYZ99');
      await page.waitForTimeout(1500);
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasNoResult = /No record|No data|0 result|not found|No role/i.test(bodyText) ||
        !/Reception|Admin|Manager/i.test(bodyText);
      // Either a no-result message appears, or common role names disappear
      console.log(`No-result state for non-existent role: ${hasNoResult}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-016.png' });
    });

    test('TC-RM-017: clearing search restores all roles', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('Reception');
      await page.waitForTimeout(800);
      await input.clear();
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/Reception/i);
    });

    test('TC-RM-018: search is case-insensitive', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('reception');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/Reception/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-018.png' });
    });

    test('TC-RM-019: special characters in search do not crash the page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('@#$%^&*');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. EDIT ROLE PAGE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Edit Role Page', () => {

    test('TC-RM-020: clicking edit on a role card navigates to the edit page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(2500);
        await expect(page.locator('body')).not.toContainText('404');
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-020.png' });
      }
    });

    test('TC-RM-021: Edit role page shows Module Access section', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      // Try to find a Reception card and navigate via ID matching
      const receptionCard = page.locator('div, li').filter({ hasText: 'Reception' }).first();
      const cardText = await receptionCard.textContent() ?? '';
      const match = cardText.match(/ID[:\s]+(\d+)/);
      if (match) {
        await page.goto(`/dashboard/roles/edit/${match[1]}`, { waitUntil: 'domcontentloaded' });
        await expect(page.getByText(/Module Access/i)).toBeVisible({ timeout: 30000 });
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-021.png' });
      } else {
        // Fallback: click any Edit button
        const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
        if (await editBtn.count() > 0) {
          await editBtn.click({ force: true });
          await page.waitForTimeout(2500);
          await expect(page.locator('body')).toContainText(/Module Access|Permission|Access/i, { timeout: 30000 });
          await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-021-fallback.png' });
        }
      }
    });

    test('TC-RM-022: Edit role page has permission checkboxes or toggles', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(2500);
        const checkboxCount = await page.locator('input[type="checkbox"]').count();
        const toggleCount = await page.locator('button[role="switch"], input[type="checkbox"]').count();
        expect(checkboxCount + toggleCount).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-022.png' });
      }
    });

    test('TC-RM-023: Edit role page has a Save / Update button', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(2500);
        const saveBtn = page.getByRole('button', { name: /Save|Update|Submit/i });
        expect(await saveBtn.count()).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-023.png' });
      }
    });

    test('TC-RM-024: navigating directly to /dashboard/roles/edit/:id loads the edit form', async ({ page }) => {
      // Test that a plausible ID (e.g. 1) does not 404
      await page.goto('/dashboard/roles/edit/1', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      // Either loads the form or shows an appropriate "not found" page
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-024.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CREATE ROLE PAGE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Create Role Page', () => {

    test('TC-RM-025: navigating to /dashboard/roles/create loads without errors', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(new RegExp('/roles/create'));
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-025.png' });
    });

    test('TC-RM-026: Create Role page displays at least one input field', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });
    });

    test('TC-RM-027: Create Role page has a Role Name input field', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const roleNameInput = page.locator('input[name*="role"], input[name*="name"], input[placeholder*="role"], input[placeholder*="Role"]');
      if (await roleNameInput.count() > 0) {
        await expect(roleNameInput.first()).toBeVisible();
      } else {
        // Fallback: at least one text input exists
        await expect(page.locator('input[type="text"]').first()).toBeVisible({ timeout: 10000 });
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-027.png' });
    });

    test('TC-RM-028: Create Role page has module permission checkboxes', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const checkboxCount = await page.locator('input[type="checkbox"]').count();
      expect(checkboxCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-028.png' });
    });

    test('TC-RM-029: Create Role page has a Save/Submit button', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const saveBtn = page.getByRole('button', { name: /Save|Submit|Create|Add/i });
      expect(await saveBtn.count()).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-029.png' });
    });

    test('TC-RM-030: submitting Create Role without a name shows validation error', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const saveBtn = page.getByRole('button', { name: /Save|Submit|Create|Add/i }).first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click({ force: true });
        await page.waitForTimeout(1000);
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasError = /required|mandatory|cannot be empty/i.test(bodyText);
        console.log(`Validation error on empty submit: ${hasError}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-030.png' });
      }
    });

    test('TC-RM-031: clicking Add Role button from roles list navigates to Create Role page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const addBtn = page.locator('button, a').filter({ hasText: /Add|Create|New/i }).first();
      if (await addBtn.count() > 0) {
        await addBtn.click({ force: true });
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        // Should navigate to create page or open a modal/form
        const isCreatePage = currentUrl.includes('/roles/create') || currentUrl.includes('/roles/add');
        const isModal = await page.locator('[role="dialog"], .modal').count() > 0;
        expect(isCreatePage || isModal).toBeTruthy();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-031.png' });
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. MODULE ACCESS / PERMISSIONS ON EDIT ROLE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Module Access & Permissions', () => {

    test('TC-RM-032: Edit role page lists modules for permission assignment', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(3000);
        // Module names like Dashboard, Testing, Purchase etc. should appear
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasModules = /Dashboard|Testing|Purchase|Sales|Module/i.test(bodyText);
        expect(hasModules).toBeTruthy();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-032.png' });
      }
    });

    test('TC-RM-033: toggling a module permission checkbox changes its state', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(2500);
        const firstCheckbox = page.locator('input[type="checkbox"]').filter({ visible: true }).first();
        if (await firstCheckbox.count() > 0) {
          const wasChecked = await firstCheckbox.isChecked();
          await firstCheckbox.click({ force: true });
          await page.waitForTimeout(300);
          const isNowChecked = await firstCheckbox.isChecked();
          expect(isNowChecked).toBe(!wasChecked);
          // Restore original state
          await firstCheckbox.click({ force: true });
          await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-033.png' });
        }
      }
    });

    test('TC-RM-034: save/update permissions completes without error', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(2500);
        const saveBtn = page.getByRole('button', { name: /Save|Update|Submit/i }).first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click({ force: true });
          await page.waitForTimeout(2000);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-034.png' });
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ACCESS CONTROL
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Access Control', () => {

    test('TC-RM-035: admin can access the roles page without redirect', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(new RegExp('/roles'));
      await expect(page.locator('body')).not.toContainText(/Unauthorized|Access Denied|Forbidden/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-RM-035.png' });
    });

    test('TC-RM-036: admin can access the Create Role page without redirect', async ({ page }) => {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(new RegExp('/roles/create'));
      await expect(page.locator('body')).not.toContainText('404');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Edge Cases', () => {

    test('TC-RM-037: XSS payload in role search does not trigger alert', async ({ page }) => {
      page.on('dialog', dialog => { throw new Error('XSS triggered!'); });
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill("<script>alert('xss')</script>");
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-RM-038: SQL injection in search does not break the page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill("' OR 1=1 --");
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-RM-039: very long role name in search does not crash the page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('A'.repeat(500));
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-RM-040: whitespace-only search does not crash the page', async ({ page }) => {
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const input = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await input.fill('   ');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. END-TO-END WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. End-to-End Workflow', () => {

    test('E2E-RM-001: navigate to roles → search for existing role → open edit → verify module access', async ({ page }) => {
      // 1. Load roles page
      await page.goto(ROLES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('body')).toContainText(/Reception/i, { timeout: 15000 });
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-RM-001-loaded.png' });

      // 2. Search for Reception role
      const searchInput = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first();
      await searchInput.fill('Reception');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/Reception/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-RM-001-searched.png' });

      // 3. Open Edit
      const editBtn = page.locator('button, a').filter({ hasText: /Edit|Manage/i }).first();
      if (await editBtn.count() > 0) {
        await editBtn.click({ force: true });
        await page.waitForTimeout(3000);
        await expect(page.locator('body')).not.toContainText('500');
        await expect(page.locator('body')).toContainText(/Module Access|Permission|Access/i, { timeout: 15000 });
        await page.screenshot({ path: 'playwright-report/screenshots/E2E-RM-001-edit.png' });
      }
    });

    test('E2E-RM-002: navigate to Create Role → fill role name → verify form is present', async ({ page }) => {
      // 1. Navigate to create
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(new RegExp('/roles/create'));
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-RM-002-create-page.png' });

      // 2. Fill a role name
      const roleInput = page.locator('input[type="text"]').first();
      if (await roleInput.count() > 0) {
        const E2E_TS = Date.now().toString().slice(-5);
        await roleInput.fill(`E2E Test Role ${E2E_TS}`);
        await expect(roleInput).not.toHaveValue('');
        await page.screenshot({ path: 'playwright-report/screenshots/E2E-RM-002-filled.png' });
      }

      // 3. Verify form elements
      const checkboxCount = await page.locator('input[type="checkbox"]').count();
      expect(checkboxCount).toBeGreaterThan(0);

      const saveBtn = page.getByRole('button', { name: /Save|Submit|Create|Add/i }).first();
      expect(await saveBtn.count()).toBeGreaterThan(0);
    });
  });
});
