import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import rolesData from '../fixtures/roles-permissions.json';

// ═══════════════════════════════════════════════════════════════════════════════
// Role-Based Access Control — Visibility & Permission Matrix
// Data-driven test generated from roles-permissions.json
// ═══════════════════════════════════════════════════════════════════════════════

const LAB = 'Arbro - Delhi';

/**
 * This spec performs a cross-role verification of the entire permission matrix.
 * It ensures that each role can only access the modules they are permitted to,
 * and that unauthorized access is handled gracefully.
 */

test.describe('RBAC Permission Matrix Verification', () => {

  // Iterate through all active roles in the system
  rolesData.roles.filter(r => r.status === 'active').forEach((role) => {
    
    test.describe(`Role Check: ${role.role_name}`, () => {
      
      test.beforeEach(async ({ page, context }) => {
        await stubStimulsoft(context);
        // Uses session caching for performance
        await loginAs(page, context, role.role_key, env, LAB);
      });

      // Verify each module's access for the current role
      role.modules.forEach((mod: any) => {
        test(`${mod.sub_module} access verification`, async ({ page }) => {
          // Navigate to the module URL
          await page.goto(mod.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          
          if (mod.permissions.read) {
            // Assert access GRANTED
            // We use a regex for URL matching to handle query params or slight variations
            const escapedUrl = mod.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            await expect(page).toHaveURL(new RegExp(escapedUrl));
            
            const body = page.locator('body');
            await expect(body).not.toContainText('404');
            await expect(body).not.toContainText('Unauthorized', { ignoreCase: true });
            await expect(body).not.toContainText('Access Denied', { ignoreCase: true });
          } else {
            // Assert access DENIED
            // The app typically redirects to dashboard or shows an error page
            const currentURL = page.url();
            if (currentURL.includes(mod.url)) {
                await expect(page.locator('body')).toContainText(/Unauthorized|Access Denied|Permission/i);
            } else {
                // Successfully redirected away from the forbidden URL
                expect(currentURL).not.toContain(mod.url);
            }
          }
        });
      });
    });
  });
});
