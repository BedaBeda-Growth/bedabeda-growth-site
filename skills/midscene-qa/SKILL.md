---
name: Midscene QA
description: Bootstrap and run AI-powered visual QA using Midscene with Gemini Flash via the OpenAI-compatible endpoint. Use when setting up Midscene in a new repo, wiring Gemini as the AI provider, writing ai-assertion rules, adding ai-assertion type rules to qa-rules.json, or diagnosing Midscene/Gemini API failures. LLM justified — provider wiring, assertion batching strategy, and rule scoping require judgment a script cannot provide.
ruleDomains:
  - ops
  - engineering
---

# Midscene QA Skill

Sets up and runs AI visual QA using Midscene with Gemini Flash as the backend.

## Provider Wiring (Gemini via OpenAI-compatible API)

Add this block at the top of your Playwright spec before base.extend(PlaywrightAiFixture()):

```js
if (process.env.GEMINI_API_KEY) {
    process.env.MIDSCENE_MODEL_API_KEY = process.env.GEMINI_API_KEY;
    process.env.MIDSCENE_USE_GEMINI = '1';
    process.env.MIDSCENE_MODEL_BASE_URL =
        process.env.MIDSCENE_MODEL_BASE_URL ||
        'https://generativelanguage.googleapis.com/v1beta/openai/';
    const requestedModel = process.env.MIDSCENE_MODEL_NAME || 'gemini-2.0-flash';
    process.env.MIDSCENE_MODEL_NAME =
        requestedModel === 'gemini-3.0-flash' || requestedModel === 'gemini-30-flash-preview'
            ? 'gemini-3-flash-preview' : requestedModel;
}
const test = base.extend(PlaywrightAiFixture());
```

Correct model IDs: gemini-2.0-flash, gemini-3-flash-preview. Do NOT use gemini-3.0-flash.

## Efficient AI Assertion Handler (fast-exit retry — 1 API call on success)

```js
async function handleAiAssertion(page, aiAssert, rule, pageName, viewport) {
    const aiGate = rule.aiGate || {};
    const attempts = aiGate.attempts ?? 3;
    let lastError = null, passed = false;
    for (let i = 0; i < attempts; i++) {
        try { await aiAssert(rule.assertion); passed = true; break; }
        catch (e) { lastError = e; if (i < attempts - 1) await new Promise(r => setTimeout(r, 500)); }
    }
    if (passed) { console.log(`ai-assertion "${rule.id}" PASSED`); return; }
    const detail = lastError ? ` Last error: ${lastError.message}` : '';
    if (rule.severity === 'advisory') { console.warn(`ADVISORY "${rule.id}" FAILED.${detail}`); return; }
    throw new Error(`[${rule.id}] FAILED after ${attempts} attempts.${detail}`);
}
```

## Writing ai-assertion Rules

Key decisions:
- Batch related checks into one assertion (fewer API calls)
- Do NOT use ai-assertion for things scripts can check (text presence, selectors, CSS)
- Set severity: advisory for subjective style checks; hard only for semantic correctness
- Set attempts: 3 as default
- Scope pages tightly — avoid pages: "all" for rules that apply to a subset

## Troubleshooting

- 404 model not found: use gemini-2.0-flash or gemini-3-flash-preview
- 403 SERVICE_DISABLED: enable Generative Language API in GCP project
- FAILED after 3 attempts: increase attempts to 5, inspect qa/diffs/ screenshots

## Reference

See references/integration-checklist.md for full new-repo setup checklist.