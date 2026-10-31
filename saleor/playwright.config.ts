import { defineConfig, devices } from '@playwright/test';
const apiURL = process.env.SALEOR_API_URL || 'http://localhost:8000/graphql/';
const dashboardURL = process.env.SALEOR_DASHBOARD_URL || 'http://localhost:9000';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: '../saleor-report', open: 'never' }]],
  outputDir: '../saleor-results',
  use: {
    baseURL: dashboardURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testMatch: /.*api.*\.spec\.ts/ },
    { name: 'chromium', testMatch: /.*ui.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: /.*ui.*\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
  ],
  metadata: { apiURL },
});
