/**
 * Sends Executive-Dashboard.html and Bug-Report.html via email after npm run report.
 * Configure credentials in email.config.json (project root) — see email.config.example.json.
 */

const nodemailer = require('nodemailer');
const fs   = require('fs');
const path = require('path');

const CONFIG_FILE   = path.join(__dirname, '../../email.config.json');
const REPORT_DIR    = path.join(__dirname, '../reports');
const DASHBOARD     = path.join(REPORT_DIR, 'Executive-Dashboard.html');
const BUG_REPORT    = path.join(REPORT_DIR, 'Bug-Report.html');
const TECHNICAL     = path.join(REPORT_DIR, 'technical-report.html');

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.log('\n📧  Email config not found — skipping email delivery.');
        console.log('    Copy email.config.example.json → email.config.json and fill in your credentials.\n');
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
        console.error('\n❌  email.config.json is not valid JSON:', e.message, '\n');
        return null;
    }
}

function parseStats() {
    // Try merged or individual Mochawesome JSON files
    const candidates = [
        path.join(REPORT_DIR, 'merged-report.json'),
        path.join(REPORT_DIR, 'mochawesome.json'),
    ];

    const jsonsDir = path.join(REPORT_DIR, '.jsons');
    if (fs.existsSync(jsonsDir)) {
        fs.readdirSync(jsonsDir)
            .filter(f => f.endsWith('.json'))
            .forEach(f => candidates.push(path.join(jsonsDir, f)));
    }

    for (const file of candidates) {
        if (!fs.existsSync(file)) continue;
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            const s = data.stats || {};
            if (s.tests != null || s.passes != null) {
                return {
                    total:    s.tests    || (s.passes || 0) + (s.failures || 0) + (s.pending || 0),
                    passes:   s.passes   || 0,
                    failures: s.failures || 0,
                    pending:  s.pending  || 0,
                    skipped:  s.skipped  || 0,
                    duration: s.duration || 0,
                    start:    s.start    || null,
                    end:      s.end      || null,
                };
            }
        } catch (_) {}
    }
    return null;
}

function formatDuration(ms) {
    if (!ms) return 'N/A';
    const m = Math.floor(ms / 60000);
    const s = Math.round((ms % 60000) / 1000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── Email body ─────────────────────────────────────────────────────────────────

function buildEmailHtml(stats) {
    const now      = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    const hasStats = !!stats;
    const passRate = hasStats && stats.total > 0
        ? Math.round((stats.passes / stats.total) * 100) : null;

    const statusColor = !hasStats ? '#6b7280'
        : stats.failures === 0 ? '#16a34a' : '#dc2626';
    const statusLabel = !hasStats ? 'Report Generated'
        : stats.failures === 0 ? 'All Tests Passed' : `${stats.failures} Test${stats.failures > 1 ? 's' : ''} Failed`;
    const statusIcon  = !hasStats ? '📊' : stats.failures === 0 ? '✅' : '⚠️';

    const gaugeColor = passRate == null ? '#6b7280'
        : passRate >= 90 ? '#16a34a'
        : passRate >= 70 ? '#f59e0b' : '#dc2626';

    const metricsHtml = hasStats ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="border-collapse:collapse; margin:24px 0;">
            <tr>
                ${metricCell('Total', stats.total, '#3b82f6')}
                ${metricCell('Passed', stats.passes, '#16a34a')}
                ${metricCell('Failed', stats.failures, stats.failures > 0 ? '#dc2626' : '#6b7280')}
                ${metricCell('Pending', stats.pending, '#f59e0b')}
            </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="border-collapse:collapse; margin:8px 0 24px;">
            <tr>
                ${metricCell('Pass Rate', passRate != null ? passRate + '%' : 'N/A', gaugeColor)}
                ${metricCell('Duration', formatDuration(stats.duration), '#6366f1')}
                ${metricCell('Skipped', stats.skipped, '#6b7280')}
                ${metricCell('Run At', now, '#0ea5e9')}
            </tr>
        </table>` : `<p style="color:#6b7280; margin:24px 0;">No test statistics found in report JSON.</p>`;

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);
                     padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;
                      letter-spacing:2px;text-transform:uppercase;">Auriga Lab Management</p>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                       letter-spacing:-0.5px;">RBAC Audit Report</h1>
          </td>
        </tr>

        <!-- Status badge -->
        <tr>
          <td style="padding:28px 40px 0;text-align:center;">
            <span style="display:inline-block;background:${statusColor};color:#fff;
                         border-radius:999px;padding:8px 24px;font-size:14px;font-weight:600;">
              ${statusIcon}&nbsp;&nbsp;${statusLabel}
            </span>
          </td>
        </tr>

        <!-- Metrics -->
        <tr><td style="padding:0 40px;">${metricsHtml}</td></tr>

        <!-- Attachments note -->
        <tr>
          <td style="padding:0 40px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                          padding:16px 20px;margin-bottom:24px;">
              <tr>
                <td style="font-size:13px;color:#475569;">
                  <strong style="color:#1e293b;">📎 Attached Reports</strong><br><br>
                  <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;
                               border-radius:4px;padding:4px 10px;margin:3px 0;font-size:12px;">
                    Executive-Dashboard.html
                  </span>&nbsp;
                  <span style="display:inline-block;background:#fef2f2;color:#991b1b;
                               border-radius:4px;padding:4px 10px;margin:3px 0;font-size:12px;">
                    Bug-Report.html
                  </span>
                  <br><br>
                  <span style="color:#64748b;font-size:12px;">
                    Open the attached HTML files in any browser for the full interactive report.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;
                     text-align:center;color:#94a3b8;font-size:11px;">
            Generated by Auriga Cypress RBAC Suite · ${now}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function metricCell(label, value, color) {
    return `
    <td style="text-align:center;padding:12px 8px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                  padding:14px 10px;border-top:3px solid ${color};">
        <div style="font-size:22px;font-weight:700;color:${color};">${value ?? '—'}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;text-transform:uppercase;
                    letter-spacing:0.5px;">${label}</div>
      </div>
    </td>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const config = loadConfig();
    if (!config) return;

    if (config.enabled === false) {
        console.log('\n📧  Email delivery is disabled (set "enabled": true in email.config.json)\n');
        return;
    }

    if (!fs.existsSync(DASHBOARD)) {
        console.log('\n⚠️   Executive-Dashboard.html not found — skipping email.\n');
        return;
    }

    const stats = parseStats();
    const html  = buildEmailHtml(stats);

    // Build subject
    const passRate = stats && stats.total > 0
        ? Math.round((stats.passes / stats.total) * 100) : null;
    const icon     = !stats ? '📊' : stats.failures === 0 ? '✅' : '⚠️';
    const label    = !stats ? 'Report Ready'
        : stats.failures === 0 ? 'All Tests Passed' : `${stats.failures} Failed`;
    const rateStr  = passRate != null ? ` — ${passRate}% pass rate` : '';
    const subject  = `${icon} Auriga RBAC Audit: ${label}${rateStr}`;

    // Attachments — skip files that would push the message over Gmail's ~25 MB limit.
    // Base64 encoding adds ~33% overhead, so cap raw file size at 6 MB each / 18 MB total.
    const MAX_FILE_BYTES  = 6 * 1024 * 1024;   // 6 MB per file
    const MAX_TOTAL_BYTES = 18 * 1024 * 1024;  // 18 MB total

    const candidates = [
        { filename: 'Executive-Dashboard.html', path: DASHBOARD },
        { filename: 'Bug-Report.html',          path: BUG_REPORT },
        { filename: 'technical-report.html',    path: TECHNICAL },
    ];

    const attachments = [];
    let totalBytes = 0;
    for (const c of candidates) {
        if (!fs.existsSync(c.path)) continue;
        const size = fs.statSync(c.path).size;
        if (size > MAX_FILE_BYTES) {
            console.log(`⚠️   Skipping ${c.filename} — file too large (${(size/1024/1024).toFixed(1)} MB > 6 MB limit).`);
            continue;
        }
        if (totalBytes + size > MAX_TOTAL_BYTES) {
            console.log(`⚠️   Skipping ${c.filename} — would exceed total attachment limit.`);
            continue;
        }
        attachments.push(c);
        totalBytes += size;
    }
    if (attachments.length === 0) {
        console.log('⚠️   All report files exceeded size limits — sending email summary only (no attachments).');
    }

    // Transporter
    const smtp = config.smtp;
    const transporter = nodemailer.createTransport({
        host:   smtp.host,
        port:   smtp.port   || 587,
        secure: smtp.secure || false,
        auth: { user: smtp.user, pass: smtp.password },
    });

    const recipients = Array.isArray(config.recipients) ? config.recipients : [config.recipients];

    try {
        console.log('\n📤  Sending report email…');
        const info = await transporter.sendMail({
            from:        `"Auriga RBAC Audit" <${smtp.from || smtp.user}>`,
            to:          recipients.join(', '),
            subject,
            html,
            attachments,
        });
        console.log(`✅  Email sent successfully!`);
        console.log(`    To:         ${recipients.join(', ')}`);
        console.log(`    Subject:    ${subject}`);
        console.log(`    Message ID: ${info.messageId}\n`);
    } catch (err) {
        console.error(`\n❌  Failed to send email: ${err.message}`);
        console.error('    Check your SMTP credentials in email.config.json\n');
        process.exit(0); // Don't fail the npm script — report is already generated
    }
}

main();
