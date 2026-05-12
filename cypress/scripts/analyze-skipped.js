const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../reports/technical-report.json')));

function walk(suite, arr, level) {
  (suite.tests || []).forEach(t => {
    if (t.skipped) arr.push({ title: t.fullTitle, suite: suite.title });
  });
  (suite.suites || []).forEach(s => walk(s, arr, level + 1));
}

const byFile = {};
data.results.forEach(r => {
  const skipped = [];
  r.suites.forEach(s => walk(s, skipped, 0));
  if (skipped.length > 0) {
    const fn = r.file.replace(/.*[/\\]/, '');
    byFile[fn] = skipped.length;
  }
});

console.log('\n=== SKIPPED TEST COUNTS BY SPEC FILE ===');
Object.entries(byFile).sort((a, b) => b[1] - a[1]).forEach(([f, n]) => {
  console.log(n + '\t' + f);
});
const total = Object.values(byFile).reduce((a, b) => a + b, 0);
console.log('\nTotal skipped across all files:', total);

// Also check if there are any beforeEach/hook failures that might cause skips
console.log('\n=== CHECKING FOR HOOK FAILURES ===');
function walkForHookFails(suite, file) {
  const hooks = (suite.beforeEach || []).concat(suite.before || []);
  hooks.forEach(h => {
    if (h.err || (h.state && h.state !== 'passed')) {
      console.log('HOOK FAIL in', file, ':', h.title, '-', JSON.stringify(h.err || h.state));
    }
  });
  (suite.suites || []).forEach(s => walkForHookFails(s, file));
}
data.results.forEach(r => {
  const fn = r.file.replace(/.*[/\\]/, '');
  r.suites.forEach(s => walkForHookFails(s, fn));
});
