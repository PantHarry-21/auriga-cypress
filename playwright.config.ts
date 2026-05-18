import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Read environment variables from file.
 * We load both and pass them to respective projects.
 */
function getEnvConfig(envFile: string) {
  const filePath = path.resolve(__dirname, envFile);
  if (!fs.existsSync(filePath)) return {};
  return dotenv.parse(fs.readFileSync(filePath));
}

const devEnv = getEnvConfig('.env.dev');
const uatEnv = getEnvConfig('.env.uat');

export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  globalTimeout: 7200000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect traces, videos, and screenshots for all tests */
    trace: 'on',                    // Always capture trace for debugging
    video: 'on',                    // Always capture video
    screenshot: 'on',               // Always capture screenshots
    headless: true,
  },
  projects: [
    {
      name: 'dev',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: devEnv.BASE_URL || 'https://dev.ylims.com',
      },
      // Pass env vars via metadata
      metadata: devEnv,
    },
    {
      name: 'uat',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: uatEnv.BASE_URL || 'https://uat.ylims.com',
      },
      // Pass env vars via metadata
      metadata: uatEnv,
    },
  ],
});
