const { defineConfig } = require("cypress");
const path = require("path");
const fs = require("fs");

module.exports = defineConfig({
  projectId: 'trt15m',
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Auriga RBAC Audit Report',
    reportTitle: 'Auriga Lab Management - RBAC Permission Matrix Verification',
    reportFilename: 'technical-report',
    overwrite: true,
    html: true,
    json: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: true,
  },
  chromeWebSecurity: false,
  e2e: {
    numTestsKeptInMemory: 0,
    // Default baseUrl — overridden by the environment-specific file loaded below.
    // Run against dev:  npx cypress run --env environment=dev
    // Run against UAT:  npx cypress run --env environment=uat
    baseUrl: 'https://uat.ylims.com',
    testIsolation: true,
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 15000,
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: false,

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      // ── Load environment-specific credentials & baseUrl ─────────────────
      // Reads cypress.env.{environment}.json and merges it into config.env.
      // The BASE_URL key in that file overrides config.baseUrl.
      // If the file doesn't exist the defaults above are used.
      const environment = config.env.environment || 'dev';
      const envFilePath = path.resolve(__dirname, `cypress.env.${environment}.json`);

      if (fs.existsSync(envFilePath)) {
        const overrides = JSON.parse(fs.readFileSync(envFilePath, 'utf-8'));
        if (overrides.BASE_URL) {
          config.baseUrl = overrides.BASE_URL;
          delete overrides.BASE_URL; // keep config.env clean
        }
        config.env = { ...config.env, ...overrides };
        console.log(`\n🌍  Environment : ${environment.toUpperCase()}`);
        console.log(`🔗  Base URL    : ${config.baseUrl}\n`);
      } else {
        console.warn(`\n⚠️  cypress.env.${environment}.json not found — using defaults.\n`);
      }

      // ── Tasks ────────────────────────────────────────────────────────────
      on('task', {
        generateReport() {
          const { execSync } = require('child_process');
          try {
            console.log('📊 Auto-generating Executive Dashboard...');
            execSync('node --max-old-space-size=4096 cypress/scripts/generate-executive-report.js');
            return true;
          } catch (e) {
            console.error('Failed to generate report:', e);
            return false;
          }
        },
      });

      return config;
    },
  },
});
