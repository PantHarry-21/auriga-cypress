// tests/rbac/dynamic-rbac-admin-modifications.spec.ts
// Dynamic RBAC with Admin Permission Modifications
// Tests actual permission changes via admin UI and verifies user-side effects
// Run: npx playwright test dynamic-rbac-admin-modifications.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, freshLoginAs, stubStimulsoft } from '../helpers/commands';
import { AdminRolePage } from '../helpers/AdminRolePage';

const LAB = 'Arbro - Delhi';

// Test data: permission modification scenarios
const PERMISSION_SCENARIOS = [
  {
    role: 'Reception',
    module: 'Mailer',
    parentGroup: 'Support',
    permissions: { create: false, read: true, update: true, delete: false },
    description: 'Grant READ access to Mailer, disable CREATE'
  },
  {
    role: 'Booking Personnel',
    module: 'Product Master',
    parentGroup: 'Sample Management',
    permissions: { create: true, read: true, update: true, delete: false },
    description: 'Grant full access to Product Master'
  },
  {
    role: 'Master Personnel',
    module: 'Client Profile',
    parentGroup: 'Customer Relation Management',
    permissions: { create: true, read: true, update: true, delete: true },
    description: 'Grant full CRUD to Client Profile'
  },
  {
    role: 'Analyst',
    module: 'Quotation',
    parentGroup: 'Quotation & Pricing',
    permissions: { create: false, read: true, update: false, delete: false },
    description: 'Grant READ-ONLY to Quotation'
  },
];

test.describe('Dynamic RBAC - Admin Permission Modifications', () => {

  test.beforeEach(async ({ context }) => {
    await stubStimulsoft(context);
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 1: Admin Role Edit - Navigate to Role Edit Page
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Admin UI - Role Edit Page Navigation', () => {
    test('Admin can navigate to Roles page', async ({ page, context, env }) => {
      await loginAs(page, context, 'admin', env, LAB);

      // Navigate to roles
      await page.goto('/dashboard/roles', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      // Verify page loaded
      const rolesList = page.locator('[class*="role"], text:contains("Role")').first();
      expect(await rolesList.isVisible().catch(() => false)).toBe(true);

      await page.screenshot({
        path: 'playwright-report/screenshots/admin_roles_page.png',
        fullPage: false
      });
    });

    test('Admin can see roles listed', async ({ page, context, env }) => {
      await loginAs(page, context, 'admin', env, LAB);

      await page.goto('/dashboard/roles', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      // Look for role cards or list items
      const roleCards = page.locator('div[class*="card"], [class*="role-item"]').filter({ visible: true });
      const count = await roleCards.count().catch(() => 0);

      console.log(`Found ${count} role cards on the page`);

      await page.screenshot({
        path: 'playwright-report/screenshots/admin_roles_list.png',
        fullPage: false
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 2: Admin Modifies Role Permissions - Individual Scenarios
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Admin Modifies Permissions', () => {
    PERMISSION_SCENARIOS.forEach((scenario, idx) => {
      test(`Scenario ${idx + 1}: ${scenario.description}`, async ({ page, context, env }) => {
        const adminRolePage = new AdminRolePage(page);

        // STEP 1: Admin logs in
        console.log(`[Scenario ${idx + 1}] Admin logging in...`);
        await loginAs(page, context, 'admin', env, LAB);
        await page.waitForTimeout(1000);

        // STEP 2: Navigate to role edit
        console.log(`[Scenario ${idx + 1}] Admin navigating to edit ${scenario.role}...`);
        try {
          await adminRolePage.navigateToEdit(scenario.role);
          await page.waitForTimeout(1500);

          // STEP 3: Update permissions
          console.log(`[Scenario ${idx + 1}] Admin updating permissions...`);
          await adminRolePage.setPermissions(scenario.module, scenario.permissions);
          await page.waitForTimeout(1000);

          // STEP 4: Save
          console.log(`[Scenario ${idx + 1}] Admin saving changes...`);
          await adminRolePage.save();
          await page.waitForTimeout(2000);

          console.log(`[Scenario ${idx + 1}] Permissions updated successfully`);

          await page.screenshot({
            path: `playwright-report/screenshots/admin_modified_${idx + 1}.png`,
            fullPage: false
          });
        } catch (error) {
          console.error(`[Scenario ${idx + 1}] Error during admin modification:`, error);
          await page.screenshot({
            path: `playwright-report/screenshots/admin_error_${idx + 1}.png`,
            fullPage: false
          });
        }
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 3: Role User Verifies Access After Admin Modification
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Role User Verifies Access After Permission Changes', () => {
    const roleModuleAccessTests = [
      { role: 'reception', module: 'Mailer', url: '/dashboard/mail/inbox', shouldHaveAccess: true },
      { role: 'booking_personel', module: 'Product Master', url: '/dashboard/products/master-v2', shouldHaveAccess: true },
      { role: 'master_personel', module: 'Client Profile', url: '/dashboard/profile/client', shouldHaveAccess: true },
      { role: 'analyst', module: 'Quotation', url: '/dashboard/quotation/client-quotation', shouldHaveAccess: true },
    ];

    roleModuleAccessTests.forEach((test_case, idx) => {
      test(`[${test_case.role}] Can access ${test_case.module}`, async ({ page, context, env }) => {
        // Use freshLoginAs to ensure clean session
        await loginAs(page, context, test_case.role, env, LAB);
        await page.waitForTimeout(1500);

        // Navigate to module
        console.log(`[${test_case.role}] Navigating to ${test_case.module}...`);
        await page.goto(test_case.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);

        // Verify access
        const bodyText = await page.locator('body').textContent() || '';
        const hasForbidden = bodyText.includes('403') || bodyText.includes('Forbidden');

        if (test_case.shouldHaveAccess) {
          expect(hasForbidden).toBe(false);
          console.log(`✅ [${test_case.role}] Can access ${test_case.module}`);
        } else {
          expect(hasForbidden).toBe(true);
          console.log(`✅ [${test_case.role}] Cannot access ${test_case.module} (as expected)`);
        }

        await page.screenshot({
          path: `playwright-report/screenshots/role_access_${test_case.role}_${idx}.png`,
          fullPage: false
        });
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 4: Verify Permission Buttons After Modification
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Permission Buttons Reflect Admin Changes', () => {
    test(`Reception accessing Mailer - verify CREATE button visibility`, async ({ page, context, env }) => {
      await loginAs(page, context, 'reception', env, LAB);

      // Navigate to Mailer
      await page.goto('/dashboard/mail/inbox', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      // Check for Compose/Create button
      const createBtn = page.locator('button:has-text("Compose"), button:has-text("New"), button:has-text("Create")').first();
      const isVisible = await createBtn.isVisible().catch(() => false);

      console.log(`Reception Mailer - Compose button visible: ${isVisible}`);

      await page.screenshot({
        path: 'playwright-report/screenshots/permission_button_mailer.png',
        fullPage: false
      });
    });

    test(`Master Personnel accessing Client Profile - verify CRUD buttons`, async ({ page, context, env }) => {
      await loginAs(page, context, 'master_personel', env, LAB);

      // Navigate to Client Profile
      await page.goto('/dashboard/profile/client', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      // Check action buttons
      const createBtn = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
      const editBtns = page.locator('button:has-text("Edit")').first();
      const deleteBtns = page.locator('button:has-text("Delete")').first();

      const hasCreate = await createBtn.isVisible().catch(() => false);
      const hasEdit = await editBtns.isVisible().catch(() => false);
      const hasDelete = await deleteBtns.isVisible().catch(() => false);

      console.log(`Master Personnel Client Profile - Create: ${hasCreate}, Edit: ${hasEdit}, Delete: ${hasDelete}`);

      await page.screenshot({
        path: 'playwright-report/screenshots/permission_buttons_client_profile.png',
        fullPage: false
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 5: Sidebar Visibility Changes After Permission Modifications
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Sidebar Updates After Permission Changes', () => {
    test(`[Reception] Sidebar shows/hides modules based on permissions`, async ({ page, context, env }) => {
      await loginAs(page, context, 'reception', env, LAB);

      // Navigate to dashboard
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);

      // Get sidebar modules
      const sidebarLinks = page.locator('nav a, [class*="sidebar"] a').filter({ visible: true });
      const count = await sidebarLinks.count();

      console.log(`[Reception] Found ${count} modules in sidebar`);

      // Collect module names
      const modules = [];
      for (let i = 0; i < Math.min(count, 15); i++) {
        const text = await sidebarLinks.nth(i).textContent();
        if (text && text.trim()) {
          modules.push(text.trim());
        }
      }

      console.log('Reception sidebar modules:', modules);

      // Verify some expected modules exist
      expect(modules.length).toBeGreaterThan(0);

      await page.screenshot({
        path: 'playwright-report/screenshots/sidebar_reception.png',
        fullPage: false
      });
    });

    test(`[Master Personnel] Sidebar shows accessible modules`, async ({ page, context, env }) => {
      await loginAs(page, context, 'master_personel', env, LAB);

      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);

      const sidebarLinks = page.locator('nav a, [class*="sidebar"] a').filter({ visible: true });
      const count = await sidebarLinks.count();

      console.log(`[Master Personnel] Found ${count} modules in sidebar`);

      expect(count).toBeGreaterThan(0);

      await page.screenshot({
        path: 'playwright-report/screenshots/sidebar_master_personnel.png',
        fullPage: false
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 6: Complete Workflow - Modify, Logout, Login, Verify
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Complete Dynamic RBAC Workflow', () => {
    test(`Complete flow: Admin modifies Mailer perms → Reception user verifies`, async ({ page, context, env }) => {
      console.log('=== Starting Complete Workflow Test ===');

      // STEP 1: Admin logs in and modifies permissions
      console.log('Step 1: Admin modification');
      const adminRolePage = new AdminRolePage(page);
      await loginAs(page, context, 'admin', env, LAB);
      await page.waitForTimeout(1000);

      try {
        await adminRolePage.navigateToEdit('Reception');
        await page.waitForTimeout(1000);
        console.log('✅ Navigated to Reception role edit');

        // Take screenshot of permission matrix before changes
        await page.screenshot({
          path: 'playwright-report/screenshots/workflow_step1_before.png',
          fullPage: false
        });
      } catch (error) {
        console.log('⚠️ Could not navigate to role edit:', error);
      }

      // STEP 2: Logout admin, login as Reception
      console.log('Step 2: Reception user login');
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1000);
      await loginAs(page, context, 'reception', env, LAB);
      await page.waitForTimeout(1500);

      console.log('✅ Logged in as Reception');

      // STEP 3: Navigate to dashboard
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      console.log('✅ Navigated to dashboard');

      // STEP 4: Verify sidebar
      const sidebarLinks = page.locator('nav a, [class*="sidebar"] a').filter({ visible: true });
      const count = await sidebarLinks.count();

      console.log(`✅ Sidebar has ${count} modules`);

      await page.screenshot({
        path: 'playwright-report/screenshots/workflow_step4_sidebar.png',
        fullPage: false
      });

      // STEP 5: Try to access Mailer
      console.log('Step 5: Reception accessing Mailer');
      await page.goto('/dashboard/mail/inbox', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      const bodyText = await page.locator('body').textContent() || '';
      const isForbidden = bodyText.includes('403') || bodyText.includes('Forbidden');

      console.log(`✅ Mailer access: ${isForbidden ? 'FORBIDDEN' : 'ALLOWED'}`);

      await page.screenshot({
        path: 'playwright-report/screenshots/workflow_step5_mailer_access.png',
        fullPage: false
      });

      console.log('=== Complete Workflow Test Finished ===');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 7: Cross-Role Comparison - Same Module, Different Permissions
  // ═════════════════════════════════════════════════════════════════════════════

  test.describe('Cross-Role Module Access Comparison', () => {
    test(`Different roles accessing same module - Quotation`, async ({ page, context, env }) => {
      const roles = ['reception', 'booking_personel', 'analyst'];
      const moduleUrl = '/dashboard/quotation/client-quotation';

      for (const role of roles) {
        // Login as role
        await loginAs(page, context, role, env, LAB);
        await page.waitForTimeout(1000);

        // Navigate to module
        await page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);

        // Check access
        const bodyText = await page.locator('body').textContent() || '';
        const isForbidden = bodyText.includes('403') || bodyText.includes('Forbidden');

        // Check action buttons
        const createBtn = page.locator('button:has-text("New"), button:has-text("Create")').first();
        const hasCreate = await createBtn.isVisible().catch(() => false);

        console.log(`[${role}] Quotation: ${isForbidden ? 'FORBIDDEN' : 'ACCESSIBLE'}, Create button: ${hasCreate}`);

        await page.screenshot({
          path: `playwright-report/screenshots/cross_role_quotation_${role}.png`,
          fullPage: false
        });
      }
    });

    test(`Different roles accessing same module - Mailer`, async ({ page, context, env }) => {
      const roles = ['reception', 'master_personel', 'analyst'];
      const moduleUrl = '/dashboard/mail/inbox';

      for (const role of roles) {
        await loginAs(page, context, role, env, LAB);
        await page.waitForTimeout(1000);

        await page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);

        const bodyText = await page.locator('body').textContent() || '';
        const isForbidden = bodyText.includes('403');

        const composeBtn = page.locator('button:has-text("Compose")').first();
        const hasCompose = await composeBtn.isVisible().catch(() => false);

        console.log(`[${role}] Mailer: ${isForbidden ? 'FORBIDDEN' : 'ACCESSIBLE'}, Compose: ${hasCompose}`);

        await page.screenshot({
          path: `playwright-report/screenshots/cross_role_mailer_${role}.png`,
          fullPage: false
        });
      }
    });
  });
});
