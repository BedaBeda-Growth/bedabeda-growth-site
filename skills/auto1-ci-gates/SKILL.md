---
name: "Auto1 CI Gates"
description: "Run repo-specific preflight, quick, and full CI gate checks for auto1 with production-safety blocking."
alwaysAllow:
  - Bash
  - Read
globs:
  - "**/*"
ruleDomains:
  - ops
---

# Auto1 CI Gates

Primary target repo:
- `/Users/nicholaspetros/SOS/Auto-1`

## Mode contract
If user doesn’t specify mode, default to `quick`.

Supported modes:
- `preflight`
- `quick`
- `full`

## Non-negotiable safety rules
1. Never run production deploy/push automatically.
2. Never run destructive DB commands without explicit user confirmation.
3. If environment target appears production while user asks CI/staging checks, block and provide env-switch command(s).
4. Any failing gate/test -> `BLOCKED – DO NOT SHIP`.

## preflight
Run from repo root and report:
- `git branch --show-current`
- `git status --short`
- `node -v` + `npm -v` (when Node repo)
- `cat supabase/.temp/project-ref` (if present)

## quick
From repo root, discover available scripts in `package.json` and run fast-fail gates in this order when present:
1. `npx tsc --noEmit` (or `npm run type-check`)
2. structural/policy gates if repo has them (e.g., `scripts/structural-gates.sh`, `npm run policy-check`)
3. `npm run test:unit:critical` if present
4. fallback: `npm test` / `npm run test` (only if no critical script exists)

Stop on first hard failure and report exact failing command + top error.

## full
From repo root:
1. Run repo’s canonical full gate command if present (e.g., `scripts/gatekeeper.sh`, `npm run validate`, CI-equivalent suite)
2. If no explicit gatekeeper exists, run: type-check + lint + full test suite in repo-defined order.
3. Include artifact/report paths when available.

## Required output format
1. **Mode**
2. **Environment Snapshot** (branch, dirty/clean, target ref if present)
3. **Checks Run** (✅/❌ per command)
4. **Verdict** (`PASS – SAFE TO SHIP` or `BLOCKED – DO NOT SHIP`)
5. **Next Action** (single best next command)
6. **Artifacts** (paths/links)

## Notes
- Prefer existing repo scripts over invented commands.
- Keep responses concise, actionable, and release-focused.
