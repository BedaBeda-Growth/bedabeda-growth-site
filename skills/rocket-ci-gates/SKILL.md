---
name: "Rocket CI Gates"
description: "Run Rocket preflight, quick, and full CI gate checks with production-target safety blocking and ship/no-ship verdicts."
alwaysAllow:
  - Bash
  - Read
globs:
  - "**/fractional-ignite/**"
  - "**/.github/workflows/*.yml"
  - "**/profiles/rocket.yaml"
ruleDomains:
  - ops
---

# Rocket CI Gates

Use this skill to run and command Rocket's CI/gating protocol from chat.

Primary target repo:
- `/Users/nicholaspetros/SOS/Rocket/fractional-ignite`

## Mode contract

Always ask which mode to run if user didn’t specify:
- `preflight`
- `quick`
- `full`

If user says “run gates” with no mode, default to `quick`.

---

## Non-negotiable safety rules

1. **Never run production deploy/push commands automatically.**
2. **Never run destructive DB commands without explicit user confirmation.**
3. **If user intent is CI/staging checks and project-ref is production (`bagzchmynxxyhnkifzwe`), BLOCK and instruct env switch first.**
4. Treat any failure in structural gates, policy checks, type checks, or test gates as **BLOCKED – DO NOT SHIP**.

---

## Commands by mode

Run from repo root:
`cd /Users/nicholaspetros/SOS/Rocket/fractional-ignite`

### 0) Hygiene Cleanup (All modes)
Always run the session cleaner first to reclaim RAM:
```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --execute --hours 6
```

### 1) preflight
Run and report:
- `git branch --show-current`
- `git status --short`
- `cat supabase/.temp/project-ref` (if present)
- `node -v`
- `npm -v`

Interpretation:
- If repo is dirty, warn (do not block by itself).
- If target ref is prod and user asked for CI checks, **block** with exact fix:
  - `./scripts/switch-env.sh ci-testing`
  - `npx supabase link --project-ref byjbqxrjxzdqqaotyysr`

### 2) quick
Run in this exact order:
1. `npx tsc --noEmit`
2. `bash scripts/structural-gates.sh`
3. `npm run policy-check`
4. `npm run test:unit:critical`

Optional feature-specific (if user asks Ember Notes validation):
- `npx vitest run tests/unit/useNotes.test.tsx --reporter=verbose`
- `npx playwright test tests/critical/voice-brain-notes.spec.ts`

### 3) full
Run:
1. `bash scripts/gatekeeper.sh` (non-dry-run)
2. If user requests HQ ACK trace, run:
   - `bash scripts/gk-complete.sh --plan-id <PLAN_ID> --task-id <TASK_ID> --actor claude`

Before any command that could touch remote DB state, confirm target and ask for approval if there is any ambiguity.

---

## Output format (required)

Always return this structure:

1. **Mode**: `preflight|quick|full`
2. **Environment Snapshot**
   - Branch
   - Dirty/clean working tree
   - Supabase project ref
3. **Checks Run**
   - list each command with ✅/❌
4. **Verdict**
   - `PASS – SAFE TO SHIP` OR
   - `BLOCKED – DO NOT SHIP`
5. **Next Action**
   - single best next command/action
6. **Artifacts**
   - include gatekeeper artifact paths when available

If blocked, include exact failing command and top error snippet.

---

## Practical guidance

- Prefer fast-fail: stop early on hard gate failures in `quick` mode.
- In `full` mode, include summary from `artifacts/gatekeeper/latest/result.json`.
- Do not invent commands if repo scripts already exist.
- Keep responses concise, actionable, and release-focused.
