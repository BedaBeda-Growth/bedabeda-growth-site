// visual-rules-template.js — Tier-based QA runner template
// Copy this to your repo's qa/ directory and customize.
//
// Distributed with run-qa-loop skill. Reads qa-rules.json from repo root.
// Executes rules in tier order: tests/script → playwright → midscene → polish
//
// Prerequisites:
//   - qa-rules.json at repo root with 'category' field on each rule
//   - @playwright/test, @midscene/web (optional for ai-assertion tier)
//   - pixelmatch + pngjs (optional for region-snapshot tier)
//
// Usage:
//   npx playwright test visual-rules.spec.js                     # full tiered run
//   npx playwright test visual-rules.spec.js -g "tests/script"   # fast tier only
//   npx playwright test visual-rules.spec.js -g "\[playwright\]" # VRT/contrast tier
//   npx playwright test visual-rules.spec.js -g "\[polish\]"     # see flagged items

import { test as base, expect } from '@playwright/test';
import fs from 'fs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Optional: Midscene for AI assertions
let PlaywrightAiFixture;
try {
    const midscene = await import('@midscene/web/playwright');
    PlaywrightAiFixture = midscene.PlaywrightAiFixture;
} catch {
    // Midscene not installed — ai-assertion rules will be skipped
}

// Optional: pixelmatch for region snapshots
let PNG, pixelmatch;
try {
    const pngjs = await import('pngjs');
    PNG = pngjs.PNG;
    const pm = await import('pixelmatch');
    pixelmatch = pm.default;
} catch {
    // pixelmatch not installed — region-snapshot rules will warn
}

const test = PlaywrightAiFixture ? base.extend(PlaywrightAiFixture()) : base;

// Find qa-rules.json — walk up from this file's directory
function findQaRules() {
    let d = __dirname;
    for (let i = 0; i < 5; i++) {
        const candidate = join(d, 'qa-rules.json');
        if (fs.existsSync(candidate)) return candidate;
        const parent = dirname(d);
        if (parent === d) break;
        d = parent;
    }
    // Also check repo root (one level up from qa/)
    const repoRoot = join(__dirname, '..');
    const rootCandidate = join(repoRoot, 'qa-rules.json');
    if (fs.existsSync(rootCandidate)) return rootCandidate;
    return null;
}

const rulesPath = findQaRules();
if (!rulesPath) {
    console.error('❌ qa-rules.json not found. Create one at repo root.');
    process.exit(1);
}
const rulesConfig = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

const REGION_BASELINES_DIR = join(__dirname, 'region-baselines');
const TIER_ORDER = ['tests/script', 'playwright', 'midscene', 'polish'];

// -- Resolve which pages a rule applies to --
function resolvePages(rule) {
    if (rule.pages === 'all') return rulesConfig.pages?.all || [];
    if (rule.pages === 'service') return rulesConfig.pages?.service || [];
    if (rule.pages === 'county') return rulesConfig.pages?.county || [];
    if (rule.pages === 'hero') return rulesConfig.pages?.hero || rulesConfig.pages?.all || [];
    if (Array.isArray(rule.pages)) return rule.pages;
    return [rule.pages];
}

function slugify(str) {
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// -- RULE TYPE HANDLERS --
// Each handler is self-contained. If a dependency is missing, it warns rather than crashes.

async function handleLayoutExpression(page, rule) {
    const result = await page.evaluate(`(() => { return ${rule.expression}; })()`);
    expect(result, `[${rule.id}] layout-expression returned false`).toBe(true);
}

async function handleRequiredElement(page, rule) {
    const min = (rule.requiredMatches?.min != null) ? rule.requiredMatches.min : 1;
    const max = (rule.requiredMatches?.max != null) ? rule.requiredMatches.max : null;
    const count = await page.locator(rule.selector).count();
    if (min > 0 && count === 0) {
        throw new Error(`[${rule.id}] required-element: "${rule.selector}" matched 0 elements — expected ≥ ${min}`);
    }
    expect(count, `[${rule.id}] required-element count`).toBeGreaterThanOrEqual(min);
    if (max != null) expect(count, `[${rule.id}] max`).toBeLessThanOrEqual(max);
}

async function handleForbiddenElement(page, rule) {
    if (rule.selector) {
        const count = await page.locator(rule.selector).count();
        if (rule.text) {
            for (let i = 0; i < count; i++) {
                const text = await page.locator(rule.selector).nth(i).textContent();
                expect(text.toLowerCase()).not.toContain(rule.text.toLowerCase());
            }
        } else {
            expect(count).toBe(0);
        }
    } else {
        const text = await page.evaluate(() => document.body.innerText);
        if (rule.text) expect(text.toLowerCase()).not.toContain(rule.text.toLowerCase());
    }
}

async function handleBoundingBox(page, rule) {
    const tolerance = rule.tolerancePx ?? 10;
    const results = await page.evaluate(({ sel, containerSel, assert, tol }) => {
        const els = Array.from(document.querySelectorAll(sel));
        if (!els.length) return { pass: false, reason: `No elements for "${sel}"` };
        const failures = [];
        for (const el of els) {
            const rect = el.getBoundingClientRect();
            if (assert.centeredHorizontal) {
                const container = containerSel ? el.closest(containerSel) || el.parentElement : el.parentElement;
                if (!container) { failures.push(`no container for ${el.className}`); continue; }
                const cRect = container.getBoundingClientRect();
                const diff = Math.abs((rect.left + rect.width / 2) - (cRect.left + cRect.width / 2));
                if (diff > tol) failures.push(`off-center by ${diff.toFixed(1)}px`);
            }
        }
        return failures.length ? { pass: false, reason: failures.join('; ') } : { pass: true };
    }, { sel: rule.selector, containerSel: rule.container || null, assert: rule.assert || {}, tol: tolerance });
    if (!results.pass) throw new Error(`[${rule.id}] bounding-box FAILED: ${results.reason}`);
}

async function handleSiblingConsistency(page, rule) {
    const tolerance = rule.tolerancePx ?? 20;
    const results = await page.evaluate(({ sel, assert, tol }) => {
        const els = Array.from(document.querySelectorAll(sel));
        if (els.length < 2) return { pass: true };
        const failures = [];
        const firstRect = els[0].getBoundingClientRect();
        for (let i = 1; i < els.length; i++) {
            const rect = els[i].getBoundingClientRect();
            if (assert.height) {
                const diff = Math.abs(rect.height - firstRect.height);
                if (diff > tol) failures.push(`sibling[${i}] height diff ${diff.toFixed(1)}px`);
            }
        }
        return failures.length ? { pass: false, reason: failures.join('; ') } : { pass: true };
    }, { sel: rule.selector, assert: rule.assert || { height: true }, tol: tolerance });
    if (!results.pass) throw new Error(`[${rule.id}] sibling-consistency FAILED: ${results.reason}`);
}

async function handleRegionSnapshot(page, rule, pageName, viewport) {
    if (!PNG || !pixelmatch) {
        console.warn(`[${rule.id}] region-snapshot skipped — pixelmatch/pngjs not installed`);
        return;
    }
    const tolerance = rule.tolerance ?? 0.5;
    const slug = slugify(`${rule.id}-${pageName}-${viewport}`);
    const refPath = join(REGION_BASELINES_DIR, `${slug}.png`);
    const locator = page.locator(rule.selector).first();
    const count = await page.locator(rule.selector).count();
    if (count === 0) throw new Error(`[${rule.id}] region-snapshot: "${rule.selector}" matched 0 elements`);
    const screenshotBuf = await locator.screenshot({ type: 'png' });
    if (!existsSync(refPath)) throw new Error(`[${rule.id}] NO REFERENCE IMAGE for "${slug}". Run region approve.`);
    const current = PNG.sync.read(screenshotBuf);
    const ref = PNG.sync.read(readFileSync(refPath));
    if (current.width !== ref.width || current.height !== ref.height) {
        throw new Error(`[${rule.id}] region dimensions changed: ${ref.width}×${ref.height} → ${current.width}×${current.height}`);
    }
    const { width, height } = current;
    const diff = new PNG({ width, height });
    const numDiff = pixelmatch(current.data, ref.data, diff.data, width, height, { threshold: 0.15 });
    const diffPct = (numDiff / (width * height)) * 100;
    if (diffPct > tolerance) {
        if (!existsSync(join(__dirname, 'diffs'))) mkdirSync(join(__dirname, 'diffs'), { recursive: true });
        writeFileSync(join(__dirname, 'diffs', `${slug}-diff.png`), PNG.sync.write(diff));
        throw new Error(`[${rule.id}] ${diffPct.toFixed(2)}% pixel diff (tolerance ${tolerance}%)`);
    }
}

async function handleContrastRendered(page, rule) {
    const wcagAA = rule.wcagLevel === 'AAA' ? 7.0 : 4.5;
    const results = await page.evaluate(({ sel, wcag }) => {
        const els = Array.from(document.querySelectorAll(sel)).filter(el => {
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 && el.textContent.trim().length > 0;
        });
        if (!els.length) return { pass: false, reason: `No elements for "${sel}"` };
        const failures = [];
        const linearize = v => { const c = v/255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
        const lum = ([r,g,b]) => 0.2126*linearize(r)+0.7152*linearize(g)+0.0722*linearize(b);
        const parseRgb = s => { const m = s.match(/[\d.]+/g); return m ? [+m[0],+m[1],+m[2]] : [0,0,0]; };
        for (const el of els.slice(0,5)) {
            const fg = getComputedStyle(el).color;
            let node = el, bg = 'rgb(255,255,255)';
            while (node) { const b = getComputedStyle(node).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; } node = node.parentElement; }
            const ratio = (() => { const l1 = lum(parseRgb(fg)), l2 = lum(parseRgb(bg)); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); })();
            if (ratio < wcag) failures.push(`"${el.textContent.trim().substring(0,30)}" contrast ${ratio.toFixed(2)}:1 < ${wcag}:1`);
        }
        return failures.length ? { pass: false, reason: failures.join('; ') } : { pass: true };
    }, { sel: rule.selector, wcag: wcagAA });
    if (!results.pass) throw new Error(`[${rule.id}] contrast-rendered FAILED: ${results.reason}`);
}

async function handleAiAssertion(page, aiAssert, rule) {
    if (!aiAssert) { console.warn(`[${rule.id}] ai-assertion skipped — Midscene not available`); return; }
    try { await aiAssert(rule.assertion); } catch (e) { console.warn(`[${rule.id}] ADVISORY ai-assertion FAILED: ${e.message}`); }
}

// -- DISPATCHER --
async function assertRule(page, aiAssert, rule, pageName, viewport) {
    switch (rule.type) {
        case 'layout-expression': return handleLayoutExpression(page, rule);
        case 'required-element': return handleRequiredElement(page, rule);
        case 'forbidden-element': return handleForbiddenElement(page, rule);
        case 'bounding-box': return handleBoundingBox(page, rule);
        case 'sibling-consistency': return handleSiblingConsistency(page, rule);
        case 'region-snapshot': return handleRegionSnapshot(page, rule, pageName, viewport);
        case 'contrast-rendered': return handleContrastRendered(page, rule);
        case 'ai-assertion': return handleAiAssertion(page, aiAssert, rule);
        default: console.warn(`[${rule.id}] Unknown type: ${rule.type} — skipping`);
    }
}

// -- TIER-BASED TEST GENERATION --

for (const vp of Object.keys(rulesConfig.viewports || {})) {
    const vpData = rulesConfig.viewports[vp];

    test.describe(`Visual Rules - ${vp}`, () => {
        test.use({ viewport: vpData });

        const tierPageMap = {};
        for (const rule of rulesConfig.rules) {
            if (!rule.viewports?.includes(vp)) continue;
            const cat = rule.category || 'tests/script';
            for (const pageName of resolvePages(rule)) {
                const key = `${cat}|||${pageName}`;
                if (!tierPageMap[key]) tierPageMap[key] = [];
                tierPageMap[key].push(rule);
            }
        }

        for (const tier of TIER_ORDER) {
            test.describe(`[${tier}]`, () => {
                const pagesForTier = {};
                for (const [key, rules] of Object.entries(tierPageMap)) {
                    const [t, pageName] = key.split('|||');
                    if (t !== tier) continue;
                    pagesForTier[pageName] = rules;
                }
                if (Object.keys(pagesForTier).length === 0) return;

                if (tier === 'polish') {
                    test('flagged for review', async () => {
                        const flagged = [];
                        for (const [pageName, rules] of Object.entries(pagesForTier)) {
                            for (const rule of rules) {
                                flagged.push(`  ⚠ [${rule.id}] on ${pageName}`);
                            }
                        }
                        console.warn(`\n[polish] ${flagged.length} rule(s) flagged for human review:\n${flagged.join('\n')}\n`);
                    });
                    return;
                }

                for (const [pageName, rules] of Object.entries(pagesForTier)) {
                    test(`${pageName} (${rules.length} rules)`, async ({ page, aiAssert }) => {
                        await page.goto(pageName);
                        const failures = [];
                        const advisories = [];
                        for (const rule of rules) {
                            try {
                                await assertRule(page, aiAssert, rule, pageName, vp);
                            } catch (e) {
                                if (rule.severity === 'advisory') advisories.push({ id: rule.id, error: e.message });
                                else failures.push({ id: rule.id, error: e.message });
                            }
                        }
                        if (advisories.length > 0) console.warn(`[${tier}] ${advisories.length} advisory on ${pageName}:\n${advisories.map(f => `  ⚠ [${f.id}]: ${f.error}`).join('\n')}`);
                        if (failures.length > 0) throw new Error(`[${tier}] ${failures.length} rule(s) failed on ${pageName}:\n${failures.map(f => `  ✘ [${f.id}]: ${f.error}`).join('\n')}`);
                    });
                }
            });
        }
    });
}
