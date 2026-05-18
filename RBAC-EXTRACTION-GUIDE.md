# YLIMS RBAC Data Extraction Guide

**Created:** May 18, 2026  
**Purpose:** Extract complete role-based access control configuration from YLIMS UAT  
**Automation:** Playwright-based browser automation

---

## 🎯 WHAT THIS DOES

Automatically extracts and consolidates all RBAC configuration from YLIMS:

**Execution Time:** ~20-25 minutes  
**Input:** YLIMS UAT system  
**Output:** 5 configuration files + screenshots

---

## ✅ PREREQUISITES

- ✓ Playwright installed (`npm install`)
- ✓ `.env.uat` configured with admin credentials
- ✓ Network access to `https://uat.ylims.com`
- ✓ Admin role has access to Role Management

---

## 🚀 HOW TO RUN

### Option 1: PowerShell Script (Recommended)
```powershell
cd d:\Harry\OneDrive\Desktop\Auriga Cypress
.\RUN-RBAC-EXTRACTION.ps1
```

### Option 2: Direct Playwright Command
```bash
npx playwright test tests/rbac/extract-rbac-data.spec.ts --project=uat
```

### Option 3: Headed Mode (See Browser Activity)
```bash
npx playwright test tests/rbac/extract-rbac-data.spec.ts --project=uat --headed
```

---

## 📁 OUTPUT FILES

Generated in `extracted-data/` directory:

1. **master-rbac-config.json** - Complete RBAC configuration (19 roles × 46 modules)
2. **rbac-config.ts** - TypeScript constants and type definitions
3. **rbac-service.ts** - RBAC service implementation template
4. **rbac-schema.sql** - Database schema with auto-generated INSERT statements
5. **extraction-validation-report.json** - Completeness validation and statistics
6. **Screenshots** - Visual confirmation of extraction steps

---

## 📊 EXPECTED RESULTS

| Metric | Expected |
|--------|----------|
| Roles Extracted | 19 ✓ |
| Modules Found | 46 ✓ |
| Permission Types | 5-7 ✓ |
| Permission Mappings | 1000+ ✓ |
| Selectors Captured | 100+ ✓ |

---

## 💡 USING THE EXTRACTED DATA

### In Your Tests
```typescript
import { ROLES, ROLE_MODULE_PERMISSIONS } from './extracted-data/rbac-config';

const hasAccess = ROLE_MODULE_PERMISSIONS[ROLES.ADMIN]['dashboard'];
```

### In Your Application
```typescript
import { RBACService } from './extracted-data/rbac-service';

const rbac = new RBACService();
if (rbac.hasPermission(userId, 'dashboard', 'view')) {
  // Show dashboard
}
```

---

## 🎯 READY TO RUN!

```powershell
.\RUN-RBAC-EXTRACTION.ps1
```

All configuration files will be generated in `extracted-data/` within 20-25 minutes.

**Status:** ✅ Ready for execution
