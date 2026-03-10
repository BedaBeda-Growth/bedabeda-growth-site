import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-vrt',
      testDir: './tests',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-vrt',
      testDir: './tests',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'visual-rules',
      testDir: './qa',
      testMatch: 'visual-rules.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
