import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  // Wait for network idle or elements to load to avoid flakiness
  await page.waitForLoadState('networkidle');
  // Scroll down a bit and back up to ensure lazy-loaded items might appear
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  
  await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
});
