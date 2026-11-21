import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run the real game in a real browser (see docs/TESTING.md).
//   npx playwright install chromium     (first time only)
//   npm run e2e
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } }, testIgnore: /mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 5 landscape'] }, testMatch: /mobile/ },
  ],
});
