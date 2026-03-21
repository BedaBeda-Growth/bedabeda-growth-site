---
name: final-verify
description: "End-to-end staging-to-production deployment gate. Connects to a staging/ci-testing branch, pushes all Supabase migrations, runs unit tests and Playwright E2E until 100% green, gets Nick's explicit deploy confirmation, then pushes migrations to prod and merges to main. Use when code is ready to ship, when Nick says 'final verify', 'deploy', 'ship it', 'go to prod', or when all CI branches are green and it's time to land."
ruleDomains:
  - ops
  - deploy
---

# Final Verify — Staging → Green → Prod Deploy

> **Purpose:** Run the complete verification-to-deployment pipeline. Nothing
> reaches production without passing every gate AND getting Nick's explicit
> sign-off. This skill is the LAST gate before code goes live.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│ Final Verify Flow                                            │
│                                                              │
│  PHASE 1: STAGING SETUP                                      │
│  ├─ 1. Checkout staging/ci-testing branch                    │
│  ├─ 2. switch-env.sh ci-testing                              │
│  └─ 3. supabase link + db push --include-all                 │
│                                                              │
│  PHASE 2: GREEN GATE                                         │
│  ├─ 4. Run all unit tests (loop until green)                 │
│  └─ 5. Confirm Playwright 100% green (Jules/GH Actions)     │
│                                                              │
│  ── NICK CONFIRM GATE ──────────────────────────────────     │
│                                                              │
│  PHASE 3: PRODUCTION DEPLOY                                  │
│  ├─ a. switch-env.sh prod                                    │
│  ├─ b. supabase link + db push --include-all (prod)          │
│  ├─ c. Merge testing branch → origin main                    │
│  └─ d. Push to origin main → triggers deployment             │
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- `supabase` CLI installed (`brew install supabase/tap/supabase`)
- `scripts/switch-env.sh` present in repo
- `.env.ci-testing` and `.env.prod` configured locally
- Playwright tests passing in CI (Jules or GitHub Actions)
- Work ledger entry exists for the work being deployed

---

## Repo Map

| Repo | Staging Branch | Prod Ref | CI Testing Ref |
|------|---------------|----------|----------------|
| Rocket | `ci-testing-verify` or `staging` | `bagzchmynxxyhnkifzwe` | `byjbqxrjxzdqqaotyysr` |
| App | `staging` | *(check .env.prod)* | *(check .env.ci-testing)* |
| Spark | `staging` | *(check .env.prod)* | *(check .env.ci-testing)* |

> **Note:** Always confirm project refs from the repo's `.env.prod` and
> `.env.ci-testing` files. Do not hardcode refs for repos other than Rocket.

---

## Phase 1: Connect to Staging & Push Migrations

### Step 1: Checkout the staging branch

```bash
git fetch origin --no-tags
git checkout ci-testing-verify 2>/dev/null || git checkout staging
git pull
```

### Step 2: Switch environment to ci-testing

```bash
bash scripts/switch-env.sh ci-testing
bash scripts/switch-env.sh status
```

Verify all env files point at CI testing Supabase URL. **STOP if any points at production.**

### Step 3: Push all migrations to ci-testing

```bash
CI_REF=$(grep -E '^SUPABASE_PROJECT_REF=' .env.ci-testing 2>/dev/null | cut -d= -f2- || echo "")
supabase link --project-ref "${CI_REF:-byjbqxrjxzdqqaotyysr}"
supabase db push --include-all 2>&1 | tee /tmp/final-verify-db-push.log
```

### On migration conflicts:

1. Check remote state: `supabase migration list`
2. If remote has extra: review and accept or repair
3. If local has schema changes not in migrations: `supabase db diff --use-migra -f <name>`
4. Nuclear option (CI testing only, NEVER prod): `supabase db reset --linked`

---

## Phase 2: Run All Tests Until Green

### Step 4: Unit tests (loop until green, fix inline)

```bash
npx vitest run 2>&1 | tee /tmp/final-verify-unit-tests.log
```

### Step 5: Confirm Playwright E2E is 100% green

Check via GitHub Actions, Jules session, or local `verify-batch.sh full`.

---

## ── NICK CONFIRM GATE ──

**HARD STOP. Present full status to Nick. Do not proceed without explicit confirmation.**

---

## Phase 3: Production Deploy

### Step a: `bash scripts/switch-env.sh prod --yes`
### Step b: `supabase link --project-ref <prod-ref> && supabase db push --include-all`
### Step c: `git checkout main && git merge <staging_branch> --no-edit`
### Step d: `git push origin main`

---

## Rules

1. NEVER skip the Nick Confirm Gate.
2. NEVER run `db reset` on production.
3. ALL tests must be green before asking Nick.
4. Fix failures inline — do not skip or paper over tests.
5. Always restore environment after deployment.
6. Migration conflicts in prod require human review.
7. Update the work ledger after every deployment.
8. Verify the live site after deployment.