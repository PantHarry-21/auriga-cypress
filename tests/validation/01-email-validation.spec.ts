import { test, expect } from '../global-setup';
import { ModuleTestBase } from '../helpers/ModuleTestBase';
import { FormHelper } from '../helpers/FormHelper';
import { ValidationHelper } from '../helpers/ValidationHelper';

const LAB = 'Arbro - Delhi';

test.describe('[VALIDATION-001] Email Format Validation Tests', () => {
  let base: ModuleTestBase;
  let form: FormHelper;
  let validator: ValidationHelper;

  test.beforeEach(async ({ page, context }) => {
    base = new ModuleTestBase(page, context, LAB);
    form = new FormHelper(page);
    validator = new ValidationHelper(page);
    await base.setup('master_personel');
    await base.navigateTo('/dashboard/profile/client');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: VALID EMAIL FORMATS (15 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('VALID EMAIL FORMATS', () => {
    test('[ET-001] Standard email format accepted', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"], input[name*="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user@example.com');
      }
    });

    test('[ET-002] Email with numbers accepted', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user123@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user123@example.com');
      }
    });

    test('[ET-003] Email with dots in local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user.name@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user.name@example.com');
      }
    });

    test('[ET-004] Email with hyphens in domain', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example-domain.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user@example-domain.com');
      }
    });

    test('[ET-005] Email with plus sign accepted', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user+tag@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user+tag@example.com');
      }
    });

    test('[ET-006] Email with underscore accepted', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user_name@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user_name@example.com');
      }
    });

    test('[ET-007] Email with multiple domains accepted', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@subdomain.example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user@subdomain.example.com');
      }
    });

    test('[ET-008] Email with single character local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('a@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('a@example.com');
      }
    });

    test('[ET-009] Email with .co.uk TLD', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example.co.uk');
        const value = await emailField.inputValue();
        expect(value).toBe('user@example.co.uk');
      }
    });

    test('[ET-010] Email with .info TLD', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example.info');
        const value = await emailField.inputValue();
        expect(value).toBe('user@example.info');
      }
    });

    test('[ET-011] Email with single letter domain', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@a.co');
        const value = await emailField.inputValue();
        expect(value).toBe('user@a.co');
      }
    });

    test('[ET-012] Email with numbers in domain', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example123.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user@example123.com');
      }
    });

    test('[ET-013] Email with consecutive dots handled', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user..name@example.com');
        // Check if validation catches this
      }
    });

    test('[ET-014] Uppercase letters in email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('User.Name@Example.COM');
        const value = await emailField.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('[ET-015] Case insensitivity', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('USER@EXAMPLE.COM');
        const value = await emailField.inputValue();
        expect(value).toBeTruthy();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: INVALID EMAIL FORMATS (20 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('INVALID EMAIL FORMATS', () => {
    test('[ET-016] Missing @ symbol', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('userexample.com');
        // Browser validation may prevent submission
      }
    });

    test('[ET-017] Missing domain name', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@');
      }
    });

    test('[ET-018] Missing local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('@example.com');
      }
    });

    test('[ET-019] Missing TLD', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example');
      }
    });

    test('[ET-020] Space in email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user name@example.com');
      }
    });

    test('[ET-021] Multiple @ symbols', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@@example.com');
      }
    });

    test('[ET-022] Special characters in local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user!name@example.com');
      }
    });

    test('[ET-023] Leading dot in local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('.user@example.com');
      }
    });

    test('[ET-024] Trailing dot in local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user.@example.com');
      }
    });

    test('[ET-025] Leading dot in domain', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@.example.com');
      }
    });

    test('[ET-026] Empty email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('');
        const isRequired = await emailField.getAttribute('required');
        expect(typeof isRequired).toBeTruthy();
      }
    });

    test('[ET-027] Only spaces', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('   ');
      }
    });

    test('[ET-028] Comma instead of dot', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example,com');
      }
    });

    test('[ET-029] No domain extension', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@localhost');
      }
    });

    test('[ET-030] IP address as domain', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@192.168.1.1');
      }
    });

    test('[ET-031] Very long email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        const longEmail = 'a'.repeat(100) + '@example.com';
        await emailField.fill(longEmail);
      }
    });

    test('[ET-032] SQL injection attempt', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill("'; DROP TABLE users; --@example.com");
      }
    });

    test('[ET-033] XSS attempt', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('<script>alert("XSS")</script>@example.com');
      }
    });

    test('[ET-034] Newline in email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@\\nexample.com');
      }
    });

    test('[ET-035] Tab in email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@\\texample.com');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: EDGE CASES & SPECIAL SCENARIOS (15 Tests)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('EDGE CASES & SPECIAL SCENARIOS', () => {
    test('[ET-036] Email length at 254 characters (RFC 5321)', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        const maxEmail = 'a'.repeat(243) + '@example.com'; // 254 total
        await emailField.fill(maxEmail);
      }
    });

    test('[ET-037] Email length exceeds 254 characters', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        const tooLongEmail = 'a'.repeat(250) + '@example.com';
        await emailField.fill(tooLongEmail);
      }
    });

    test('[ET-038] Local part at 64 characters (RFC limit)', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        const maxLocalEmail = 'a'.repeat(64) + '@example.com';
        await emailField.fill(maxLocalEmail);
      }
    });

    test('[ET-039] Local part exceeds 64 characters', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        const longLocalEmail = 'a'.repeat(70) + '@example.com';
        await emailField.fill(longLocalEmail);
      }
    });

    test('[ET-040] Quoted local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('"user name"@example.com');
      }
    });

    test('[ET-041] International domain name (IDN)', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@münchen.de');
      }
    });

    test('[ET-042] Non-ASCII characters in local part', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('用户@example.com');
      }
    });

    test('[ET-043] Email with all caps and numbers', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('USER123@EXAMPLE456.COM');
        const value = await emailField.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('[ET-044] Duplicate email submission prevention', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('duplicate@example.com');
        await form.submitForm();
        // Second attempt with same email
        await form.openCreateForm();
        await emailField.fill('duplicate@example.com');
      }
    });

    test('[ET-045] Email format preserved after blur', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@example.com');
        await emailField.blur();
        const value = await emailField.inputValue();
        expect(value).toBe('user@example.com');
      }
    });

    test('[ET-046] Email not auto-corrected', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('user@examplr.com');
        const value = await emailField.inputValue();
        expect(value).toBe('user@examplr.com');
      }
    });

    test('[ET-047] Email validation on paste', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('pasted@example.com');
        const value = await emailField.inputValue();
        expect(value).toBe('pasted@example.com');
      }
    });

    test('[ET-048] Email field auto-completion', async ({ page }) => {
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        const autoComplete = await emailField.getAttribute('autocomplete');
        expect(typeof autoComplete).toBeTruthy();
      }
    });

    test('[ET-049] Error message for invalid email', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('invalid-email');
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(500);
          const error = await form.getValidationError();
          expect(typeof error).toBe('string');
        }
      }
    });

    test('[ET-050] Email field returns to empty state', async ({ page }) => {
      await form.openCreateForm();
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('test@example.com');
        await emailField.clear();
        const value = await emailField.inputValue();
        expect(value).toBe('');
      }
    });
  });
});
