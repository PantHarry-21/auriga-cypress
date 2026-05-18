# YLIMS E2E Test Automation Framework
**Playwright-Based Test Suite for YLIMS UAT**

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
npx playwright install
```

### Run Tests
```bash
# All tests
npx playwright test

# Specific module
npx playwright test tests/modules/002-generic-master.spec.ts

# Specific project (uat, dev, staging)
npx playwright test --project=uat

# With UI mode
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

---

## 📁 Project Structure

```
.
├── tests/                          # Test suite root
│   ├── modules/                    # Module-specific test suites
│   │   ├── 002-generic-master.spec.ts
│   │   ├── 003-stp-master.spec.ts
│   │   └── ...
│   ├── rbac/                       # RBAC & permission tests
│   │   ├── APPROVAL-FLOW-RBAC.spec.ts
│   │   └── ...
│   ├── workflows/                  # Complex workflow tests
│   ├── edge-cases/                 # Edge case & error scenarios
│   ├── validation/                 # Data validation tests
│   ├── helpers/                    # Test helper utilities
│   │   ├── ModuleTestBase.ts       # Base class for all tests
│   │   ├── FormHelper.ts           # Form interaction helpers
│   │   ├── SelectorHelper.ts       # Selector utilities
│   │   └── AuthHelper.ts           # Authentication helpers
│   ├── fixtures/                   # Test data & fixtures
│   │   ├── test-data.json
│   │   ├── ylims-complete-test-data.json
│   │   └── roles-permissions.json
│   └── global-setup.ts             # Global test configuration
├── .env.uat                        # UAT environment variables
├── .env.dev                        # Dev environment variables
├── playwright.config.ts            # Playwright configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README-start-here.md            # This file
```

---

## 🔐 Environment Configuration

### .env.uat (for UAT testing)
```
BASE_URL=https://uat.ylims.com
ADMIN=<admin_credentials>
RECEPTION=<reception_credentials>
BOOKING_PERSONEL=<booking_personnel_credentials>
... (19 roles total)
```

### .env.dev (for Dev testing)
```
BASE_URL=https://dev.ylims.com
... (same role structure)
```

---

## 🏗️ Test Structure

### Module Tests
Located in `tests/modules/`, each module has:
- ✅ Page Load Tests (5 tests)
- ✅ List Operations (10 tests)
- ✅ CRUD Operations (12 tests)
- ✅ Complex Workflows (8 tests)
- ✅ Edge Cases & Validation (10 tests)

### RBAC Tests
Located in `tests/rbac/`:
- Dynamic RBAC role-permission matrix tests
- Approval flow tests across all 19 roles
- Permission enforcement validation

### Helper Classes
All tests extend `ModuleTestBase` which provides:
- `setup(roleName)` - Login as any role
- `logout()` - Logout from current user
- `isPageAccessible()` - Check page access
- `navigateTo(url)` - Navigate to module

---

## 🚀 Running Test Suites

### Run All Tests
```bash
npx playwright test
```

### Run Specific Module
```bash
npx playwright test tests/modules/002-generic-master.spec.ts
```

### Run RBAC Tests Only
```bash
npx playwright test tests/rbac/
```

### Run With Specific Configuration
```bash
# UAT environment
npx playwright test --project=uat

# Dev environment
npx playwright test --project=dev

# Single worker (no parallelization)
npx playwright test --workers=1

# Verbose output
npx playwright test --debug
```

---

## 📊 Reports

### HTML Report
```bash
npx playwright show-report
```

### JSON Report
```bash
npx playwright test --reporter=json > results.json
```

### Test Results
- Generated in: `test-results/`
- Includes: Screenshots, videos, test logs

---

## 🔧 Key Test Helpers

### ModuleTestBase
```typescript
const base = new ModuleTestBase(page, context, 'Lab Name');
await base.setup('admin');                    // Login
await base.navigateTo('/dashboard/modules/...');
await base.logout();
```

### FormHelper
```typescript
const form = new FormHelper(page);
await form.openCreateForm();
await form.fillField('fieldName', 'value');
await form.submitForm();
```

### SelectorHelper
```typescript
const selector = new SelectorHelper(page);
await selector.clickByText('Button Text');
const value = await selector.getFieldValue('fieldName');
```

---

## 📝 Writing New Tests

### Basic Module Test Template
```typescript
import { test, expect } from '../global-setup';
import { ModuleTestBase } from '../helpers/ModuleTestBase';

test.describe('[MODULE-XXX] Module Name', () => {
  let base: ModuleTestBase;

  test.beforeEach(async ({ page, context }) => {
    base = new ModuleTestBase(page, context, 'Lab Name');
    await base.setup('master_personel');
    await base.navigateTo('/dashboard/modules/module-url');
  });

  test('should load module page', async ({ page }) => {
    expect(await base.isPageAccessible()).toBe(true);
  });
});
```

---

## 🛠️ Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`: `timeout: 60000`
- Check if application is responsive

### Selector Not Found
- Use `--debug` flag to run in headed mode
- Check HTML structure in DevTools
- Update selectors in helper classes

### Permission Denied
- Verify role credentials in `.env.uat` or `.env.dev`
- Check if role has required permissions in RBAC
- Ensure lab assignment is correct

### Environment Issues
- Verify `BASE_URL` in `.env` file
- Check network connectivity
- Verify VPN if needed

---

## 📚 Documentation

- **playwright.config.ts** - Test configuration, timeouts, browsers
- **tests/global-setup.ts** - Global setup, fixtures, custom matchers
- **.env.uat** / **.env.dev** - Environment-specific credentials

---

## ✅ Quality Checklist

Before committing tests:
- [ ] All tests pass locally
- [ ] Tests pass on UAT environment
- [ ] No hard-coded credentials
- [ ] Proper error handling
- [ ] Reasonable timeouts
- [ ] Clear, descriptive test names
- [ ] Comments for complex logic

---

## 📞 Support

For issues or questions:
1. Check test logs: `test-results/`
2. Enable debug mode: `--debug`
3. Review selectors in helpers/
4. Check `.env` configuration

---

**Last Updated:** May 18, 2026  
**Framework:** Playwright with TypeScript  
**Version:** 1.0
