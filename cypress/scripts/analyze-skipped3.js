const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../reports/technical-report.json')));

function walk(suite, passed, failed, skipped) {
  (suite.tests || []).forEach(t => {
    if (t.skipped) skipped.push(t.fullTitle);
    else if (t.pass) passed.push(t.fullTitle);
    else if (t.fail) failed.push({ title: t.fullTitle, err: (t.err || {}).message || '' });
  });
  (suite.suites || []).forEach(s => walk(s, passed, failed, skipped));
}

const AFFECTED = ['DepartmentHead', 'DepartmentReviewer', 'QualityManger', 'QualityPersonal'];

AFFECTED.forEach(role => {
  const result = data.results.find(r => r.file && r.file.includes(role));
  if (!result) { console.log(role + ': NOT FOUND'); return; }
  const passed = [], failed = [], skipped = [];
  result.suites.forEach(s => walk(s, passed, failed, skipped));
  console.log('\n=== ' + role + ' ===');
  console.log('passed:', passed.length, ' | failed:', failed.length, ' | skipped:', skipped.length);
  failed.forEach(f => {
    console.log('  FAILED:', f.title);
    console.log('    Error:', f.err.substring(0, 300));
  });
});
