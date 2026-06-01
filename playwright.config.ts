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
  globalSetup: require.resolve('./tests/global-login-setup'),
  timeout: 180000,         // 3 min per test — UAT server is slow (30-40s per page load)
  globalTimeout: 21600000, // 6 hours total (for full suite)
  expect: {
    timeout: 20000,        // 20s for assertions
  },
  fullyParallel: true,
  retries: 1,
  // UAT server is slow — 2 workers avoids hammering it while still running faster than serial
  workers: process.env.CI ? 1 : process.env.WORKERS ? parseInt(process.env.WORKERS) : 2,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    trace: 'on',        // Always capture trace (viewable in Playwright UI / show-trace)
    video: 'on',        // Always record video for every test
    screenshot: 'on',   // Always take screenshot at end of every test
    headless: true,
    actionTimeout: 30000, // 30s for individual actions (click, fill, etc.)
    navigationTimeout: 90000, // 90s for page navigations
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
