# Enhanced RBAC Extraction - Complete Module Coverage

**Objective:** Extract all 46 modules (not just 3) with complete role-permission mappings  
**Status:** Ready to Execute  
**Expected Time:** 25-30 minutes  
**Output:** 100% module coverage

---

## 📋 What's Different

### Previous Extraction (3 modules)
- Only captured modules visible in role edit forms
- Missing 43 modules (97% incomplete)
- Status: PARTIAL ⚠️

### Enhanced Extraction (46 modules)
- **NEW:** Scans Module Management section for all modules
- **NEW:** Extracts comprehensive module list before processing roles
- **NEW:** Cross-references roles against complete module list
- **NEW:** Includes empty permission sets for unassigned modules
- Status: COMPLETE ✅ (target)

---

## 🚀 How to Run

### Method 1: PowerShell (Recommended)

```powershell
# Navigate to project
cd "d:\Harry\OneDrive\Desktop\Auriga Cypress"

# Run enhanced extraction
npx playwright test tests/rbac/extract-rbac-data.spec.ts --project=uat

# Or with output
npx playwright test tests/rbac/extract-rbac-data.spec.ts --project=uat --reporter=list
```

### Method 2: Headed Mode (For Monitoring)

```bash
npx playwright test tests/rbac/extract-rbac-data.spec.ts --headed --project=uat
```
This will show the browser window so you can see exactly what's being extracted.

### Method 3: Debug Mode (For Troubleshooting)

```bash
npx playwright test tests/rbac/extract-rbac-data.spec.ts --debug --project=uat
```
Opens Playwright Inspector for step-by-step debugging.

---

## 📊 Extraction Steps

The enhanced script now follows this workflow:

### STEP 1: Authenticate as Admin ✅
- Logs in to YLIMS UAT
- Verifies dashboard loaded
- Creates: `extracted-data/01-logged-in.png`

### STEP 2: Extract All 46 Modules **[NEW]** 🆕
Implements **three strategies** to ensure complete module coverage:

**Strategy 1: Module Management Section**
```
If Module Management exists:
  → Navigate to Module Management
  → Enumerate all modules with names/codes
  → Capture module descriptions
  → Store in comprehensive registry
```

**Strategy 2: Role Permission Matrices**
```
Navigate to Role Management:
  → For each of first 3 roles:
    → Open role edit form
    → Extract all visible modules
    → Map module IDs to names
    → Add to comprehensive registry
```

**Strategy 3: Cross-Reference**
```
Consolidate extracted modules:
  → Remove duplicates by moduleId
  → Merge module metadata
  → Create master module list
  → Store for role processing
```

### STEP 3: Navigate to Role Management ✅
- Finds Role Management section
- Displays role count
- Creates: `extracted-data/02-role-management-list.png`

### STEP 4: Extract All 19 Roles **[ENHANCED]** 
- For each of 19 roles:
  - Opens role edit form
  - Captures all module permissions
  - **NEW:** Cross-references against complete module list
  - **NEW:** Includes empty permission sets for unassigned modules
  - Closes role and returns to list

### STEP 5: Consolidate Data ✅
- Calculates comprehensive statistics
- Counts total modules (should be ~46)
- Generates: `master-rbac-config.json`

### STEP 6: Generate TypeScript Config ✅
- Creates: `rbac-config.ts`
- Full type definitions
- 46 module constants (instead of 3)

### STEP 7: Generate RBAC Service ✅
- Creates: `rbac-service.ts`
- Production-ready service class

### STEP 8: Generate Database Schema ✅
- Creates: `rbac-schema.sql`
- 46 module INSERT statements
- Complete role-module-permission mappings

### STEP 9: Generate Validation Report **[ENHANCED]** 
- Creates: `extraction-validation-report.json`
- **NEW:** Checks for all 46 modules
- Status: PASS (if 46), EXCELLENT (if ≥40), PARTIAL (if <40)
- Detailed module count breakdown

---

## ✅ Expected Output

### Success Indicators

When extraction completes successfully, you should see:

```
STEP 1: Authenticating as admin...
  ✅ Authentication successful

STEP 2: Extracting all modules from system...
  → Checking Module Management section...
    Found 46 modules in Module Management  ← TARGET
  → Gathering modules from role permission matrices...
  → Found 19 roles to scan for modules
  ✅ Extracted 46 unique modules
    - dashboard: Dashboard
    - generic-master: Generic Master
    - stp-master: STP Master
    - [43 more modules listed]

STEP 3: Navigating to Role Management...
  ✅ Found 19 roles on list

STEP 4: Extracting 19 roles with module permissions...
  ⏳ Processed role 1 of 19
  ⏳ Processed role 2 of 19
  ...
  ⏳ Processed role 19 of 19
  ✅ Extracted 19 roles

STEP 5: Saving extracted data with all modules...
  ✅ Saved: master-rbac-config.json
     - Roles: 19
     - Modules: 46  ← CONFIRMATION
     - Permissions: 6
     - Mappings: 150+

STEP 6: Generating TypeScript configuration...
  ✅ Generated: rbac-config.ts

STEP 7: Generating RBAC Service...
  ✅ Generated: rbac-service.ts

STEP 8: Generating database schema...
  ✅ Generated: rbac-schema.sql

STEP 9: Generating validation report...
  ✅ Generated: extraction-validation-report.json
     Overall Status: PASS
```

### Files Generated

All generated files will be in `extracted-data/`:

| File | Size | Content |
|------|------|---------|
| `master-rbac-config.json` | ~50 KB | Complete RBAC data with all 46 modules |
| `rbac-config.ts` | ~20 KB | TypeScript constants (46 modules) |
| `rbac-service.ts` | ~8 KB | RBAC service class |
| `rbac-schema.sql` | ~20 KB | Database schema with 46 modules |
| `extraction-validation-report.json` | ~10 KB | Validation metrics |
| `01-logged-in.png` | - | Screenshot of authenticated state |
| `02-role-management-list.png` | - | Screenshot of role list |

---

## 🔧 Troubleshooting

### Issue: Only 3 modules extracted (old behavior)

**Cause:** Module Management section not found or script used old logic

**Solution:**
1. Verify STEP 2 output shows module enumeration
2. Check `.env.uat` has correct BASE_URL
3. Ensure admin account can access Module Management
4. Check browser console for errors (run with `--headed`)

### Issue: Roles found but modules are incomplete

**Cause:** Role edit forms don't display all 46 modules

**Solution:**
1. Check if YLIMS UI pagination/scrolling needed
2. Review STEP 2 output - did Module Management load?
3. Check if modules are filtered by lab/department
4. Verify all roles loaded completely (all 19)

### Issue: Database schema has duplicate modules

**Cause:** Module deduplication issue in consolidation

**Solution:**
1. Check STEP 5 output for duplicate moduleIds
2. Verify extraction strategy 3 (cross-reference) ran
3. Look for modules with same ID but different names

### Issue: Permission mappings are incomplete

**Cause:** Role edit forms cut off by UI height

**Solution:**
1. Run with `--headed` flag to see UI
2. Check if scrolling/pagination needed in permission list
3. Increase timeout if YLIMS is slow
4. Verify role edit form loads completely

### If Stuck

**Enable Debug Mode:**
```bash
PWDEBUG=1 npx playwright test tests/rbac/extract-rbac-data.spec.ts --headed
```

**Check Logs:**
- Console output during extraction shows detailed progress
- Screenshots saved in `extracted-data/` directory
- Look for ERROR lines in console output

---

## 📈 Quality Metrics

### Success Criteria

| Metric | Target | Check |
|--------|--------|-------|
| Roles Extracted | 19 | `extraction-validation-report.json` > `rolesCount.actual` |
| Modules Extracted | 46 | `extraction-validation-report.json` > `modulesCount.actual` |
| Permissions Mapped | 50+ | `rbac-schema.sql` has 50+ INSERT statements |
| Null Values | 0 | `extraction-validation-report.json` > `nullValues.count` |
| Data Integrity | PASS | `extraction-validation-report.json` > `dataIntegrity.status` |

### Post-Extraction Verification

After extraction completes, verify:

```typescript
// Check 1: Open master-rbac-config.json
// Should have roles[0].modules array with 46 entries (many empty)

// Check 2: Review rbac-config.ts
// Should have ~46 module constants
// Example: MODULES.DASHBOARD, MODULES.GENERIC_MASTER, etc.

// Check 3: Count modules in rbac-schema.sql
// Should have ~46 INSERT statements in modules table
grep "INSERT INTO modules" extracted-data/rbac-schema.sql | wc -l

// Check 4: Review validation report
// modulesCount.status should be "PASS" or "EXCELLENT"
// modulesCount.actual should be 46 (or >= 40)
```

---

## 🔄 What Changes from Previous Extraction

### In `master-rbac-config.json`

**Before:**
```json
{
  "roles": [
    {
      "roleId": "admin",
      "modules": [
        { "moduleId": "dashboard", ... },
        { "moduleId": "generic-master", ... },
        { "moduleId": "stp-master", ... }
      ]
    }
  ]
}
```
**After:**
```json
{
  "roles": [
    {
      "roleId": "admin",
      "modules": [
        { "moduleId": "dashboard", ... },
        { "moduleId": "generic-master", ... },
        { "moduleId": "stp-master", ... },
        { "moduleId": "module-4", "permissions": [] },
        { "moduleId": "module-5", "permissions": [] },
        // ... 41 more modules
      ]
    }
  ]
}
```

### In `rbac-config.ts`

**Before:**
```typescript
export const MODULES = {
  DASHBOARD: 'dashboard',
  GENERIC_MASTER: 'generic-master',
  STP_MASTER: 'stp-master',
} as const;
```

**After:**
```typescript
export const MODULES = {
  DASHBOARD: 'dashboard',
  GENERIC_MASTER: 'generic-master',
  STP_MASTER: 'stp-master',
  MODULE_4: 'module-4',
  MODULE_5: 'module-5',
  // ... 41 more
} as const;
```

### In Validation Report

**Before:**
```json
{
  "modulesCount": {
    "expected": 46,
    "actual": 3,
    "status": "PARTIAL"
  }
}
```

**After:**
```json
{
  "modulesCount": {
    "expected": 46,
    "actual": 46,
    "status": "PASS",
    "details": "All 46 modules successfully extracted"
  }
}
```

---

## ⏱️ Timeline

| Step | Time | Action |
|------|------|--------|
| 0:00-0:15 | **15 min** | 🔐 Auth + Module Extraction (STEP 1-2) |
| 0:15-0:20 | **5 min** | 📋 Navigate & List Roles (STEP 3) |
| 0:20-0:25 | **5 min** | 🔍 Extract 19 roles (STEP 4) |
| 0:25-0:28 | **3 min** | 💾 Consolidate data (STEP 5) |
| 0:28-0:30 | **2 min** | ⚙️ Generate configs (STEP 6-9) |
| **Total** | **~30 min** | 🎉 Complete with all 46 modules |

---

## 🎯 Next Steps After Extraction

1. **Verify Output** (2 min)
   - Check `extraction-validation-report.json`
   - Confirm `modulesCount.actual === 46`

2. **Update Configuration Files** (5 min)
   - Review `rbac-config.ts` for all 46 modules
   - Check `rbac-schema.sql` for module inserts

3. **Deploy New Schema** (10 min)
   ```bash
   mysql -u root -p ylims < extracted-data/rbac-schema.sql
   ```

4. **Update Test Framework** (30 min)
   - Import updated `rbac-config.ts`
   - Update tests to use all 46 modules
   - Run `rbac-config-example.spec.ts` to verify

5. **Commit Changes** (5 min)
   ```bash
   git add extracted-data/
   git commit -m "Extract all 46 modules - complete RBAC configuration"
   ```

---

## 📞 Support

**Questions about the extraction?**
- Review this guide for detailed steps
- Check troubleshooting section for common issues
- Run with `--headed` flag to see UI interactions
- Use `--debug` flag for step-by-step debugging

**After extraction completes:**
- Review validation report for quality metrics
- Check file sizes (should be larger than before)
- Compare outputs with this guide expectations
- Verify all 46 modules in generated files

---

**Status:** ✅ Enhanced extraction ready to execute  
**Target:** 46 modules (vs current 3)  
**Expected Duration:** 25-30 minutes  
**Risk:** Low (non-destructive read-only operation)

Ready to extract? Run:
```bash
npx playwright test tests/rbac/extract-rbac-data.spec.ts --project=uat
```
