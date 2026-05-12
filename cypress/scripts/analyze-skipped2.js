const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../reports/technical-report.json')));

// Find the DepartmentHead result and dump first few test objects raw
function walk(suite, arr, maxDepth) {
  (suite.tests || []).forEach(t => {
    if (arr.length < 6) arr.push(t);
  });
  if (maxDepth > 0) {
    (suite.suites || []).forEach(s => walk(s, arr, maxDepth - 1));
  }
}

const deptResult = data.results.find(r => r.file && r.file.includes('DepartmentHead'));
if (deptResult) {
  console.log('=== DepartmentHead raw structure ===');
  const tests = [];
  deptResult.suites.forEach(s => walk(s, tests, 5));
  tests.slice(0, 4).forEach((t, i) => {
    console.log(`\nTest ${i+1}:`);
    console.log('  fullTitle:', t.fullTitle);
    console.log('  state:', t.state);
    console.log('  pending:', t.pending);
    console.log('  skipped:', t.skipped);
    console.log('  pass:', t.pass);
    console.log('  fail:', t.fail);
    console.log('  err:', JSON.stringify(t.err || null).substring(0, 200));
  });
}

// Also compare a PASSING spec to see the difference
const analystResult = data.results.find(r => r.file && r.file.includes('Analyst'));
if (analystResult) {
  console.log('\n=== Analyst raw structure (passing) ===');
  const tests = [];
  analystResult.suites.forEach(s => walk(s, tests, 5));
  tests.slice(0, 2).forEach((t, i) => {
    console.log(`\nTest ${i+1}:`);
    console.log('  fullTitle:', t.fullTitle);
    console.log('  state:', t.state);
    console.log('  pending:', t.pending);
    console.log('  skipped:', t.skipped);
    console.log('  pass:', t.pass);
    console.log('  fail:', t.fail);
  });
}

// Check the stats for DepartmentHead specifically
if (deptResult) {
  console.log('\n=== DepartmentHead suite stats ===');
  console.log(JSON.stringify(deptResult.suites[0] ? {
    title: deptResult.suites[0].title,
    stats: deptResult.suites[0].stats,
    testCount: (deptResult.suites[0].tests || []).length,
    subSuiteCount: (deptResult.suites[0].suites || []).length
  } : 'no suite', null, 2));
}
