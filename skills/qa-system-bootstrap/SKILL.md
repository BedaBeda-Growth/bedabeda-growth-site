---
name: qa-system-bootstrap
description: Bootstrap or operate a visual + functional QA rule system in any web repo. Use when asked to "set up QA", "add visual testing", "create a rule system", "QA bootstrap", or "review build rules". Works for static sites, Next.js, Vite, or any web app with a browser-accessible UI.
ruleDomains:
  - ops
---

# QA System Bootstrap — Universal Skill

## What This Builds

A complete, self-enforcing QA system with three layers:

1. **Rule Registry** (`qa/visual-rules.json`) — a JSON file of assertable rules
2. **Rule Engine** (`qa/visual-rules.spec.js`) — a Playwright spec that reads the registry and evaluates every rule in a real browser
3. **VRT System** (`qa/vrt-compare.spec.js`) — pixel-level screenshot baselines with diff detection

Together these create a loop where:
- Every visual or functional standard is encoded as a **permanent rule**
- Rules are evaluated in a real browser via Playwright (no mocking)
- VRT baselines capture the approved visual state for pixel-diff regression detection
- Nothing ships if rules fail — hard rules block, advisory rules surface for review

---

## Step 0: Assess Current State

Before doing anything, answer these questions about the current repo:

```
1. Is Playwright already installed?         → Check: npx playwright --version
2. Is there a qa/ directory?                → Check: ls qa/
3. Is there a visual-rules.json?            → Check: ls qa/visual-rules.json
4. Is there a dev server command?            → Check: package.json scripts (dev, start, serve)
5. What's the dev server URL?               → Usually http://localhost:3000 or similar
6. What pages/routes need testing?           → Check: routes, pages/, or HTML files
7. Is there a build step?                    → Check: npm run build
```

**If 1-3 all exist** → Skip to **Step 5: Operate** (the system is already set up)
**If any are missing** → Continue with **Step 1: Install**

---

## Step 1: Install Dependencies

```bash
npm install -D @playwright/test
npx playwright install chromium
```

For VRT (pixel comparison), also install:
```bash
npm install -D pngjs pixelmatch
```

Create the qa directory:
```bash
mkdir -p qa/baselines qa/diffs
```

---

## Step 2: Create the Rule Registry

Create `qa/visual-rules.json` with this schema:

```json
{
  "version": 1,
  "pages": {
    "all": ["page1.html", "page2.html"],
    "group1": ["page1.html"],
    "group2": ["page2.html"]
  },
  "viewports": {
    "desktop": { "width": 1440, "height": 900 },
    "mobile": { "width": 390, "height": 844 }
  },
  "rules": []
}
```

### Rule Types

Each rule is an object with:

```json
{
  "id": "unique-kebab-case-id",
  "severity": "hard",
  "pages": "all",
  "viewports": ["desktop", "mobile"],
  "type": "layout-expression",
  "expression": "JavaScript expression that returns true (pass) or false (fail)"
}
```

**Severity levels:**
- `hard` — fails the test, blocks shipment
- `advisory` — logged but does not block

**Page targeting:**
- `"all"` — runs on every page
- `["page1.html", "page2.html"]` — runs only on listed pages
- `"group1"` — runs on a named group from the pages map

### Expression Patterns

Expressions are evaluated via `page.evaluate()` in a real Chromium browser. They have full access to the DOM, `getComputedStyle()`, `getBoundingClientRect()`, etc.

**Check element exists and is visible:**
```javascript
"(() => { const el = document.querySelector('.my-element'); if (!el) return false; const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0; })()"
```

**Check computed CSS value:**
```javascript
"getComputedStyle(document.documentElement).getPropertyValue('--brand-color').trim() === '#ff7043'"
```

**Check text content matches approved list:**
```javascript
"(() => { const approved = ['Title A', 'Title B']; const els = Array.from(document.querySelectorAll('.card h3')); if (!els.length) return false; return els.every(el => approved.includes(el.textContent.trim())); })()"
```

**Check layout alignment:**
```javascript
"(() => { const h = document.querySelector('.heading'); const li = document.querySelector('.list li'); if (!h || !li) return false; return Math.abs(h.getBoundingClientRect().left - li.getBoundingClientRect().left) < 8; })()"
```

**Check no horizontal scroll (mobile):**
```javascript
"document.documentElement.scrollWidth <= window.innerWidth"
```

**Check font size hierarchy:**
```javascript
"(() => { const h = document.querySelector('.heading'); const p = document.querySelector('.body'); if (!h || !p) return false; return parseFloat(getComputedStyle(p).fontSize) <= parseFloat(getComputedStyle(h).fontSize) * 0.85; })()"
```

### Common Rule Categories to Start With

1. **Layout** — no horizontal scroll, responsive stacking, centered containers
2. **Brand tokens** — CSS vars match approved values, colors are correct
3. **Typography** — font size hierarchy, consistent weights
4. **Content** — approved titles/copy, no forbidden words, phone numbers match
5. **Navigation** — correct links, no broken items, mobile menu works
6. **Cards/Components** — consistent styling, icons visible, alignment
7. **Accessibility** — contrast ratios, alt text present, focus indicators

---

## Step 3: Create the Rule Engine

Create `qa/visual-rules.spec.js`:

```javascript
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(readFileSync(join(__dir, 'visual-rules.json'), 'utf-8'));

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';

// Resolve page list from registry
function resolvePages(rulePages) {
  if (typeof rulePages === 'string') {
    return registry.pages[rulePages] || [];
  }
  if (Array.isArray(rulePages)) return rulePages;
  return [];
}

// Group rules by page for efficiency (one navigation per page)
function getRulesForPage(pagePath, viewportLabel) {
  return registry.rules.filter(rule => {
    const pages = resolvePages(rule.pages);
    const matchesPage = pages.some(p => pagePath.includes(p.replace('.html', '')));
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
      const pageName = pagePath.replace('.html', '').replace(/\//g, '-');

      test(`all rules on ${pagePath}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${pagePath}`);
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
                  error: `expect(received).toBe(expected)\n\n    Expected: true\n    Received: ${JSON.stringify(result)}`,
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
```

---

## Step 4: Create the VRT System

Create `qa/vrt-compare.spec.js`:

```javascript
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pngjs from 'pngjs';
import pixelmatch from 'pixelmatch';

const { PNG } = pngjs;
const __dir = dirname(fileURLToPath(import.meta.url));
const BASELINES_DIR = join(__dir, 'baselines');
const DIFFS_DIR = join(__dir, 'diffs');
const PIXEL_THRESHOLD = 0.1;
const MAX_DIFF_RATIO = 0.005; // 0.5%

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';

// Define your pages here or import from a shared config
const ALL_PAGES = [
  { name: 'home', path: '/' },
  // Add more pages as needed
];

const VIEWPORTS = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 375, height: 812 },
];

mkdirSync(BASELINES_DIR, { recursive: true });
mkdirSync(DIFFS_DIR, { recursive: true });

for (const vp of VIEWPORTS) {
  test.describe(`VRT · ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });

    for (const pg of ALL_PAGES) {
      test(`${pg.name} · ${vp.label}`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pg.path}`);
        await page.waitForLoadState('networkidle');

        // Kill animations for deterministic screenshots
        await page.addStyleTag({
          content: '*, *::before, *::after { transition: none !important; animation: none !important; }'
        });

        // Scroll through page to trigger lazy images
        await page.evaluate(async () => {
          const step = Math.max(window.innerHeight, 600);
          for (let y = 0; y <= document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 50));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(200);

        const screenshotBuf = await page.screenshot({ fullPage: true });
        const current = PNG.sync.read(screenshotBuf);
        const baselinePath = join(BASELINES_DIR, `${pg.name}-${vp.label}.png`);

        if (!existsSync(baselinePath)) {
          writeFileSync(baselinePath, screenshotBuf);
          console.log(`[NEW BASELINE] ${pg.name}-${vp.label}.png saved`);
          return;
        }

        const golden = PNG.sync.read(readFileSync(baselinePath));
        expect(current.width).toBe(golden.width);
        expect(current.height).toBe(golden.height);

        const { width, height } = current;
        const totalPixels = width * height;
        const diffData = Buffer.alloc(totalPixels * 4);
        const numDiffPixels = pixelmatch(golden.data, current.data, diffData, width, height, { threshold: PIXEL_THRESHOLD });
        const diffRatio = numDiffPixels / totalPixels;

        if (diffRatio > MAX_DIFF_RATIO) {
          const diffPng = new PNG({ width, height });
          diffPng.data = diffData;
          writeFileSync(join(DIFFS_DIR, `${pg.name}-${vp.label}-diff.png`), PNG.sync.write(diffPng));
        }

        expect(diffRatio).toBeLessThanOrEqual(MAX_DIFF_RATIO);
      });
    }
  });
}
```

---

## Step 4b: Create Playwright Config

Create `qa/playwright.config.js` if it doesn't exist:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  retries: 0,
  reporter: [['html', { outputFolder: 'reports/vrt-html', open: 'never' }]],
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
```

---

## Step 4c: Add Package Scripts

Add to `package.json` scripts:

```json
{
  "qa:visual": "npx playwright test qa/visual-rules.spec.js --config=qa/playwright.config.js",
  "qa:vrt": "cd qa && npx playwright test vrt-compare.spec.js",
  "qa:baseline": "rm -f qa/baselines/*.png && npm run qa:vrt",
  "qa:all": "npm run qa:visual && npm run qa:vrt"
}
```

---

## Step 5: Operate — The QA Loop

Once the system is bootstrapped, the operational loop is:

### 5a. Run the Rules
```bash
npm run qa:visual
```

This gives you a pass/fail report. Every failure is a rule that the site violates.

### 5b. Fix One Issue at a Time

For each failure:
1. Identify the root cause (CSS, HTML, content)
2. Make the smallest possible fix
3. Rebuild (if applicable): `npm run build`
4. Re-run the scoped rule to verify it passes
5. Re-run the full suite to verify no regressions

### 5c. Add New Rules from Feedback

When someone spots a visual issue that wasn't caught:
1. The rule either doesn't exist → **create a new rule**
2. The rule exists but is too loose → **tighten the expression**
3. The rule checks the wrong thing → **fix the selector/assertion**

**Every piece of feedback becomes a rule. Feedback given twice means the rule wasn't added.**

### 5d. Reset VRT Baselines (Human Gate)

Only after visual confirmation that the site looks correct:
```bash
npm run qa:baseline
```

This captures fresh golden screenshots. VRT baselines are **never auto-approved**.

---

## Step 6: Governance Rules

These are non-negotiable across all repos:

1. **Rules are permanent.** Once added, never removed without explicit owner approval.
2. **Hard rules block shipment.** A failing hard rule = the change does not ship.
3. **Advisory rules surface for review.** They warn but don't block.
4. **VRT baselines are human-approved only.** Only reset after visual confirmation.
5. **Build before test.** Always run the build step before QA to avoid testing stale output.
6. **One fix at a time.** Never batch multiple fixes — gate each independently.
7. **The registry grows.** New visual QA sessions add rules; they never shrink.

---

## Step 7: Adapt to Web App Frameworks

### Next.js / Vite / React Apps

The same system works, with these adaptations:

- **Dev server**: `npm run dev` (already starts a server)
- **Routes vs files**: Page list uses route paths (`/`, `/about`, `/dashboard`) instead of `.html` files
- **Auth-gated pages**: Use Playwright's `storageState` to persist login between tests
- **Dynamic content**: Add `page.waitForSelector()` before evaluating rules on pages with async data
- **Component-level rules**: Target data-qa attributes (`[data-qa="sidebar"]`) for stable selectors

### Auth-Gated Example

```javascript
// In playwright.config.js, add:
projects: [
  {
    name: 'authenticated',
    use: { storageState: 'qa/.auth/user.json' },
  },
]

// Create setup to capture auth state:
// qa/auth.setup.js
test('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', process.env.QA_EMAIL);
  await page.fill('[name="password"]', process.env.QA_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'qa/.auth/user.json' });
});
```

### SPA Route Rules

For SPAs where navigation doesn't do a full page load:

```javascript
// Navigate via client-side routing
await page.goto(`${BASE_URL}/dashboard`);
await page.waitForSelector('[data-qa="dashboard-loaded"]');
// Now evaluate rules
```

---

## File Structure (After Bootstrap)

```
qa/
├── visual-rules.json          ← Rule registry (source of truth)
├── visual-rules.spec.js       ← Rule engine (reads registry, asserts)
├── vrt-compare.spec.js        ← VRT pixel comparison
├── playwright.config.js       ← Playwright configuration
├── baselines/                 ← Golden VRT screenshots (human-approved)
│   ├── home-desktop.png
│   ├── home-mobile.png
│   └── ...
├── diffs/                     ← Pixel diff images (auto-generated on failure)
└── reports/                   ← HTML test reports
```

---

## Quick Reference Commands

```bash
# Run all visual rules
npm run qa:visual

# Run VRT comparison against baselines
npm run qa:vrt

# Reset VRT baselines (human gate — only after visual confirmation)
npm run qa:baseline

# Run everything
npm run qa:all

# Run scoped to one page (Playwright grep)
npx playwright test qa/visual-rules.spec.js --config=qa/playwright.config.js --grep "dashboard"
```
