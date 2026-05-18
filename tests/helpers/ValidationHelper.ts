import { Page, expect } from '@playwright/test';

export class ValidationHelper {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format (10 digits)
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  // Validate required field
  validateRequired(value: string): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  }

  // Validate max length
  validateMaxLength(value: string, maxLength: number): boolean {
    return value.length <= maxLength;
  }

  // Validate min length
  validateMinLength(value: string, minLength: number): boolean {
    return value.length >= minLength;
  }

  // Validate date format
  validateDateFormat(date: string, format: string = 'YYYY-MM-DD'): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }

  // Validate numeric
  validateNumeric(value: string): boolean {
    return !isNaN(Number(value)) && value !== '';
  }

  // Validate positive number
  validatePositiveNumber(value: string): boolean {
    return this.validateNumeric(value) && Number(value) > 0;
  }

  // Check field is required in DOM
  async isFieldRequired(fieldSelector: string): Promise<boolean> {
    const required = await this.page.locator(fieldSelector).getAttribute('required');
    return required !== null;
  }

  // Get field validation message
  async getFieldValidationMessage(fieldSelector: string): Promise<string> {
    const validationMessage = await this.page.locator(fieldSelector).evaluate((el: any) => el.validationMessage || '');
    return validationMessage;
  }

  // Test field with invalid email
  async testInvalidEmail(fieldSelector: string): Promise<void> {
    await this.page.fill(fieldSelector, 'invalid-email');
    const isValid = this.validateEmail('invalid-email');
    expect(isValid).toBe(false);
  }

  // Test field with invalid phone
  async testInvalidPhone(fieldSelector: string): Promise<void> {
    await this.page.fill(fieldSelector, 'abc123');
    const isValid = this.validatePhone('abc123');
    expect(isValid).toBe(false);
  }

  // Test max length validation
  async testMaxLength(fieldSelector: string, maxLength: number): Promise<void> {
    const testValue = 'x'.repeat(maxLength + 10);
    await this.page.fill(fieldSelector, testValue);

    const inputValue = await this.page.inputValue(fieldSelector);
    expect(inputValue.length).toBeLessThanOrEqual(maxLength);
  }

  // Test required field validation
  async testRequiredField(fieldSelector: string): Promise<void> {
    await this.page.fill(fieldSelector, '');
    const isEmpty = (await this.page.inputValue(fieldSelector)) === '';
    expect(isEmpty).toBe(true);
  }

  // Test special characters
  async testSpecialCharacters(fieldSelector: string): Promise<void> {
    const specialChars = '@#$%^&*()_+-=[]{}|;:,.<>?';
    await this.page.fill(fieldSelector, specialChars);

    const inputValue = await this.page.inputValue(fieldSelector);
    expect(inputValue.length).toBeGreaterThan(0);
  }

  // Test SQL injection attempt
  testSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/i,
      /('|-{2}|\/\*|\*\/|;)/,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Test XSS attempt
  testXSSAttempt(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Validate field against regex
  validateRegex(value: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch {
      return false;
    }
  }

  // Check if form field shows error
  async hasFieldError(fieldSelector: string): Promise<boolean> {
    const errorStates = [
      await this.page.locator(`${fieldSelector}[aria-invalid="true"]`).isVisible().catch(() => false),
      await this.page.locator(`${fieldSelector}.error, ${fieldSelector}.is-invalid`).isVisible().catch(() => false),
    ];

    return errorStates.some(state => state);
  }

  // Get all form errors
  async getAllFormErrors(): Promise<string[]> {
    const errorSelectors = [
      '.error-message',
      '.validation-error',
      '.invalid-feedback',
      '[role="alert"]',
      '.form-error',
    ];

    const errors: string[] = [];

    for (const selector of errorSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const text = await elements.nth(i).textContent();
        if (text && text.trim()) {
          errors.push(text.trim());
        }
      }
    }

    return [...new Set(errors)];
  }

  // Validate form submission
  async validateFormSubmission(): Promise<boolean> {
    try {
      const submitBtn = this.page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Save")').first();
      const isVisible = await submitBtn.isVisible().catch(() => false);
      return isVisible;
    } catch {
      return false;
    }
  }
}
