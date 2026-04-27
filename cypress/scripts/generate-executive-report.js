const fs = require('fs');
const path = require('path');

const REPORT_DIR     = path.join(__dirname, '../reports');
const OUTPUT_FILE    = path.join(REPORT_DIR, 'Executive-Dashboard.html');
const BUG_REPORT_FILE = path.join(REPORT_DIR, 'Bug-Report.html');

// ── RCA classifier ────────────────────────────────────────────────────────────
// Returns { category, rca, suggestion } for a Cypress error message.
function classifyError(message = '', testTitle = '', isForbidden = false) {
    const m = message;

    if (isForbidden) {
        // A forbidden-module test failed = the role COULD access the module
        if (/expected.*to be true/i.test(m) || /expected.*denied.*true/i.test(m) ||
            /expected.*access.*true/i.test(m)) {
            return {
                category: '🔓 Access Not Restricted',
                rca: 'The application rendered the module for an unauthorized role. The access-denied check passed — meaning neither a "table" was absent nor did the page show an authorization error. The RBAC layer is not enforcing this restriction at the route level.',
                suggestion: 'Verify server-side route guard and frontend permission check for this module. Ensure the backend returns 403 and the frontend redirects or hides the route.'
            };
        }
        if (/find element.*table|table.*never found|no.*table/i.test(m) === false &&
            /timed out/i.test(m)) {
            return {
                category: '🔓 Access Not Restricted (Timeout)',
                rca: 'The forbidden-module test timed out during the access verification check. The page may have loaded without restriction but was slow to respond, or the test assertion was not reached.',
                suggestion: 'Re-run the test to confirm. If consistently failing, increase timeout or inspect the page response when this role accesses the route.'
            };
        }
        return {
            category: '🔓 Access Not Restricted',
            rca: 'The forbidden module check failed. The application did not return an access-denied state (no absence of table, no 403/forbidden text). The module is accessible to a role that should not have access.',
            suggestion: 'Audit the route guard configuration for this module and ensure the backend permission middleware rejects requests from this role.'
        };
    }

    // Allowed-module tests ─────────────────────────────────────────────────────

    if (/hidden from view/i.test(m)) {
        return {
            category: '👁️ Element Hidden / Covered',
            rca: 'A clickable element (table row) was found but its center was obscured by another element — likely a sticky header, modal backdrop, floating toolbar, or z-index overlay. The permission exists but the UI interaction cannot complete.',
            suggestion: 'Check for overlapping elements on this page. A common fix is scrolling the element into view or using `{ force: true }` temporarily to confirm the permission logic is correct, then fixing the UI obstruction.'
        };
    }

    if (/never found it|find element.*`table`|expected to find.*table/i.test(m)) {
        return {
            category: '📭 Table Not Rendered',
            rca: 'The module\'s data table did not appear within the timeout period. Possible causes: (1) no records exist in the test environment for this role to see, (2) the page loaded an empty/error state, (3) the table selector changed after a UI update, or (4) the backend returned no data for this role\'s scope.',
            suggestion: 'Manually log in as this role and verify the module shows data. If the table is empty by design, seed test data. If it\'s a selector mismatch, update the page object\'s listSelector.'
        };
    }

    if (/timed out retrying.*`cy\.click\(\)`|click.*timed out/i.test(m)) {
        return {
            category: '⏱️ Click Timed Out',
            rca: 'The click action timed out waiting for the element to become interactable. The element may have been in a loading/transition state, or a spinner/overlay was blocking it intermittently.',
            suggestion: 'Add a `cy.wait` for loading indicators before the click, or increase the actionability timeout. Confirm no loading spinner overlaps the element at the time of interaction.'
        };
    }

    if (/expected.*false.*equal.*true|expected false to equal true/i.test(m)) {
        return {
            category: '🚫 Button / Action Not Present',
            rca: 'The CRUDA permission check asserted that a specific button or action (create/update/delete/approve) should be visible and enabled, but it was not found. The backend may not be returning the correct permission flag for this role, or the UI is not rendering the control.',
            suggestion: 'Log into the application as this role and check whether the button is actually visible on the page. Compare the returned permissions object in the API response against the RBAC matrix.'
        };
    }

    if (/expected.*true.*equal.*false|expected true to equal false/i.test(m)) {
        return {
            category: '⚠️ Action Unexpectedly Allowed',
            rca: 'The CRUDA check expected a button/action to be absent (CANNOT), but the control was found visible. The application is granting a permission it should not — a potential over-permission bug.',
            suggestion: 'Verify the permission matrix for this role and module. If the role truly should not have this action, raise a backend RBAC configuration bug.'
        };
    }

    if (/network error|xhr.*failed|fetch.*failed|econnrefused/i.test(m)) {
        return {
            category: '🌐 Network / API Error',
            rca: 'An API call failed during the test. The backend server may have been temporarily unavailable, or a specific endpoint returned an unexpected error for this role.',
            suggestion: 'Check server logs around the test timestamp. Verify the API endpoint works for this role via Postman or the browser network tab.'
        };
    }

    if (/timed out/i.test(m)) {
        return {
            category: '⏱️ General Timeout',
            rca: 'The test exceeded its timeout waiting for an element or assertion. This could be due to slow page load, heavy API response, or a rendering delay specific to this role\'s data volume.',
            suggestion: 'Check network response times for this module. Consider increasing defaultCommandTimeout for heavy pages, or investigate if a background process is blocking the UI.'
        };
    }

    if (/not authorized|forbidden|403|access denied/i.test(m)) {
        return {
            category: '🔒 Unexpected 403 / Access Denied',
            rca: 'The application returned an access-denied response for a module this role should be able to access. The permission was granted in the RBAC matrix but the backend is rejecting the request.',
            suggestion: 'Check the backend role-permission mapping for this module. Verify the role\'s JWT/session token contains the correct permission claims.'
        };
    }

    return {
        category: '❓ Unclassified Failure',
        rca: 'The test failed for an unrecognized reason. Review the full error message and stack trace for details.',
        suggestion: 'Inspect the error details and screenshot to diagnose manually.'
    };
}

// ── Extract screenshot from Mochawesome context ────────────────────────────────
function extractFromContext(contextRaw) {
    if (!contextRaw) return { screenshot: null, video: null };
    try {
        const arr = JSON.parse(contextRaw);
        const ss = arr.find(c => typeof c.value === 'string' && c.value.startsWith('data:image'));
        const vid = arr.find(c => typeof c.value === 'string' && /\.mp4$/.test(c.value));
        return { screenshot: ss ? ss.value : null, video: vid ? vid.value : null };
    } catch (_) { return { screenshot: null, video: null }; }
}

// ── Main ──────────────────────────────────────────────────────────────────────
function generateReport() {
    console.log('🚀 Generating Executive RBAC Dashboard v4...');

    if (!fs.existsSync(REPORT_DIR)) {
        console.error('❌ Reports directory not found.');
        return;
    }

    // Locate JSON
    const jsonsDirPath = path.join(REPORT_DIR, '.jsons');
    let fullPath = null;
    if (fs.existsSync(jsonsDirPath)) {
        const jsons = fs.readdirSync(jsonsDirPath).filter(f => f.endsWith('.json'));
        if (jsons.length > 0) fullPath = path.join(jsonsDirPath, jsons[0]);
    }
    if (!fullPath) {
        const rootJsons = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith('.json'));
        if (rootJsons.length > 0) fullPath = path.join(REPORT_DIR, rootJsons[0]);
    }
    if (!fullPath) { console.error('❌ No JSON report found.'); return; }

    let jsonData;
    try { jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8')); }
    catch (e) { console.error('❌ Failed to parse JSON:', e.message); return; }

    // Source of truth
    const fixturesDir = path.join(__dirname, '../fixtures/roles');
    const sourceOfTruth = {};
    if (fs.existsSync(fixturesDir)) {
        fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json')).forEach(file => {
            try { Object.assign(sourceOfTruth, JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'))); }
            catch (e) { console.error(`Error parsing ${file}:`, e); }
        });
    }

    // ── Parse results ─────────────────────────────────────────────────────────
    const roles = {};
    const allModuleNames = new Set();
    let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
    const permissionViolations = [];   // forbidden tests that failed = access control bug
    const capabilityFailures   = [];   // allowed tests that failed = app/data bug
    const passedTests          = [];   // all passing tests with screenshots
    let issueCounter = 0;
    let passCounter  = 0;

    const isForbiddenTest = title => /^CANNOT READ /i.test(title.trim());

    const recordTest = (test, moduleName, roleName) => {
        allModuleNames.add(moduleName);
        if (!roles[roleName].modules[moduleName]) {
            roles[roleName].modules[moduleName] = { pass: [], fail: [], skip: [] };
        }
        const title = test.title.trim();
        const { screenshot, video } = extractFromContext(test.context);

        if (test.pass) {
            roles[roleName].modules[moduleName].pass.push(title);
            roles[roleName].stats.pass++;
            totalPassed++;
            passCounter++;
            passedTests.push({ id: passCounter, role: roleName, module: moduleName, test: title, screenshot, video, duration: test.duration });
        } else if (test.fail) {
            roles[roleName].modules[moduleName].fail.push(title);
            roles[roleName].stats.fail++;
            totalFailed++;
            const errMsg   = test.err?.message   || '';
            const errStack = test.err?.estack     || '';
            const isForbid = isForbiddenTest(title);
            const { category, rca, suggestion } = classifyError(errMsg, title, isForbid);
            issueCounter++;
            const issue = {
                id:         issueCounter,
                role:       roleName,
                module:     moduleName,
                test:       title,
                fullTitle:  test.fullTitle || '',
                category,
                rca,
                suggestion,
                errMsg,
                errStack,
                screenshot,
                video,
                duration:   test.duration,
                isForbidden: isForbid
            };
            if (isForbid) permissionViolations.push(issue);
            else          capabilityFailures.push(issue);
        } else {
            roles[roleName].modules[moduleName].skip.push(title);
            roles[roleName].stats.skip++;
            totalSkipped++;
        }
    };

    const walkSuites = (suites, roleName) => {
        suites.forEach(suite => {
            const suiteName = suite.title.trim();
            if (suiteName.startsWith('Module:')) {
                const modName = suiteName.replace('Module:', '').trim();
                (suite.tests || []).forEach(t => recordTest(t, modName, roleName));
            } else if (suite.tests && suite.tests.length > 0) {
                suite.tests.forEach(t => {
                    const mm = t.title.trim().match(/CANNOT READ (.+)/i);
                    recordTest(t, mm ? mm[1] : suiteName, roleName);
                });
            }
            if (suite.suites?.length) walkSuites(suite.suites, roleName);
        });
    };

    jsonData.results.forEach(result => {
        result.suites.forEach(roleSuite => {
            const rawName = roleSuite.title.replace('Permissions — ', '').trim();
            const roleName = Object.keys(sourceOfTruth).find(k =>
                k.toLowerCase() === rawName.toLowerCase() ||
                k.toLowerCase().replace(/\s+/g, '_') === rawName.toLowerCase()
            ) || rawName;

            if (!roles[roleName]) roles[roleName] = { modules: {}, stats: { pass: 0, fail: 0, skip: 0 } };
            walkSuites(roleSuite.suites || [], roleName);
            (roleSuite.tests || []).forEach(t => {
                if (t.pass) { roles[roleName].stats.pass++; totalPassed++; }
                else if (t.fail) { roles[roleName].stats.fail++; totalFailed++; }
                else { roles[roleName].stats.skip++; totalSkipped++; }
            });
        });
    });

    const allIssues    = [...permissionViolations, ...capabilityFailures];
    const roleList     = Object.keys(roles).sort();
    const totalTests   = totalPassed + totalFailed + totalSkipped;
    const totalExecuted = totalPassed + totalFailed;
    const healthScore  = totalExecuted > 0 ? Math.round((totalPassed / totalExecuted) * 100) : 0;
    const healthColor  = healthScore >= 90 ? '#4ade80' : healthScore >= 70 ? '#facc15' : '#f87171';
    const healthLabel  = healthScore >= 90 ? 'EXCELLENT' : healthScore >= 70 ? 'NEEDS ATTENTION' : 'CRITICAL';

    // Group permission violations by module (for executive preview)
    const bugsByModule = {};
    const bugsByRole   = {};
    permissionViolations.forEach(v => {
        (bugsByModule[v.module] = bugsByModule[v.module] || []).push(v.role);
        (bugsByRole[v.role]     = bugsByRole[v.role]     || []).push(v.module);
    });
    const bugModuleKeys = Object.keys(bugsByModule).sort();
    const bugRoleKeys   = Object.keys(bugsByRole).sort();

    // ── HTML helpers ──────────────────────────────────────────────────────────

    const escHtml = s => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const issueCard = (issue, idx) => {
        const badgeColor = issue.isForbidden ? '#ef4444' : '#f59e0b';
        const badgeText  = issue.isForbidden ? 'ACCESS VIOLATION' : 'CAPABILITY FAILURE';
        const errPreview = escHtml((issue.errMsg || '').split('\n')[0].substring(0, 300));
        const ssHtml = issue.screenshot
            ? `<div style="margin-top:12px">
                 <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Screenshot at failure</div>
                 <img src="${issue.screenshot}" style="max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.1)" loading="lazy" />
               </div>`
            : '';
        const videoHtml = issue.video
            ? `<div style="margin-top:8px;font-size:12px;color:#64748b">📹 Video: ${escHtml(issue.video)}</div>`
            : '';

        return `
        <div class="issue-card glass" id="issue-${issue.id}" style="border-radius:16px;overflow:hidden;margin-bottom:20px;border-left:4px solid ${badgeColor}">
            <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
                <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
                        <span style="background:${badgeColor};color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;letter-spacing:1px">#${issue.id} ${badgeText}</span>
                        <span style="background:rgba(100,116,139,0.2);color:#94a3b8;font-size:11px;padding:3px 8px;border-radius:6px">${escHtml(issue.category)}</span>
                    </div>
                    <div style="font-size:15px;font-weight:700;color:#f1f5f9">${escHtml(issue.module)}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:2px">${escHtml(issue.role)} → <span style="color:#cbd5e1">${escHtml(issue.test)}</span></div>
                </div>
                ${issue.duration ? `<div style="font-size:11px;color:#475569;white-space:nowrap">${(issue.duration/1000).toFixed(1)}s</div>` : ''}
            </div>

            <div style="padding:16px 20px">
                <!-- RCA -->
                <div style="margin-bottom:14px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:6px">Root Cause Analysis</div>
                    <div style="font-size:13px;color:#e2e8f0;line-height:1.6;background:rgba(15,23,42,0.5);padding:12px 14px;border-radius:8px">${escHtml(issue.rca)}</div>
                </div>

                <!-- Suggestion -->
                <div style="margin-bottom:14px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:6px">Recommended Fix</div>
                    <div style="font-size:13px;color:#bae6fd;line-height:1.6;background:rgba(14,165,233,0.08);padding:12px 14px;border-radius:8px;border-left:3px solid #0ea5e9">${escHtml(issue.suggestion)}</div>
                </div>

                <!-- Error -->
                <details style="margin-bottom:4px">
                    <summary style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;cursor:pointer;margin-bottom:6px">Error Message</summary>
                    <div style="font-size:12px;color:#f87171;font-family:monospace;background:rgba(239,68,68,0.06);padding:10px 14px;border-radius:8px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;max-height:120px;overflow-y:auto">${errPreview}</div>
                </details>

                ${ssHtml}
                ${videoHtml}
            </div>
        </div>`;
    };

    const passedCard = (p) => {
        const ssHtml = p.screenshot
            ? `<div style="margin-top:12px">
                 <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Screenshot</div>
                 <img src="${p.screenshot}" style="max-width:100%;border-radius:8px;border:1px solid rgba(74,222,128,0.15)" loading="lazy" />
               </div>`
            : '<div style="margin-top:10px;font-size:12px;color:#475569;font-style:italic">No screenshot captured for this test.</div>';
        return `
        <div class="issue-card glass" style="border-radius:16px;overflow:hidden;margin-bottom:16px;border-left:4px solid #4ade80">
            <div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
                <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
                        <span style="background:#166534;color:#4ade80;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;letter-spacing:1px">#${p.id} ✅ PASSED</span>
                    </div>
                    <div style="font-size:15px;font-weight:700;color:#f1f5f9">${escHtml(p.module)}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:2px">${escHtml(p.role)} → <span style="color:#cbd5e1">${escHtml(p.test)}</span></div>
                </div>
                ${p.duration ? `<div style="font-size:11px;color:#475569;white-space:nowrap">${(p.duration/1000).toFixed(1)}s</div>` : ''}
            </div>
            <div style="padding:14px 20px">${ssHtml}</div>
        </div>`;
    };

    // ── Role cards for executive dashboard ────────────────────────────────────
    const roleCardsHtml = roleList.map(role => {
        const r = roles[role];
        const total = r.stats.pass + r.stats.fail + r.stats.skip;
        const pct = (r.stats.pass + r.stats.fail) > 0 ? Math.round((r.stats.pass / (r.stats.pass + r.stats.fail)) * 100) : 0;
        const barColor = pct >= 90 ? '#4ade80' : pct >= 70 ? '#facc15' : '#f87171';
        const moduleCount = Object.keys(r.modules).length;

        let moduleRows = '';
        Object.keys(r.modules).sort().forEach(mod => {
            const m = r.modules[mod];
            const allTests = [...m.pass, ...m.fail, ...m.skip];
            let cells = '';
            ['CREATE','READ','UPDATE','DELETE','APPROVE'].forEach(act => {
                const canTest      = allTests.find(t => t.includes('CAN ' + act) && !t.includes('CANNOT'));
                const cannotTest   = allTests.find(t => t.includes('CANNOT ' + act));
                const forbidTest   = allTests.find(t => /^CANNOT READ /i.test(t));
                let icon = '—', cls = 'color:#475569';
                if (canTest) {
                    if (m.pass.includes(canTest))      { icon = '✓'; cls = 'color:#4ade80'; }
                    else if (m.fail.includes(canTest)) { icon = '✕'; cls = 'color:#f87171;font-weight:700'; }
                    else                               { icon = '⋯'; cls = 'color:#94a3b8'; }
                } else if (cannotTest) {
                    if (m.pass.includes(cannotTest))      { icon = '⊘'; cls = 'color:#64748b'; }
                    else if (m.fail.includes(cannotTest)) { icon = '⚠'; cls = 'color:#f87171;font-weight:700'; }
                    else                                  { icon = '⋯'; cls = 'color:#94a3b8'; }
                } else if (act === 'READ' && forbidTest) {
                    if (m.pass.includes(forbidTest))      { icon = '⊘'; cls = 'color:#64748b'; }
                    else if (m.fail.includes(forbidTest)) { icon = '⚠'; cls = 'color:#f87171;font-weight:700'; }
                    else                                  { icon = '⋯'; cls = 'color:#94a3b8'; }
                }
                cells += `<td style="text-align:center;padding:6px 10px;${cls};font-size:16px">${icon}</td>`;
            });
            moduleRows += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px 12px;color:#cbd5e1;font-size:13px">${mod}</td>${cells}</tr>`;
        });

        return `
        <div class="glass" style="border-radius:20px;overflow:hidden;margin-bottom:24px">
            <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center">
                <div>
                    <h3 style="margin:0;font-size:18px;font-weight:700;color:#f1f5f9">${role}</h3>
                    <span style="font-size:12px;color:#64748b">${moduleCount} modules · ${total} checks</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                    <div style="width:120px;height:6px;background:#1e293b;border-radius:3px;overflow:hidden">
                        <div style="width:${pct}%;height:100%;background:${barColor};border-radius:3px"></div>
                    </div>
                    <span style="font-size:14px;font-weight:700;color:${barColor}">${pct}%</span>
                </div>
            </div>
            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse">
                    <thead><tr style="background:rgba(15,23,42,0.6)">
                        <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;min-width:180px">Module</th>
                        <th style="padding:8px 10px;text-align:center;color:#3b82f6;font-size:11px;text-transform:uppercase;letter-spacing:1px">C</th>
                        <th style="padding:8px 10px;text-align:center;color:#22c55e;font-size:11px;text-transform:uppercase;letter-spacing:1px">R</th>
                        <th style="padding:8px 10px;text-align:center;color:#f59e0b;font-size:11px;text-transform:uppercase;letter-spacing:1px">U</th>
                        <th style="padding:8px 10px;text-align:center;color:#ef4444;font-size:11px;text-transform:uppercase;letter-spacing:1px">D</th>
                        <th style="padding:8px 10px;text-align:center;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1px">A</th>
                    </tr></thead>
                    <tbody>${moduleRows}</tbody>
                </table>
            </div>
            <div style="padding:12px 24px;display:flex;gap:16px;font-size:11px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05)">
                <span style="color:#4ade80">✓ Passed: ${r.stats.pass}</span>
                <span style="color:#f87171">✕ Failed: ${r.stats.fail}</span>
                <span style="color:#94a3b8">⋯ Skipped: ${r.stats.skip}</span>
                <span style="color:#64748b">⊘ Denied (verified)</span>
            </div>
        </div>`;
    }).join('\n');

    // ── Compliance matrix ─────────────────────────────────────────────────────
    const truthRoles = Object.keys(sourceOfTruth).sort();
    const truthModules = new Set();
    truthRoles.forEach(r => Object.keys(sourceOfTruth[r].modules || {}).forEach(m => truthModules.add(m)));

    const matrixHeaderCells = truthRoles.map(r =>
        `<th style="padding:10px 8px;text-align:center;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #1e293b;min-width:90px">${r}</th>`
    ).join('');

    const matrixRows = Array.from(truthModules).sort().map(mod => {
        const cells = truthRoles.map(role => {
            const perms = (sourceOfTruth[role].modules || {})[mod];
            if (!perms) return `<td style="padding:8px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.03);color:#334155">—</td>`;
            const cruda = [
                perms.create  ? '<span style="color:#3b82f6">C</span>' : '',
                perms.read    ? '<span style="color:#22c55e">R</span>' : '',
                perms.update  ? '<span style="color:#f59e0b">U</span>' : '',
                perms.delete  ? '<span style="color:#ef4444">D</span>' : '',
                perms.approve ? '<span style="color:#a855f7">A</span>' : ''
            ].filter(Boolean).join('');
            return `<td style="padding:8px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.03);font-size:11px;font-weight:700;letter-spacing:1px">${cruda || '<span style="color:#475569">⊘</span>'}</td>`;
        }).join('');
        return `<tr><td style="padding:8px 12px;color:#cbd5e1;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.03);position:sticky;left:0;background:#0f172a;z-index:2;min-width:180px">${mod}</td>${cells}</tr>`;
    }).join('');

    // ── Shared CSS ────────────────────────────────────────────────────────────
    const sharedCSS = `
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Inter',-apple-system,sans-serif; background:#0f172a; color:#f8fafc; min-height:100vh; }
        .glass { background:rgba(30,41,59,0.6); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.06); }
        .container { max-width:1440px; margin:0 auto; padding:32px 24px; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#1e293b; }
        ::-webkit-scrollbar-thumb { background:#475569; border-radius:3px; }
        details summary { list-style:none; }
        details summary::-webkit-details-marker { display:none; }
    `;

    // ── Bug Report HTML ───────────────────────────────────────────────────────

    // Group issues by role for the role-view tab
    const issuesByRole = {};
    allIssues.forEach(issue => {
        (issuesByRole[issue.role] = issuesByRole[issue.role] || []).push(issue);
    });

    // Group by category
    const issuesByCategory = {};
    allIssues.forEach(issue => {
        (issuesByCategory[issue.category] = issuesByCategory[issue.category] || []).push(issue);
    });

    const filterOptions = ['All Issues', 'ACCESS VIOLATIONS', 'CAPABILITY FAILURES',
        ...new Set(allIssues.map(i => i.category))].filter((v,i,a) => a.indexOf(v) === i);

    const bugReportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auriga RBAC — Bug Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        ${sharedCSS}
        .container { max-width:1100px; }
        .filter-btn { padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:transparent; color:#94a3b8; transition:all 0.2s; }
        .filter-btn:hover, .filter-btn.active { background:rgba(96,165,250,0.15); border-color:#60a5fa; color:#60a5fa; }
        .issue-card { transition:box-shadow 0.2s; }
        .issue-card:hover { box-shadow:0 0 0 1px rgba(255,255,255,0.1); }
        .hidden { display:none !important; }
    </style>
</head>
<body>
<div class="container">

    <!-- Header -->
    <div style="margin-bottom:32px">
        <a href="Executive-Dashboard.html" style="color:#60a5fa;font-size:13px;text-decoration:none;display:inline-flex;align-items:center;gap:6px">← Executive Dashboard</a>
        <div style="margin-top:16px">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#64748b;margin-bottom:6px">RBAC Audit · Bug Report</div>
            <h1 style="font-size:30px;font-weight:800;background:linear-gradient(135deg,#f87171,#fb923c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">
                Permission &amp; Capability Issue Report
            </h1>
            <p style="color:#64748b;font-size:13px">Root cause analysis for every failing test — ${allIssues.length} issues across ${roleList.length} roles</p>
            <p style="color:#475569;font-size:12px;margin-top:4px">Generated: ${new Date().toLocaleString()}</p>
        </div>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:32px">
        <div class="glass" style="padding:18px 20px;border-radius:14px;border-left:3px solid #ef4444">
            <div style="font-size:28px;font-weight:800;color:#ef4444">${permissionViolations.length}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Access Violations</div>
            <div style="font-size:11px;color:#475569;margin-top:2px">Forbidden routes accessible</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:14px;border-left:3px solid #f59e0b">
            <div style="font-size:28px;font-weight:800;color:#f59e0b">${capabilityFailures.length}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Capability Failures</div>
            <div style="font-size:11px;color:#475569;margin-top:2px">Allowed checks that failed</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:14px;border-left:3px solid #fb923c">
            <div style="font-size:28px;font-weight:800;color:#fb923c">${bugModuleKeys.length}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Affected Modules</div>
            <div style="font-size:11px;color:#475569;margin-top:2px">With access violations</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:14px;border-left:3px solid #a78bfa">
            <div style="font-size:28px;font-weight:800;color:#a78bfa">${Object.keys(issuesByRole).length}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Roles with Issues</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:14px;border-left:3px solid #4ade80">
            <div style="font-size:28px;font-weight:800;color:#4ade80">${totalPassed}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Tests Passed</div>
            <div style="font-size:11px;color:#475569;margin-top:2px">out of ${totalTests}</div>
        </div>
    </div>

    ${allIssues.length === 0 ? `
    <div class="glass" style="border-radius:20px;padding:60px;text-align:center;border:1px solid rgba(74,222,128,0.3)">
        <div style="font-size:48px;margin-bottom:16px">🛡️</div>
        <div style="font-size:22px;font-weight:700;color:#4ade80;margin-bottom:8px">No Issues Found</div>
        <div style="font-size:14px;color:#64748b">All ${totalTests} tests passed successfully.</div>
    </div>` : `

    <!-- Filter Bar -->
    <div style="margin-bottom:24px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <span style="font-size:12px;color:#64748b;margin-right:4px">Filter:</span>
        <button class="filter-btn active" onclick="filterIssues('all')" data-filter="all">All Issues (${allIssues.length})</button>
        <button class="filter-btn" onclick="filterIssues('violation')" data-filter="violation">🔓 Access Violations (${permissionViolations.length})</button>
        <button class="filter-btn" onclick="filterIssues('capability')" data-filter="capability">⚙️ Capability Failures (${capabilityFailures.length})</button>
        <button class="filter-btn" onclick="filterIssues('passed')" data-filter="passed" style="border-color:rgba(74,222,128,0.3);color:#4ade80">✅ Passed Scenarios (${passedTests.length})</button>
    </div>

    <!-- Issue Cards — All -->
    <div id="issues-all">
        <h2 style="font-size:16px;font-weight:700;color:#94a3b8;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px">
            All Issues (${allIssues.length})
        </h2>
        ${allIssues.map((issue, i) => issueCard(issue, i)).join('\n')}
    </div>

    <!-- Issue Cards — Violations only (hidden by default) -->
    <div id="issues-violation" class="hidden">
        <h2 style="font-size:16px;font-weight:700;color:#f87171;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px">
            🔓 Access Violations (${permissionViolations.length})
        </h2>
        ${permissionViolations.length === 0
            ? '<div class="glass" style="padding:24px;text-align:center;color:#4ade80;border-radius:16px">✅ No access violations.</div>'
            : permissionViolations.map((issue, i) => issueCard(issue, i)).join('\n')}
    </div>

    <!-- Issue Cards — Capability failures only (hidden by default) -->
    <div id="issues-capability" class="hidden">
        <h2 style="font-size:16px;font-weight:700;color:#f59e0b;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px">
            ⚙️ Capability Failures (${capabilityFailures.length})
        </h2>
        ${capabilityFailures.length === 0
            ? '<div class="glass" style="padding:24px;text-align:center;color:#4ade80;border-radius:16px">✅ No capability failures.</div>'
            : capabilityFailures.map((issue, i) => issueCard(issue, i)).join('\n')}
    </div>

    <!-- Passed Scenarios (hidden by default) -->
    <div id="issues-passed" class="hidden">
        <h2 style="font-size:16px;font-weight:700;color:#4ade80;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px">
            ✅ Passed Scenarios (${passedTests.length})
        </h2>
        ${passedTests.length === 0
            ? '<div class="glass" style="padding:24px;text-align:center;color:#64748b;border-radius:16px">No passed tests recorded.</div>'
            : passedTests.map(p => passedCard(p)).join('\n')}
    </div>
    `}

    <footer style="text-align:center;padding:24px 0;border-top:1px solid rgba(255,255,255,0.05);margin-top:20px">
        <p style="font-size:12px;color:#475569">Auriga RBAC Bug Report v4 — ${new Date().toISOString()}</p>
    </footer>
</div>
<script>
    function filterIssues(type) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-filter="' + type + '"]').classList.add('active');
        ['all','violation','capability','passed'].forEach(t => {
            const el = document.getElementById('issues-' + t);
            if (el) el.classList.toggle('hidden', t !== type);
        });
    }
</script>
</body>
</html>`;

    // ── Executive Dashboard HTML ──────────────────────────────────────────────
    const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auriga RBAC — Executive Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>${sharedCSS}</style>
</head>
<body>
<div class="container">

    <!-- Header -->
    <header style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;flex-wrap:wrap;gap:20px">
        <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#64748b;margin-bottom:8px">Security Compliance Audit</div>
            <h1 style="font-size:32px;font-weight:800;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">Auriga Lab Management</h1>
            <p style="color:#64748b;font-size:14px">RBAC Permission Matrix — Executive Dashboard</p>
            <p style="color:#475569;font-size:12px;margin-top:4px">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:12px">
            <div class="glass" style="padding:24px 32px;border-radius:20px;text-align:center;min-width:140px">
                <div style="position:relative;width:100px;height:100px;margin:0 auto 8px">
                    <canvas id="healthGauge" width="100" height="100"></canvas>
                    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
                        <span style="font-size:28px;font-weight:800;color:${healthColor}">${healthScore}%</span>
                    </div>
                </div>
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${healthColor};font-weight:700">${healthLabel}</div>
            </div>
            <a href="Bug-Report.html" style="background:${allIssues.length > 0 ? '#ef4444' : '#22c55e'};color:#fff;padding:10px 18px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;text-align:center">
                ${allIssues.length > 0 ? `🐛 Bug Report — ${allIssues.length} issues` : '✅ Bug Report — No issues'}
            </a>
        </div>
    </header>

    <!-- Stats Grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:16px;margin-bottom:40px">
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #3b82f6"><div style="font-size:28px;font-weight:800;color:#f1f5f9">${totalTests}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Total Checks</div></div>
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #4ade80"><div style="font-size:28px;font-weight:800;color:#4ade80">${totalPassed}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Passed</div></div>
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #f87171"><div style="font-size:28px;font-weight:800;color:#f87171">${totalFailed}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Failed</div></div>
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #94a3b8"><div style="font-size:28px;font-weight:800;color:#94a3b8">${totalSkipped}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Skipped</div></div>
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #ef4444"><div style="font-size:28px;font-weight:800;color:#ef4444">${permissionViolations.length}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Access Violations</div></div>
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #f59e0b"><div style="font-size:28px;font-weight:800;color:#f59e0b">${capabilityFailures.length}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Capability Failures</div></div>
        <div class="glass" style="padding:20px 24px;border-radius:16px;border-left:3px solid #a78bfa"><div style="font-size:28px;font-weight:800;color:#a78bfa">${roleList.length}</div><div style="font-size:12px;color:#64748b;margin-top:4px">Roles Audited</div></div>
    </div>

    <!-- Access Violations preview -->
    ${permissionViolations.length > 0 ? `
    <div class="glass" style="border-radius:20px;overflow:hidden;margin-bottom:40px;border:1px solid rgba(239,68,68,0.3)">
        <div style="padding:20px 24px;border-bottom:1px solid rgba(239,68,68,0.2);display:flex;justify-content:space-between;align-items:center;background:rgba(239,68,68,0.08)">
            <div>
                <h2 style="font-size:18px;font-weight:700;color:#f87171">🚨 Access Control Violations</h2>
                <p style="font-size:12px;color:#94a3b8;margin-top:4px">Roles that can open forbidden modules via URL — these are RBAC enforcement bugs</p>
            </div>
            <a href="Bug-Report.html" style="background:#ef4444;color:#fff;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none">Full Bug Report →</a>
        </div>
        ${bugModuleKeys.slice(0, 6).map(mod => `
        <div style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;gap:12px;align-items:center">
            <span style="background:rgba(239,68,68,0.2);color:#f87171;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap">${bugsByModule[mod].length} role${bugsByModule[mod].length > 1 ? 's' : ''}</span>
            <span style="color:#fca5a5;font-weight:600;font-size:13px">${mod}</span>
            <span style="color:#64748b;font-size:12px">→ ${bugsByModule[mod].join(', ')}</span>
        </div>`).join('')}
        ${bugModuleKeys.length > 6 ? `<div style="padding:12px 20px;color:#64748b;font-size:12px">+ ${bugModuleKeys.length - 6} more — <a href="Bug-Report.html" style="color:#60a5fa">see bug report</a></div>` : ''}
    </div>` : `
    <div class="glass" style="border-radius:20px;padding:24px;margin-bottom:40px;text-align:center;border:1px solid rgba(74,222,128,0.3)">
        <div style="font-size:16px;font-weight:700;color:#4ade80">🛡️ All Forbidden Modules Correctly Blocked</div>
        <div style="font-size:13px;color:#64748b;margin-top:4px">No access control violations across ${roleList.length} roles</div>
    </div>`}

    <!-- Compliance Matrix -->
    <div class="glass" style="border-radius:20px;overflow:hidden;margin-bottom:40px">
        <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <h2 style="font-size:18px;font-weight:700;color:#f1f5f9">📊 Compliance Matrix — Source of Truth</h2>
            <div style="display:flex;gap:16px;font-size:11px">
                <span style="color:#3b82f6">C</span><span style="color:#22c55e">R</span><span style="color:#f59e0b">U</span><span style="color:#ef4444">D</span><span style="color:#a855f7">A</span>
            </div>
        </div>
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
                <thead><tr style="background:rgba(15,23,42,0.5)">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1e293b;position:sticky;left:0;background:#0f172a;z-index:3;min-width:180px">Module</th>
                    ${matrixHeaderCells}
                </tr></thead>
                <tbody>${matrixRows}</tbody>
            </table>
        </div>
    </div>

    <!-- Per-Role Breakdown -->
    <div style="margin-bottom:40px">
        <h2 style="font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:8px">📋 Per-Role Audit Results</h2>
        <p style="font-size:13px;color:#64748b;margin-bottom:24px">
            <strong style="color:#4ade80">✓</strong> Granted &amp; verified &ensp;
            <strong style="color:#64748b">⊘</strong> Denied &amp; verified &ensp;
            <strong style="color:#f87171">✕/⚠</strong> Failed &ensp;
            <strong style="color:#94a3b8">⋯</strong> Skipped
        </p>
        ${roleCardsHtml}
    </div>

    <footer style="text-align:center;padding:24px 0;border-top:1px solid rgba(255,255,255,0.05)">
        <p style="font-size:12px;color:#475569">Auriga RBAC Security Framework v4.0</p>
        <p style="font-size:11px;color:#334155;margin-top:4px">${new Date().toISOString()}</p>
    </footer>
</div>
<script>
    const ctx = document.getElementById('healthGauge').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: { labels:['Passed','Failed','Skipped'], datasets:[{ data:[${totalPassed},${totalFailed},${totalSkipped}], backgroundColor:['#4ade80','#f87171','#475569'], borderColor:'#0f172a', borderWidth:3 }] },
        options: { plugins:{ legend:{ display:false } }, cutout:'75%', responsive:false }
    });
</script>
</body>
</html>`;

    // ── Write ─────────────────────────────────────────────────────────────────
    fs.writeFileSync(OUTPUT_FILE, dashboardHtml);
    console.log(`✅ Executive Dashboard → ${OUTPUT_FILE}`);

    fs.writeFileSync(BUG_REPORT_FILE, bugReportHtml);
    console.log(`✅ Bug Report          → ${BUG_REPORT_FILE}`);

    if (allIssues.length > 0) {
        console.log(`\n📊 Summary: ${permissionViolations.length} access violations · ${capabilityFailures.length} capability failures`);
        const cats = {};
        allIssues.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
        Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([cat,n]) => console.log(`   ${cat}: ${n}`));
    } else {
        console.log('\n🛡️  No issues found — all tests passed.');
    }
}

generateReport();
