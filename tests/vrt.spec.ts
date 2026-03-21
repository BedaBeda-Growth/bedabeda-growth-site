import { test as base, expect } from '@playwright/test';
import { PlaywrightAiFixture, type PlayWrightAiFixtureType } from '@midscene/web/playwright';

// Extend base test with Midscene AI capabilities
const test = base.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture({
  cache: true // Enable VLM caching
}));

test.describe('BedaBeda Growth Visual Spec QA', () => {

  test('homepage semantic and visual layout verification', async ({ page, aiAssert }) => {
    // 1. Setup & load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform natural scroll to load assets
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // 2. Semantic visual assertions via Midscene
    await aiAssert("The main H1 headline is prominent, easily readable, and has high contrast against its background.");
    await aiAssert("No images appear broken, and placeholders or generic boxes are fully loaded.");
    await aiAssert("The sticky header/navigation is clearly visible at the top of the viewport.");
    await aiAssert("Overall spacing and padding look consistent and premium, without bleeding elements.");

    // 3. Traditional VRT as final safety net
    await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
  });

});
