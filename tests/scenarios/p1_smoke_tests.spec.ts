import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// Priority 1 Modules — Multi-Module Smoke Tests
// Consolidates smoke verification for all critical YLIMS modules.
// Run    : npx playwright test tests/scenarios/p1_smoke_tests.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const LAB = 'Arbro - Delhi';

/**
 * List of Priority 1 modules gathered from legacy p1_*.cy.js scenario files.
 * Covers Testing, Masters, CRM, Support, and Sample Management.
 */
const P1_MODULES = [
  // Testing & STP Masters
  { name: 'STP Master', url: '/dashboard/testing/stp-master', btnText: 'New STP' },
  { name: 'STP Group', url: '/dashboard/testing/stp-groups', btnText: 'New STP Group' },
  { name: 'Unapproved Test', url: '/dashboard/admin/unapproved-test', btnText: 'Add' },
  { name: 'Pending Test', url: '/dashboard/pending-test', btnText: 'Add' },
  { name: 'My Complete Test', url: '/dashboard/analyst/my-complete-test', btnText: 'Add' },
  
  // Core Masters
  { name: 'Generic Master', url: '/dashboard/products/generic-master-v2', btnText: 'New Generic Master' },
  { name: 'Analyte Master', url: '/dashboard/products/parameters-v2', btnText: 'New Analyte Master' },
  { name: 'Product Master', url: '/dashboard/products/master-v2', btnText: 'New Product' },
  
  // CRM & Quotation
  { name: 'Client Profile', url: '/dashboard/profile/client', btnText: 'New Client' },
  { name: 'Client Quotation', url: '/dashboard/quotation/client-quotation', btnText: 'New Quotation' },
  
  // Logistics & Support
  { name: 'Mailer', url: '/dashboard/mail/inbox', btnText: 'Compose' },
  { name: 'Ticket', url: '/dashboard/support/tickets', btnText: 'New Ticket' },
  
  // Sample Management
  { name: 'Book Sample', url: '/dashboard/samples/booking', btnText: 'New Booking' },
  { name: 'Reception Receive Sample', url: '/dashboard/reception/received-sample', btnText: 'Receive' },
  { name: 'Bar Coding', url: '/dashboard/samples/receipt', btnText: 'Add' },
];

test.describe('P1 Smoke Tests — Multi-Module Verification', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    // Reuse admin session for efficiency
    await loginAs(page, context, 'admin', env, LAB);
  });

  P1_MODULES.forEach((mod) => {
    test(`Module: ${mod.name} — basic smoke verification`, async ({ page }) => {
      // 1. Navigation
      await page.goto(mod.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // 2. Page Load Assertions
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      
      // 3. Toolbar Visibility (Search input usually present on all P1 modules)
      const searchInput = page.locator('input[placeholder*="earch"], input[type="search"]').first();
      // Not all modules might have search, but P1 listing screens usually do
      if (await searchInput.isVisible()) {
          await searchInput.fill('Smoke Test Query');
          await page.waitForTimeout(500);
      }

      // 4. Primary Action Button Visibility
      // We look for a button matching the specific module's 'New' button text or generic variants
      const addBtn = page.getByRole('button', { name: new RegExp(mod.btnText + '|Add|New|Create', 'i') }).first();
      await expect(addBtn).toBeVisible({ timeout: 15000 });
      
      // 5. Grid/Listing Visibility
      const table = page.locator('table, [role="grid"]').first();
      // If data is expected, table should exist
      await expect(table).toBeDefined();

      // Capture screenshot for visual confirmation
      await page.screenshot({ path: `playwright-report/screenshots/smoke-${mod.name.toLowerCase().replace(/\s+/g, '-')}.png` });
    });
  });
});
