---
name: "Verification Router"
description: "When asked to verify, detect the current repo and run the repo-specific preflight/quick/full verification gates with a ship/no-ship verdict."
alwaysAllow:
  - Bash
  - Read
globs:
  - "**/*"
ruleDomains:
  - ops
---

# Verification Router

Use this skill whenever the user says things like:
- "verify"
- "run verification"
- "run gates"
- "quick check"
- "full validation"

## Intent

1. Detect which repo we are currently in.
2. Resolve that repo to a known verification profile.
3. Run the repo's gates in `preflight`, `quick`, or `full` mode.
4. Return a standardized verdict.

If mode is not specified, default to `quick` — **except for `rocket`, where you must ask the user which mode to run before proceeding (UNLESS the `auto_verify` flag is provided, in which case default to `quick` without asking).**

---

## Safety Rules (non-negotiable)

1. Never run deploy/push-to-production commands automatically.
2. Never run destructive DB commands without explicit user confirmation.
3. If target environment appears production while user requested CI/staging validation, block and provide env switch guidance.
4. Any failing mandatory gate/test => `BLOCKED – DO NOT SHIP`.

---

## Step 0 — Hygiene Cleanup (mandatory)

Always run the Antigravity session cleaner first to reclaim RAM before running heavy verification gating:

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --execute --hours 6
```

---

## Step 1 — Detect current repo (mandatory)

Run:

1. `pwd`
2. `git rev-parse --show-toplevel`
3. `git branch --show-current`
4. `git status --short`
5. `node -v` and `npm -v` (for Node repos)
6. `cat supabase/.temp/project-ref` if present

Use `git rev-parse --show-toplevel` as canonical root.

---

## Step 2 — Resolve repo profile

Match canonical repo root to one of the configured profiles.

### Key repo map

- `/Users/nicholaspetros/SOS/App` -> `app`
- `/Users/nicholaspetros/SOS/Web` -> `web`
- `/Users/nicholaspetros/SOS/Rocket/fractional-ignite` -> `rocket`
- `/Users/nicholaspetros/SOS/SOS 2/portal` -> `legacy`

If no match:
- Verdict: `BLOCKED – UNKNOWN REPO`
- Ask user to add a profile for this repo before verification can continue.

---

## Step 3 — Mode execution contract

Supported modes:
- `preflight`
- `quick`
- `full`

Default mode: `quick` — **except `rocket`: always ask the user which mode to run if not specified (UNLESS `auto_verify` is set, then use `quick`).**

---

## Repo Profiles

---

## profile: app
Root: `/Users/nicholaspetros/SOS/App`

### preflight
Run from repo root and report:
- `git branch --show-current`
- `git status --short`
- `node -v` + `npm -v`
- `cat supabase/.temp/project-ref` (if present)

### quick
From repo root, run fast-fail gates in this order when present:
1. `npx tsc --noEmit` (or `npm run type-check`)
2. structural/policy checks if present (`bash scripts/structural-gates.sh`, `npm run policy-check`)
3. `npm run test:unit:critical`
4. fallback: `npm test` or `npm run test` only if no critical script exists

Stop on first hard failure and report exact failing command + top error.

### full
From repo root:
1. Run canonical full gate if present (`bash scripts/gatekeeper.sh`, `npm run validate`, CI-equivalent)
2. Otherwise run: type-check + lint + full tests in repo-defined order
3. Include artifact/report paths

---

## profile: web
Root: `/Users/nicholaspetros/SOS/Web`

### preflight
Run from repo root and report:
- `git branch --show-current`
- `git status --short`
- `node -v` + `npm -v`
- `cat supabase/.temp/project-ref` (if present)

### quick
From repo root, run fast-fail gates in this order when present:
1. `npx tsc --noEmit` (or `npm run type-check`)
2. structural/policy checks if present (`bash scripts/structural-gates.sh`, `npm run policy-check`)
3. `npm run test:unit:critical`
4. fallback: `npm test` or `npm run test` only if no critical script exists

Stop on first hard failure and report exact failing command + top error.

### full
From repo root:
1. Run canonical full gate if present (`bash scripts/gatekeeper.sh`, `npm run validate`)
2. Otherwise run: type-check + lint + full tests in repo-defined order
3. Include artifact/report paths

---

## profile: legacy
Root: `/Users/nicholaspetros/SOS/SOS 2/portal`

### preflight
Run from repo root and report:
- `git branch --show-current`
- `git status --short`
- `node -v` + `npm -v`
- `cat supabase/.temp/project-ref` (if present)

### quick
From repo root, run fast-fail gates in this order when present:
1. `npx tsc --noEmit` (or `npm run type-check`)
2. structural/policy checks if present (`bash scripts/structural-gates.sh`, `npm run policy-check`)
3. `npm run test:unit:critical`
4. fallback: `npm test` or `npm run test` only if no critical script exists

Stop on first hard failure and report exact failing command + top error.

### full
From repo root:
1. Run canonical full gate if present (`bash scripts/gatekeeper.sh`, `npm run validate`)
2. Otherwise run: type-check + lint + full tests in repo-defined order
3. Include artifact/report paths

---

## profile: rocket
Root: `/Users/nicholaspetros/SOS/Rocket/fractional-ignite`

For this repo, **delegate completely to the `rocket-ci-gates` skill.** 

1. Check which mode the user wants. **Always ask the user which mode to run if not specified (preflight / quick / full), UNLESS `auto_verify` is passed in which case use `quick`.**
2. Invoke the **`rocket-ci-gates`** skill with the requested mode. Do not run any commands here manually—let `rocket-ci-gates` handle all execution, safety blocking, and environment checks.

---

## Failure handling

- In `quick`, fast-fail: stop on first hard failure.
- Report exact failing command and top error snippet.
- Final verdict must be one of:
  - `PASS – SAFE TO SHIP`
  - `BLOCKED – DO NOT SHIP`

---

## Required Output Format (always)

1. **Repo Detected**
2. **Mode**
3. **Environment Snapshot** (branch, dirty/clean, project-ref if present)
4. **Checks Run** (✅/❌ per command)
5. **Verdict** (`PASS – SAFE TO SHIP` or `BLOCKED – DO NOT SHIP`)
6. **Next Action** (single best command)
7. **Artifacts** (paths/links)
