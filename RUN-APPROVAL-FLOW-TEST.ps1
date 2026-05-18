# Run Approval Flow RBAC Test for all 19 roles × 2 modules

Write-Host "🔐 APPROVAL FLOW RBAC TEST" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Roles:   19 (All roles)" -ForegroundColor Yellow
Write-Host "Modules: 2 (Generic Master, STP Master)" -ForegroundColor Yellow
Write-Host "Tests:   38 (19 roles × 2 modules)" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

$StartTime = Get-Date

Write-Host "🚀 Starting test suite..." -ForegroundColor Green
Write-Host "Expected time: 15-20 minutes`n" -ForegroundColor Green

# Run the approval flow test
npx playwright test tests/rbac/APPROVAL-FLOW-RBAC.spec.ts `
  --workers=1 `
  --project=uat `
  --reporter=list `
  --reporter=html

$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host "`n════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ TEST SUITE COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Duration: $($Duration.TotalMinutes.ToString('F1')) minutes`n" -ForegroundColor Green

Write-Host "📊 REPORTS GENERATED:" -ForegroundColor Yellow
Write-Host "  1️⃣  Console Report:       Above (summary table)" -ForegroundColor Cyan
Write-Host "  2️⃣  JSON Report:         ./approval-flow-report.json" -ForegroundColor Cyan
Write-Host "  3️⃣  HTML Report:         ./playwright-report/index.html" -ForegroundColor Cyan
Write-Host ""

Write-Host "📖 To view detailed HTML report:" -ForegroundColor Yellow
Write-Host "  npx playwright show-report" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 To view JSON report:" -ForegroundColor Yellow
Write-Host "  cat approval-flow-report.json" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Report Structure:" -ForegroundColor Yellow
Write-Host "  ├─ Each Role tested against each Module" -ForegroundColor Green
Write-Host "  ├─ Grant APPROVE permission → Approve succeeds" -ForegroundColor Green
Write-Host "  ├─ Revoke APPROVE permission → Approve fails" -ForegroundColor Green
Write-Host "  ├─ Pass Rate: X% (X passed, Y failed)" -ForegroundColor Green
Write-Host "  └─ Detailed error messages for failures" -ForegroundColor Green
