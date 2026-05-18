# YLIMS Playwright Test Framework - Comprehensive Audit Report
**Generated:** May 18, 2026  
**Status:** Critical Issues Found & Fixes Provided

---

## 🔴 CRITICAL ISSUES

### 1. **DUPLICATE & CONFLICTING TEST FILES**
**Severity:** 🔴 CRITICAL | **Impact:** High - Test confusion, maintenance nightmare

Identified duplicates in `tests/modules/`:
```
DUPLICATE PAIRS:
├─ generic-master.spec.ts          (1,618 lines)
├─ generic_master.spec.ts          (635 lines)
├─ GENERIC-MASTER-EXAMPLE.spec.ts  (1,400+ lines)

├─ indent-management.spec.ts       (1,200+ lines)
├─ indent_management.spec.ts       (800+ lines)

├─ stp-master.spec.ts              (exists)
├─ STP Master Test Cases.xlsx      (old fixture)

├─ product-master.spec.ts          (exists)
├─ Product_Master_Test_Cases.xlsx  (old fixture)

VARIANTS/DUPLICATES:
├─ ALL-MODULES-COMPLETE.spec.ts
├─ COMPREHENSIVE-ALL-MODULES.spec.ts
├─ COMPREHENSIVE-ALL-MODULES-PRODUCTION.spec.ts
├─ MASTER-ALL-MODULES.spec.ts
├─ MASTER-WORKING.spec.ts
├─ REAL-CRUD-MODULE-TESTS.spec.ts
```

**Root Cause:** Multiple development iterations without cleanup

**Fix:**
```bash
# Remove duplicates (keep only ONE version per module):
cd tests/modules/
# Keep: 002-generic-master.spec.ts (clean, numbered naming)
# Remove: generic-master.spec.ts, generic_master.spec.ts, GENERIC-MASTER-EXAMPLE.spec.ts

# Keep canonical versions with consistent naming:
# 001-product-master.spec.ts
# 002-generic-master.spec.ts
# 003-stp-master.spec.ts
# 004-admin-indent.spec.ts
# ... etc

# Remove: ALL-MODULES-*, COMPREHENSIVE-*, MASTER-*, REAL-*, GENERIC-MASTER-EXAMPLE.spec.ts
```

**Action Items:**
- [ ] Identify which version of each module test is most recent/best
- [ ] Keep only ONE canonical version per module
- [ ] Use consistent naming: `{NUMBER}-{module-name}.spec.ts`
- [ ] Remove variants

---

### 2. **INCONSISTENT SELECTOR PATTERNS**
**Severity:** 🔴 CRITICAL | **Impact:** High - Tests will fail with UI changes

**Issues Found:**

```typescript
// ❌ GENERIC SELECTORS (Too broad, brittle):
page.locator('h1, h2, [class*="title"]').first()           // Could match wrong elements
page.locator('table').first()                              // Assumes ONE table on page
page.locator('button').all()                               // Gets ALL buttons
page.locator('[role="list"]').first()                      // Generic role selector
page.locator('nav, [role="navigation"]').first()           // Navigation could be any <nav>

// ❌ HARDCODED ATTRIBUTE SELECTORS:
page.locator('[name="username"]')                          // If HTML changes, test breaks
page.locator('[name="password"]')                          // Same issue
page.fill('[name="username"]', value)                      // No fallback

// ❌ MISSING TEST IDS:
// Tests should use [data-testid="..."] for stable selectors
// Currently using fragile CSS/XPath combinations
```

**Fix Required:**
1. **Coordinate with frontend team** to add `data-testid` attributes to critical elements
2. **Implement Selector Registry** with fallback chains:
```typescript
// GOOD pattern:
async findCreateButton() {
  return this.page.locator(
    '[data-testid="create-button"]' +          // Primary (most stable)
    ', button:has-text("Create")' +             // Fallback 1
    ', button[aria-label="Create new"]'         // Fallback 2
  ).first();
}
```

3. **Create Selector Constants File:**
```typescript
// tests/selectors/generic-master.selectors.ts
export const GENERIC_MASTER_SELECTORS = {
  CREATE_BUTTON: '[data-testid="gm-create"] || button:has-text("Create")',
  SEARCH_INPUT: '[data-testid="gm-search"] || input[placeholder*="Search"]',
  ITEMS_TABLE: '[data-testid="gm-items-table"] || table',
  FIRST_ROW: 'tr:nth-child(1)',
  EDIT_BUTTON: (rowIndex: number) => `tr:nth-child(${rowIndex}) [data-testid="edit"]`,
};
```

---

### 3. **UNDEFINED ENVIRONMENT VARIABLES IN PLAYWRIGHT CONFIG**
**Severity:** 🔴 CRITICAL | **Impact:** High - Tests cannot load environment config

**Issue in `playwright.config.ts:16-17`:**
```typescript
const devEnv = getEnvConfig('.env.dev');  // ✅ File exists
const uatEnv = getEnvConfig('.env.uat');  // ✅ File exists

// BUT: Project metadata not being passed to tests!
```

**Current Implementation:**
```typescript
projects: [
  {
    name: 'dev',
    use: { baseURL: devEnv.BASE_URL || 'https://dev.ylims.com' },
    // Missing: metadata: { ...devEnv }
  }
]
```

**Fix:**
```typescript
projects: [
  {
    name: 'dev',
    use: { baseURL: devEnv.BASE_URL || 'https://dev.ylims.com' },
    metadata: devEnv,  // ✅ Add this
  },
  {
    name: 'uat',
    use: { baseURL: uatEnv.BASE_URL || 'https://uat.ylims.com' },
    metadata: uatEnv,  // ✅ Add this
  }
]
```

---

### 4. **MISSING ROLE ALIASES MAPPING**
**Severity:** 🟠 HIGH | **Impact:** Medium - Role key mismatches cause test failures

**Current Issue in `commands.ts:6-26`:**

```typescript
// Role keys used in tests:
'reception'             // ✅ Matches env RECEPTION_USERNAME
'booking_personel'      // ❌ Typo: should be 'booking_personnel' (double 'n')
'master_personel'       // ❌ Typo: should be 'master_personnel' (double 'n')
'master_controler'      // ❌ Typo: should be 'master_controller' (double 'l')
'department_reviewer'   // ✅ Correct
'quality_manger'        // ❌ Typo: should be 'quality_manager' (double 'a')
```

**Why This Breaks:**
- `.env.uat` uses: `BOOKING_PERSONEL_USERNAME` (matches code)
- But English spelling is `personnel` not `personel`
- Maintainability nightmare

**Fix - Add Alias Mapper:**
```typescript
const ROLE_ALIASES = {
  'booking_personnel': 'booking_personel',  // Correct → Current code
  'master_personnel': 'master_personel',
  'master_controller': 'master_controler',
  'quality_manager': 'quality_manger',
};

export function getRoleCredentials(env: Record<string, string>) {
  // Keep existing keys for backward compatibility
  // Add proper English spelling as aliases
  return {
    booking_personel: { ... },
    booking_personnel: { ... },  // ✅ Add both
    // ... etc
  };
}
```

---

### 5. **MISSING TEST DATA FOR NEGATIVE SCENARIOS**
**Severity:** 🟠 HIGH | **Impact:** Medium - Edge cases not tested

**Missing in `test-data.json`:**

```json
{
  "generic_master": {
    "create": {
      // ✅ Exists: valid, invalid_email, max_length, missing_required, special_chars
      // ❌ Missing:
      "sql_injection": {
        "name": "'; DROP TABLE generic_master; --",
        "description": "SQL injection test"
      },
      "xss_payload": {
        "name": "<script>alert('xss')</script>",
        "description": "XSS test"
      },
      "unicode_chars": {
        "name": "тест 测试 テスト",
        "description": "Unicode test"
      },
      "null_bytes": {
        "name": "test\x00injection",
        "description": "Null byte test"
      }
    }
  }
}
```

**Fix:**
- Add security test data (SQL injection, XSS, CSRF payloads)
- Add internationalization data (Unicode, emoji, RTL text)
- Add boundary value data (empty strings, very long strings, special characters)

---

## 🟠 HIGH PRIORITY ISSUES

### 6. **INCONSISTENT ROLE KEY NAMING CONVENTION**
**Status:** Partially broken

**Current Inconsistencies:**
```typescript
// Different naming patterns in different files:
// commands.ts:
'admin'
'reception'
'booking_personel'        // snake_case with typo

// ModuleTestBase.setup():
'master_personel'

// Test files:
await base.setup('master_personel')
await base.setup('admin')
```

**Recommendation:**
Standardize to: `snake_case` with correct English spelling
```
admin → admin ✅
reception → reception ✅
booking_personnel → booking_personnel (fix typo)
master_personnel → master_personnel (fix typo)
```

---

### 7. **HARDCODED LAB NAME IN TESTS**
**Status:** Makes tests inflexible

```typescript
// ❌ Hardcoded:
const LAB = 'Arbro - Delhi';
await loginAs(page, context, roleKey, env, LAB);

// ✅ Should be:
const LAB = env.LAB_NAME || 'Arbro - Delhi';
```

---

### 8. **MISSING ERROR BOUNDARY HANDLING**
**Status:** Tests don't validate error messages

```typescript
// Current: Tests only check for 403 in body text
async isPageAccessible(): Promise<boolean> {
  const text = await this.page.locator('body').textContent() || '';
  return !text.includes('403') && text.length > 50;
}

// ✅ Should also capture error types:
// - 401: Unauthorized
// - 403: Forbidden (no permission)
// - 404: Not found
// - 500: Server error
```

---

## 📊 STATISTICS

| Category | Count | Status |
|----------|-------|--------|
| Total Test Files | 31+ | ⚠️ Many duplicates |
| Module Tests | 12+ | ⚠️ 6 duplicates identified |
| RBAC Tests | 14 | ✅ Unique |
| Helper Classes | 14 | ✅ Well-structured |
| Total Test Cases | ~2,205 | ⚠️ Duplicate counts |
| Environment Files | 2 | ✅ Present (.env.uat, .env.dev) |
| Test Data Records | 9 modules | ⚠️ Incomplete |

---

## ✅ FIXES TO IMPLEMENT (Priority Order)

### Phase 1: Critical (Do First - Tests Won't Run Otherwise)
- [ ] Fix playwright.config.ts: Add `metadata: devEnv/uatEnv` to projects
- [ ] Remove 20+ duplicate test files (keep only canonical versions)
- [ ] Fix role key typos (personel → personnel, manger → manager, etc.)

### Phase 2: High (Do Soon - Tests Will Fail Unexpectedly)
- [ ] Replace generic selectors with specific ones
- [ ] Implement selector registry with fallback chains
- [ ] Add `data-testid` attributes to app (coordinate with frontend)
- [ ] Add comprehensive test data for negative scenarios
- [ ] Standardize role naming convention

### Phase 3: Medium (Nice to Have - Best Practices)
- [ ] Add error boundary handling for different error types
- [ ] Implement page object model consistently
- [ ] Add test retry logic for flaky tests
- [ ] Add screenshot/video on failure (already configured)
- [ ] Add detailed logging for debugging

---

## 📝 QUICK START FIXES

```bash
# 1. Remove duplicate test files:
cd tests/modules/
rm -f generic-master.spec.ts GENERIC-MASTER-EXAMPLE.spec.ts
rm -f indent_management.spec.ts indent-management.spec.ts (keep only one)
rm -f ALL-MODULES-*.spec.ts COMPREHENSIVE-*.spec.ts MASTER-*.spec.ts REAL-*.spec.ts

# 2. Verify remaining files use consistent naming:
ls -1 tests/modules/*.spec.ts | sort

# 3. Test that tests can run:
npx playwright test --project=uat tests/modules/002-generic-master.spec.ts
```

---

## 🎯 RECOMMENDATIONS

1. **Immediate:** Fix critical issues (Phase 1) before running tests
2. **Short-term:** Implement Phase 2 fixes for test stability
3. **Long-term:** Consider architectural improvements (Phase 3)
4. **Collaboration:** Work with frontend team on test ID strategy
5. **Documentation:** Add selector documentation for maintenance

---

**Next Steps:** Proceed with Phase 1 fixes immediately.

