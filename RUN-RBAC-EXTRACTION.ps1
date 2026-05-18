# YLIMS RBAC Data Extraction Script
# Extracts complete role-based access control configuration from UAT

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔐 YLIMS RBAC DATA EXTRACTION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 TASK BREAKDOWN:" -ForegroundColor Yellow
Write-Host "  ✓ Step 1: Navigate and authenticate as admin" -ForegroundColor Green
Write-Host "  ✓ Step 2: Navigate to Role Management page" -ForegroundColor Green
Write-Host "  ✓ Step 3: Extract all 19 roles with data" -ForegroundColor Green
Write-Host "  ✓ Step 4: For each role, extract modules and permissions" -ForegroundColor Green
Write-Host "  ✓ Step 5: Consolidate and validate data" -ForegroundColor Green
Write-Host "  ✓ Step 6: Generate TypeScript configuration" -ForegroundColor Green
Write-Host "  ✓ Step 7: Generate RBAC Service template" -ForegroundColor Green
Write-Host "  ✓ Step 8: Generate database schema SQL" -ForegroundColor Green
Write-Host ""

Write-Host "📊 EXPECTED OUTPUT:" -ForegroundColor Yellow
Write-Host "  - extracted-data/master-rbac-config.json" -ForegroundColor Cyan
Write-Host "  - extracted-data/rbac-config.ts" -ForegroundColor Cyan
Write-Host "  - extracted-data/rbac-service.ts" -ForegroundColor Cyan
Write-Host "  - extracted-data/rbac-schema.sql" -ForegroundColor Cyan
Write-Host "  - extracted-data/extraction-validation-report.json" -ForegroundColor Cyan
Write-Host "  - extracted-data/*.png (screenshots)" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏱️ ESTIMATED TIME:" -ForegroundColor Yellow
Write-Host "  ~20-25 minutes (60 seconds per role × 19 roles + consolidation)" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 STARTING EXTRACTION..." -ForegroundColor Green
Write-Host ""

$StartTime = Get-Date

# Run the Playwright test
npx playwright test tests/rbac/extract-rbac-data.spec.ts `
  --workers=1 `
  --project=uat `
  --reporter=verbose

$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ RBAC DATA EXTRACTION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "⏱️ DURATION: $($Duration.TotalMinutes.ToString('F1')) minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "📂 EXTRACTED FILES:" -ForegroundColor Yellow
if (Test-Path "extracted-data") {
  Write-Host "  ✓ extracted-data/ directory created" -ForegroundColor Green
  $files = @(Get-ChildItem -Path "extracted-data" -File)
  foreach ($file in $files) {
    $size = "{0:N2} KB" -f ($file.Length / 1024)
    Write-Host "    - $($file.Name) ($size)" -ForegroundColor Cyan
  }
} else {
  Write-Host "  ⚠️ extracted-data/ directory not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Review master-rbac-config.json for completeness" -ForegroundColor Cyan
Write-Host "  2. Integrate rbac-config.ts into your application" -ForegroundColor Cyan
Write-Host "  3. Implement rbac-service.ts methods" -ForegroundColor Cyan
Write-Host "  4. Run rbac-schema.sql to set up database" -ForegroundColor Cyan
Write-Host "  5. Check extraction-validation-report.json for any issues" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 VALIDATION:" -ForegroundColor Yellow
if (Test-Path "extracted-data/extraction-validation-report.json") {
  $report = Get-Content "extracted-data/extraction-validation-report.json" | ConvertFrom-Json
  Write-Host "  Overall Status: $($report.validation.overallStatus)" -ForegroundColor Green
  Write-Host "  Roles Extracted: $($report.statistics.totalPermissionAssignments)" -ForegroundColor Green
} else {
  Write-Host "  ⚠️ Validation report not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ EXTRACTION READY FOR NEXT PHASE!" -ForegroundColor Green
Write-Host ""
