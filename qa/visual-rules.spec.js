import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(readFileSync(join(__dir, 'visual-rules.json'), 'utf-8'));

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:4321';

// Resolve page list from registry
function resolvePages(rulePages) {
  if (typeof rulePages === 'string') {
    return registry.pages[rulePages] || [];
  }
  if (Array.isArray(rulePages)) return rulePages;
  return [];
}

// Get rules applicable to a specific page + viewport combo
function getRulesForPage(pagePath, viewportLabel) {
  return registry.rules.filter(rule => {
    const pages = resolvePages(rule.pages);
    const matchesPage = pages.some(p => pagePath === p);
    const matchesViewport = rule.viewports.includes(viewportLabel);
    return matchesPage && matchesViewport;
  });
}

const allPages = Object.values(registry.pages).flat();
const uniquePages = [...new Set(allPages)];

for (const [vpLabel, vpConfig] of Object.entries(registry.viewports)) {
  test.describe(`Visual Rules - ${vpLabel}`, () => {
    test.use({ viewport: { width: vpConfig.width, height: vpConfig.height } });

    for (const pagePath of uniquePages) {
      const pageName = pagePath === '/' ? 'home' : pagePath.replace(/\//g, '-').replace(/^-/, '');

      test(`all rules on ${pagePath}`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');

        const rules = getRulesForPage(pagePath, vpLabel);
        const failures = [];

        for (const rule of rules) {
          try {
            const result = await page.evaluate(rule.expression);
            if (result !== true) {
              if (rule.severity === 'hard') {
                failures.push({
                  id: rule.id,
                  error: `Expected: true, Received: ${JSON.stringify(result)}`,
                });
              } else {
                console.warn(`[ADVISORY] ${rule.id} on ${pagePath}: returned ${result}`);
              }
            }
          } catch (err) {
            failures.push({ id: rule.id, error: err.message });
          }
        }

        if (failures.length > 0) {
          const summary = failures.map(f => `  ✘ [${f.id}]: ${f.error}`).join('\n');
          throw new Error(`${failures.length} rule(s) failed on ${pagePath}:\n${summary}`);
        }
      });
    }
  });
}
