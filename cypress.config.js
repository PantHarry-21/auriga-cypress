const { defineConfig } = require("cypress");

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
    baseUrl: "https://dev.ylims.com",
    testIsolation: true, // Clean slate between tests
    pageLoadTimeout: 120000, // 2 min — SPA has heavy scripts even with intercepts
    defaultCommandTimeout: 15000,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      
      on('task', {
        generateReport() {
          const { execSync } = require('child_process');
          try {
            console.log('📊 Auto-generating Executive Dashboard...');
            execSync('node cypress/scripts/generate-executive-report.js');
            return true;
          } catch (e) {
            console.error('Failed to generate report:', e);
            return false;
          }
        }
      });

      return config;
    },
  },
});
