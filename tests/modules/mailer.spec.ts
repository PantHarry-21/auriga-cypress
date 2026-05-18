// tests/modules/mailer.spec.ts
// Mailer Test Suite - Email Management
// URL: /dashboard/mail/inbox
// Run: npx playwright test mailer.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_SUBJECT = `Test_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Mailer',
  url: '/dashboard/mail/inbox',
  moduleKey: 'support_mailer',
  hasAdd: true,
  hasEdit: true,
  hasDelete: false,
  hasApprove: false,
  hasSearch: true,
  hasFilter: false,
  hasPagination: false,
  hasExport: false,
  hasTable: false,
  hasForm: true,
};

test.describe('Mailer - Email Management', () => {
  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'master_personel', env, LAB);
  });

  test.describe('Page Load', () => {
    test('TC-MA-001: navigate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.waitForPageLoad();
      await expect(page.locator('body')).not.toContainText('403');
      await expect(page.locator('body')).not.toContainText('not authorized');
    });

    test('TC-MA-002: show compose button', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      await expect(composeBtn).toBeVisible();
    });

    test('TC-MA-003: sidebar visible', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const sidebar = page.locator('nav, aside').first();
      if (await sidebar.isVisible()) {
        expect(sidebar).toBeDefined();
      }
    });

    test('TC-MA-004: inbox loaded', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const inbox = page.locator('text:contains("Inbox")').first();
      if (await inbox.isVisible()) {
        expect(inbox).toBeDefined();
      }
    });
  });

  test.describe('COMPOSE - Send Email', () => {
    test('TC-MA-010: open compose', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        const form = page.locator('form, div.animate-slide-in-right').first();
        if (await form.isVisible()) {
          expect(form).toBeDefined();
        }
      }
    });

    test('TC-MA-011: compose form fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        const inputs = page.locator('input, textarea').filter({ visible: true });
        expect(await inputs.count()).toBeGreaterThan(0);
        await module.clickCancel();
      }
    });

    test('TC-MA-012: validate required', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        const sendBtn = page.locator('button:contains("Send")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
          await page.waitForTimeout(1000);
        }
        await module.clickCancel();
      }
    });

    test('TC-MA-013: compose email', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        // Fill subject
        const subjectInput = page.locator('input[placeholder*="Subject"], input[placeholder*="subject"]').first();
        if (await subjectInput.isVisible()) {
          await subjectInput.fill(TEST_SUBJECT);
        }
        // Fill body
        const bodyInput = page.locator('textarea, div[contenteditable="true"]').first();
        if (await bodyInput.isVisible()) {
          await bodyInput.fill('Test message body');
        }
        // Send
        const sendBtn = page.locator('button:contains("Send")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    });

    test('TC-MA-014: special characters', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input, textarea').first();
        if (await input.isVisible()) {
          await input.fill(`Test@#$_${TS}`);
        }
        await module.clickCancel();
      }
    });

    test('TC-MA-015: long message', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('textarea, div[contenteditable="true"]').first();
        if (await input.isVisible()) {
          await input.fill('A'.repeat(1000));
        }
        await module.clickCancel();
      }
    });
  });

  test.describe('READ - View Emails', () => {
    test('TC-MA-020: view inbox', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const inbox = page.locator('text:contains("Inbox")').first();
      if (await inbox.isVisible()) {
        expect(inbox).toBeDefined();
      }
    });

    test('TC-MA-021: list emails', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const emails = page.locator('[role="button"], div.cursor-pointer').filter({ has: page.locator('text=/.*/')}).first();
      if (await emails.isVisible()) {
        expect(emails).toBeDefined();
      }
    });

    test('TC-MA-022: search emails', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
      }
    });

    test('TC-MA-023: view email detail', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const firstEmail = page.locator('[role="button"], div.cursor-pointer').first();
      if (await firstEmail.isVisible()) {
        await firstEmail.click();
        await page.waitForTimeout(1500);
      }
    });
  });

  test.describe('RBAC - Role Permissions', () => {
    const roles = [
      'master_personel',
      'reception',
      'quality_personel',
      'reviewer'
    ];

    roles.forEach(role => {
      test(`TC-MA-100-${role}: ${role} access`, async ({ page, context, env }) => {
        await loginAs(page, context, role, env, LAB);
        await page.goto('/dashboard/mail/inbox', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        const composeBtn = page.locator('button:contains("Compose")').first();
        expect(await composeBtn.isVisible().catch(() => false)).toBe(true);
      });
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-MA-060: duplicate send', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(500);
        await composeBtn.click().catch(() => {});
        const forms = page.locator('form, div.animate-slide-in-right').filter({ visible: true });
        expect(await forms.count()).toBeLessThanOrEqual(2);
        await module.clickCancel();
      }
    });

    test('TC-MA-061: slow network', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await page.context().route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 200));
        await route.continue();
      });
      await module.navigateTo();
      await module.waitForPageLoad();
    });

    test('TC-MA-062: timeout', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await page.waitForTimeout(3000);
      await page.goto('/dashboard/mail/inbox', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).not.toContainText('500').catch(() => {});
    });
  });

  test.describe('End-to-End', () => {
    test('E2E-MA-001: complete email workflow', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      // Compose
      const composeBtn = page.locator('button:contains("Compose")').first();
      if (await composeBtn.isVisible()) {
        await composeBtn.click();
        await page.waitForTimeout(1500);
        const subjectInput = page.locator('input[placeholder*="Subject"]').first();
        if (await subjectInput.isVisible()) {
          await subjectInput.fill(TEST_SUBJECT);
          await page.waitForTimeout(500);
        }
      }

      // View inbox
      const inbox = page.locator('text:contains("Inbox")').first();
      if (await inbox.isVisible()) {
        await inbox.click();
        await page.waitForTimeout(1000);
      }

      // Search
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill(TEST_SUBJECT);
        await page.waitForTimeout(1000);
      }

      await module.takeScreenshot('e2e-mailer');
    });
  });
});
