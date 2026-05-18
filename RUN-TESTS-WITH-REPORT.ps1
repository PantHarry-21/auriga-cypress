# Run all 11,688 tests with screenshots, videos, and detailed reporting

Write-Host "🎬 Starting full test suite with VIDEO and SCREENSHOT capture..." -ForegroundColor Green
Write-Host "Tests: 11,688 | Workers: 4 | Expected Time: 40-50 minutes" -ForegroundColor Cyan
Write-Host ""

$StartTime = Get-Date

# Run tests with HTML report and JSON output
npx playwright test tests/ `
  --workers=4 `
  --project=uat `
  --reporter=html `
  --reporter=json `
  --reporter=junit `
  --retries=1

$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host ""
Write-Host "✅ Test Suite Complete!" -ForegroundColor Green
Write-Host "Duration: $($Duration.TotalMinutes) minutes" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Report Files Generated:" -ForegroundColor Yellow
Write-Host "  ✅ HTML Report:  ./playwright-report/index.html" -ForegroundColor Cyan
Write-Host "  ✅ JSON Report:  ./test-results.json" -ForegroundColor Cyan
Write-Host "  ✅ JUnit Report: ./junit.xml" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎬 Each test includes:" -ForegroundColor Yellow
Write-Host "  ✅ Screenshots (on every page load)" -ForegroundColor Green
Write-Host "  ✅ Video recording (full test execution)" -ForegroundColor Green
Write-Host "  ✅ Trace file (for debugging)" -ForegroundColor Green
Write-Host "  ✅ Console logs" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 View the interactive report:" -ForegroundColor Yellow
Write-Host "  npx playwright show-report" -ForegroundColor Cyan
Write-Host ""

# Automatically open the report
Write-Host "Opening report now..." -ForegroundColor Green
Start-Process "./playwright-report/index.html"
