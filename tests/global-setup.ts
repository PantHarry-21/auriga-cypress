import { test as base, expect, BrowserContext } from '@playwright/test';
import { stubStimulsoft, loginAs, clearAllSessions, clearRoleSession, freshLoginAs, getRolePermissions, loadFixture } from './helpers/commands';

// ─── Extend base test with project env + stimulsoft stub ─────────────────────
export const test = base.extend<{
  env: Record<string, string>;
  authedPage: ReturnType<typeof base['extend']>;
}>({
  // Inject project-level env vars into every test via `env` fixture
  env: async ({}, use, testInfo) => {
    const projectEnv = testInfo.project.metadata || {};
    // Store in global so helper classes can access it
    (global as any).__testEnv__ = projectEnv;
    await use(projectEnv);
  },
});

// ─── Re-export helpers so tests only need one import ─────────────────────────
export { stubStimulsoft, loginAs, clearAllSessions, clearRoleSession, freshLoginAs, getRolePermissions, loadFixture };
export { expect };

// ─── Uncaught exception guard ─────────────────────────────────────────────────
// Playwright does not fail tests on uncaught page errors by default.
// NOTE: no direct equivalent to Cypress's on('uncaught:exception') —
//       Playwright's page.on('pageerror') can be used to monitor; we suppress by default.
export function ignoreUncaughtExceptions(context: BrowserContext) {
  context.on('weberror', () => {
    // Suppress non-critical SPA errors (analytics, WebSocket, etc.)
  });
}
