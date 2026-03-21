import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from default ".env.test" file.
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  timeout: 90000,
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
