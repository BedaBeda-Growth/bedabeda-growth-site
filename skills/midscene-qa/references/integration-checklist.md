# Midscene QA Integration Checklist

Use this when adding Midscene AI visual testing to a new repo.

## Prerequisites

- [ ] Node.js + npm/pnpm project
- [ ] Playwright already installed and configured
- [ ] `GEMINI_API_KEY` available (via 1Password or `.env`)

## Install

```bash
npm install @midscene/web dotenv
npm install --save-dev @playwright/test pngjs pixelmatch
```

## Files to Create

### 1. `qa/visual-rules.spec.js`
Copy the pattern from `rv/qa/visual-rules.spec.js`. Essential sections:
- Gemini provider bootstrap block (see SKILL.md)
- `handleAiAssertion()` fast-exit retry function
- Tier-ordered test generation loop (`tests/script` → `playwright` → `midscene` → `polish`)

### 2. `qa-rules.json`
Define pages, viewports, and rules. Start with a minimal set:
```json
{
  "project": { "name": "...", "base_url": "http://localhost:3000" },
  "viewports": { "desktop": { "width": 1440, "height": 900 } },
  "pages": { "all": ["index.html"] },
  "rules": []
}
```

### 3. `qa/playwright.config.js`
```js
export default {
    testDir: '.',
    timeout: 30000,
    use: { baseURL: 'http://localhost:3000' }
};
```

## Validate the Setup

```bash
# Confirm env loads
node -e "require('dotenv/config'); console.log(process.env.GEMINI_API_KEY ? 'KEY OK' : 'MISSING')"

# Run one midscene test
npx playwright test qa/visual-rules.spec.js --config=qa/playwright.config.js \
  --grep "\\[midscene\\]" --workers=1
```

Expected output: `ai-assertion "..." PASSED ✅`

## Common Mistakes

- Adding `"pages": "all"` to rules that only apply to a subset — wastes API calls
- Using `attempts: 4+` by default — start at 3, only increase for known flaky rules
- Combining assertions from different page scopes — scope your batching to pages that share all the same checks
