/**
 * ValidationTestHelper.ts - Comprehensive Validation Testing Utilities
 *
 * Provides reusable functions for testing all field validation scenarios:
 * - Required field validation
 * - Email format validation
 * - Phone number validation
 * - Date validation
 * - Number field validation
 * - Text length validation
 * - Pattern validation
 * - XSS and SQL injection protection
 * - Boundary value testing
 * - Unicode and special character handling
 */

import { Page, expect } from '@playwright/test';

export interface ValidationTestCase {
  name: string;
  value: string | number | boolean;
  shouldPass: boolean;
  expectedError?: string;
}

export class ValidationTestHelper {
  constructor(private page: Page) {}

  /**
   * Test required field validation
   */
  async testRequiredFieldValidation(
    fieldName: string,
    fieldSelector?: string
  ): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    const selector = fieldSelector || `input[name="${fieldName}"], textarea[name="${fieldName}"]`;

    try {
      // Clear the field
      const field = this.page.locator(selector).first();
      if (!(await field.isVisible())) {
        errors.push(`Field ${fieldName} not visible`);
        return { passed: false, errors };
      }

      await field.clear();
      await field.blur();

      // Try to submit
      const submitButton = this.page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click({ force: true });
        await this.page.waitForTimeout(300);
      }

      // Check for validation error
      const errorElement = await this.findValidationError(fieldName);
      if (errorElement) {
        return { passed: true, errors: [] };
      } else {
        errors.push(`No validation error found for required field ${fieldName}`);
        return { passed: false, errors };
      }
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test email field validation
   */
  async testEmailValidation(fieldName: string): Promise<{ passed: boolean; errors: string[] }> {
    const testCases: ValidationTestCase[] = [
      { name: 'Valid email', value: 'user@example.com', shouldPass: true },
      { name: 'Valid email with subdomain', value: 'user@mail.example.co.uk', shouldPass: true },
      { name: 'Valid email with +', value: 'user+tag@example.com', shouldPass: true },
      { name: 'Invalid - missing @', value: 'userexample.com', shouldPass: false, expectedError: 'email' },
      { name: 'Invalid - missing domain', value: 'user@', shouldPass: false, expectedError: 'email' },
      { name: 'Invalid - missing local', value: '@example.com', shouldPass: false, expectedError: 'email' },
      { name: 'Invalid - spaces', value: 'user @example.com', shouldPass: false, expectedError: 'email' },
      { name: 'Invalid - double @', value: 'user@@example.com', shouldPass: false, expectedError: 'email' },
    ];

    return await this.runValidationTestSuite(fieldName, testCases, 'email');
  }

  /**
   * Test phone field validation (India format)
   */
  async testPhoneValidation(fieldName: string): Promise<{ passed: boolean; errors: string[] }> {
    const testCases: ValidationTestCase[] = [
      { name: 'Valid - 10 digits', value: '9876543210', shouldPass: true },
      { name: 'Valid - with country code', value: '+919876543210', shouldPass: true },
      { name: 'Valid - with hyphen', value: '98-765-43210', shouldPass: true },
      { name: 'Valid - with parentheses', value: '(98) 765-43210', shouldPass: true },
      { name: 'Invalid - only 5 digits', value: '98765', shouldPass: false, expectedError: 'phone' },
      { name: 'Invalid - alphabets', value: 'abc1234567', shouldPass: false, expectedError: 'phone' },
      { name: 'Invalid - empty', value: '', shouldPass: false, expectedError: 'phone' },
      { name: 'Invalid - too long', value: '987654321098765', shouldPass: false, expectedError: 'phone' },
    ];

    return await this.runValidationTestSuite(fieldName, testCases, 'phone');
  }

  /**
   * Test date field validation
   */
  async testDateValidation(fieldName: string): Promise<{ passed: boolean; errors: string[] }> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const testCases: ValidationTestCase[] = [
      { name: 'Valid - today', value: today, shouldPass: true },
      { name: 'Valid - future date', value: tomorrow, shouldPass: true },
      { name: 'Valid - valid past date', value: '2020-01-15', shouldPass: true },
      { name: 'Invalid - non-date format', value: '15-01-2020', shouldPass: false, expectedError: 'date' },
      { name: 'Invalid - invalid month', value: '2026-13-01', shouldPass: false, expectedError: 'date' },
      { name: 'Invalid - invalid day', value: '2026-02-30', shouldPass: false, expectedError: 'date' },
      { name: 'Invalid - text', value: 'not-a-date', shouldPass: false, expectedError: 'date' },
    ];

    return await this.runValidationTestSuite(fieldName, testCases, 'date');
  }

  /**
   * Test number field validation
   */
  async testNumberValidation(
    fieldName: string,
    minValue?: number,
    maxValue?: number
  ): Promise<{ passed: boolean; errors: string[] }> {
    const testCases: ValidationTestCase[] = [
      { name: 'Valid - zero', value: 0, shouldPass: true },
      { name: 'Valid - positive', value: 100, shouldPass: true },
      { name: 'Valid - decimal', value: 99.99, shouldPass: true },
    ];

    if (minValue !== undefined) {
      testCases.push({ name: `Valid - at min (${minValue})`, value: minValue, shouldPass: true });
      testCases.push({ name: `Invalid - below min (${minValue - 1})`, value: minValue - 1, shouldPass: false });
    }

    if (maxValue !== undefined) {
      testCases.push({ name: `Valid - at max (${maxValue})`, value: maxValue, shouldPass: true });
      testCases.push({ name: `Invalid - above max (${maxValue + 1})`, value: maxValue + 1, shouldPass: false });
    }

    testCases.push({ name: 'Invalid - text', value: 'abc', shouldPass: false, expectedError: 'number' });

    return await this.runValidationTestSuite(fieldName, testCases, 'number');
  }

  /**
   * Test text length validation
   */
  async testTextLengthValidation(
    fieldName: string,
    minLength?: number,
    maxLength?: number
  ): Promise<{ passed: boolean; errors: string[] }> {
    const testCases: ValidationTestCase[] = [];

    if (minLength !== undefined) {
      const tooShort = 'a'.repeat(Math.max(minLength - 1, 1));
      const justRight = 'a'.repeat(minLength);
      testCases.push({ name: `Invalid - below min (${minLength})`, value: tooShort, shouldPass: false });
      testCases.push({ name: `Valid - at min (${minLength})`, value: justRight, shouldPass: true });
    }

    if (maxLength !== undefined) {
      const tooLong = 'a'.repeat(maxLength + 1);
      const justRight = 'a'.repeat(maxLength);
      testCases.push({ name: `Invalid - above max (${maxLength})`, value: tooLong, shouldPass: false });
      testCases.push({ name: `Valid - at max (${maxLength})`, value: justRight, shouldPass: true });
    }

    testCases.push({ name: 'Valid - normal text', value: 'Test value', shouldPass: true });

    return await this.runValidationTestSuite(fieldName, testCases, 'text');
  }

  /**
   * Test pattern validation (e.g., pincode: ^[0-9]{6}$)
   */
  async testPatternValidation(
    fieldName: string,
    validPatterns: string[],
    invalidPatterns: string[]
  ): Promise<{ passed: boolean; errors: string[] }> {
    const testCases: ValidationTestCase[] = [];

    for (const pattern of validPatterns) {
      testCases.push({ name: `Valid pattern: ${pattern}`, value: pattern, shouldPass: true });
    }

    for (const pattern of invalidPatterns) {
      testCases.push({
        name: `Invalid pattern: ${pattern}`,
        value: pattern,
        shouldPass: false,
        expectedError: 'pattern',
      });
    }

    return await this.runValidationTestSuite(fieldName, testCases, 'text');
  }

  /**
   * Test XSS protection - ensure payloads are escaped/sanitized
   */
  async testXSSProtection(
    fieldName: string,
    xssPayloads: string[] = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(1)">',
      '<svg/onload=alert("XSS")>',
      'javascript:alert("XSS")',
    ]
  ): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Clear field
      const field = this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`).first();
      if (!(await field.isVisible())) {
        errors.push(`Field ${fieldName} not visible`);
        return { passed: false, errors };
      }

      for (const payload of xssPayloads) {
        await field.clear();
        await field.fill(payload);
        await field.blur();

        // Submit form
        const submitButton = this.page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click({ force: true });
          await this.page.waitForTimeout(500);
        }

        // Check if payload is escaped in display
        const bodyText = await this.page.locator('body').innerText();
        if (bodyText.includes('<script>') || bodyText.includes('onerror=')) {
          errors.push(`XSS payload not escaped: ${payload}`);
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test SQL injection protection
   */
  async testSQLInjectionProtection(
    fieldName: string,
    sqlPayloads: string[] = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin' --",
      "1' UNION SELECT * FROM users --",
    ]
  ): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      for (const payload of sqlPayloads) {
        // Fill field with SQL injection payload
        const field = this.page.locator(`input[name="${fieldName}"]`).first();
        if (await field.isVisible()) {
          await field.clear();
          await field.fill(payload);
        }

        // Try to submit - should not cause database error
        const submitButton = this.page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click({ force: true });
          await this.page.waitForTimeout(500);

          // Check for SQL error messages
          const bodyText = await this.page.locator('body').innerText();
          if (
            bodyText.includes('SQL') ||
            bodyText.includes('syntax error') ||
            bodyText.includes('Database error')
          ) {
            errors.push(`SQL error message exposed for payload: ${payload}`);
          }
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test special character handling
   */
  async testSpecialCharacters(
    fieldName: string,
    testValues: string[] = [
      '!@#$%^&*()_+-=[]{}|;:\'",.<>?',
      'Ñoño',
      'مرحبا',
      '你好',
      '😀😃😄😁😆',
    ]
  ): Promise<{ passed: boolean; errors: string[] }> {
    const testCases: ValidationTestCase[] = testValues.map(value => ({
      name: `Special chars: ${value.substring(0, 20)}...`,
      value,
      shouldPass: true,
    }));

    return await this.runValidationTestSuite(fieldName, testCases, 'text');
  }

  /**
   * Test dropdown/select validation
   */
  async testDropdownValidation(fieldName: string, options: string[]): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const select = this.page.locator(`select[name="${fieldName}"]`).first();
      if (!(await select.isVisible())) {
        errors.push(`Dropdown ${fieldName} not found`);
        return { passed: false, errors };
      }

      // Test each option
      for (const option of options) {
        try {
          await select.selectOption(option);
          const selectedValue = await select.evaluate((el: HTMLSelectElement) => el.value);
          if (!selectedValue) {
            errors.push(`Failed to select option: ${option}`);
          }
        } catch (e) {
          errors.push(`Option not available: ${option}`);
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test combobox/autocomplete validation
   */
  async testComboboxValidation(fieldName: string, searchTerms: string[]): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const input = this.page.locator(`input[name="${fieldName}"]`).first();
      if (!(await input.isVisible())) {
        errors.push(`Combobox ${fieldName} not found`);
        return { passed: false, errors };
      }

      for (const term of searchTerms) {
        await input.fill(term);
        await this.page.waitForTimeout(300);

        // Check if dropdown appears
        const dropdown = this.page.locator('[role="listbox"], [role="combobox"] ~ [role="presentation"]').first();
        if (!(await dropdown.isVisible())) {
          errors.push(`Dropdown not opened for search: ${term}`);
        }

        // Clear for next iteration
        await input.clear();
      }

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test checkbox validation
   */
  async testCheckboxValidation(fieldName: string): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const checkbox = this.page.locator(`input[type="checkbox"][name="${fieldName}"]`).first();
      if (!(await checkbox.isVisible())) {
        errors.push(`Checkbox ${fieldName} not found`);
        return { passed: false, errors };
      }

      // Check
      await checkbox.check();
      let isChecked = await checkbox.isChecked();
      if (!isChecked) errors.push('Checkbox check failed');

      // Uncheck
      await checkbox.uncheck();
      isChecked = await checkbox.isChecked();
      if (isChecked) errors.push('Checkbox uncheck failed');

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test radio button validation
   */
  async testRadioValidation(fieldName: string, options: string[]): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      for (const option of options) {
        const radio = this.page.locator(`input[type="radio"][name="${fieldName}"][value="${option}"]`).first();
        if (!(await radio.isVisible())) {
          errors.push(`Radio option not found: ${option}`);
          continue;
        }

        await radio.check();
        const isChecked = await radio.isChecked();
        if (!isChecked) {
          errors.push(`Failed to select radio option: ${option}`);
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Test textarea special handling
   */
  async testTextareaValidation(fieldName: string, maxLength?: number): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const textarea = this.page.locator(`textarea[name="${fieldName}"]`).first();
      if (!(await textarea.isVisible())) {
        errors.push(`Textarea ${fieldName} not found`);
        return { passed: false, errors };
      }

      // Test multi-line
      const multilineText = 'Line 1\nLine 2\nLine 3';
      await textarea.fill(multilineText);
      const value = await textarea.inputValue();
      if (value !== multilineText) {
        errors.push('Multi-line input not preserved');
      }

      // Test max length if specified
      if (maxLength) {
        const tooLong = 'a'.repeat(maxLength + 100);
        await textarea.fill(tooLong);
        const actualLength = (await textarea.inputValue()).length;
        if (actualLength > maxLength) {
          errors.push(`Textarea allows text beyond max length (${maxLength})`);
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(error.message);
      return { passed: false, errors };
    }
  }

  /**
   * Private helper: Run a test suite and return results
   */
  private async runValidationTestSuite(
    fieldName: string,
    testCases: ValidationTestCase[],
    fieldType: string
  ): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    let passedCount = 0;

    for (const testCase of testCases) {
      try {
        // Fill field with test value
        const field = this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`).first();
        if (await field.isVisible()) {
          await field.clear();
          await field.fill(String(testCase.value));
          await field.blur();
        }

        // Try to submit
        const submitButton = this.page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible({ timeout: 2000 })) {
          await submitButton.click({ force: true });
          await this.page.waitForTimeout(300);
        }

        // Check result
        const hasError = await this.hasValidationError(fieldName);

        if (testCase.shouldPass && !hasError) {
          passedCount++;
        } else if (!testCase.shouldPass && hasError) {
          passedCount++;
        } else {
          errors.push(
            `${testCase.name}: Expected ${testCase.shouldPass ? 'pass' : 'fail'}, got ${hasError ? 'error' : 'success'}`
          );
        }
      } catch (error: any) {
        errors.push(`${testCase.name}: ${error.message}`);
      }
    }

    return {
      passed: errors.length === 0,
      errors: errors.length > 0 ? errors : [`All ${passedCount}/${testCases.length} test cases passed`],
    };
  }

  /**
   * Helper: Find validation error for a field
   */
  private async findValidationError(fieldName: string): Promise<any> {
    try {
      const selectors = [
        `[data-testid="error_${fieldName}"]`,
        `.error-${fieldName}`,
        `[name="${fieldName}"] ~ .error`,
        `[name="${fieldName}"] ~ [role="alert"]`,
        `.error:visible`,
        `[role="alert"]:visible`,
      ];

      for (const selector of selectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          return element;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Check if field has validation error
   */
  private async hasValidationError(fieldName: string): Promise<boolean> {
    const error = await this.findValidationError(fieldName);
    return error !== null;
  }
}
