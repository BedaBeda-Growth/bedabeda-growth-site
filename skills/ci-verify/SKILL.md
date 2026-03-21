---
name: ci-verify
description: Pull open PRs into a testing branch, merge one-by-one with verification gates after each, and optionally fan out subagents via worktrees for parallel pre-flight checks.
ruleDomains:
  - ops
  - deploy
---

# CI-Verify Skill — Parallel PR Processing Pipeline

> **Purpose:** Efficiently process a backlog of open PRs by merging them
> one-by-one into a testing branch, running tiered verification after each merge,
> and optionally spawning parallel subagents to pre-check branches before they
> enter the main merge queue.
>
> **When to use:** When there are 5+ open PRs that need to be validated before
> merging to `main`. This replaces ad hoc manual cherry-picking and test runs.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Main Session (this agent)                               │
│                                                         │
│  1. Discover open PRs (gh pr list)                      │
│  2. Prioritize by label / ledger / title signals        │
│  3. Run ci-merge-verify.sh (sequential merge + verify)  │
│  4. Fix any failures inline                             │
│  5. Commit + report                                     │
│                                                         │
│  ┌─ Optional parallel fan-out (for 10+ PRs) ──────────┐ │
│  │  git worktree add ../agent-N-worktree               │ │
│  │  kai-bridge heartbeat_enqueue → subagent tasks      │ │
│  │  Subagents: checkout → structural-gates → tsc → fix │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Prepare the Testing Branch

Ensure you're on a clean testing branch that tracks `main`:

```bash
# If ci-testing-verify branch exists, use it. Otherwise create from main.
git fetch origin main --no-tags
git checkout ci-testing-verify 2>/dev/null || git checkout -b ci-testing-verify origin/main
git pull --ff-only origin main 2>/dev/null || true
```

If there are uncommitted changes (e.g. prior test fixes), commit them first:
```bash
git add -A && git commit -m "chore: checkpoint uncommitted fixes" || true
```

---

## Step 2: Discover and Prioritize Open PRs

Get the full list of open PRs:
```bash
gh pr list --state open --json number,title,headRefName,labels --limit 50
```

### Priority ordering rules:
1. **P0 REVENUE** — anything with `P0`, `revenue`, `checkout`, `payment` in title
2. **P1 STABILITY** — `P1`, `fix`, `sentry`, `pkce`, `auth` keywords
3. **P2 FEATURES** — `feat`, `conveyor`, feature PRs
4. **P3 CHORES** — `chore`, `perf`, `docs`

### Already-merged detection:
Check which PR branches are already ancestors of the current testing branch:
```bash
for BRANCH in <branch-list>; do
  git merge-base --is-ancestor "origin/$BRANCH" HEAD 2>/dev/null && echo "SKIP $BRANCH" || echo "QUEUE $BRANCH"
done
```

Announce the plan to the user before executing:
```
📋 CI Verify Queue (N branches):
  P0: #767 — Xendit Live Cutover
  P0: #819 — Payment Flow Health Monitor
  P1: #668 — PKCE Auth Fix
  ...
  Already merged (skip): #833, #831, #830
```

---

## Step 3: Run the Merge + Verify Loop

Use the generalized script `scripts/ci-merge-verify.sh`:

```bash
# For a small batch (< 8 PRs), run smoke mode:
bash scripts/ci-merge-verify.sh --mode smoke \
  branch1 branch2 branch3 ...

# Or pipe from gh directly:
gh pr list --state open --json headRefName -q '.[].headRefName' \
  | bash scripts/ci-merge-verify.sh --stdin --mode quick

# Full mode for final validation:
bash scripts/ci-merge-verify.sh --mode full branch1 branch2

# Dry run to preview:
bash scripts/ci-merge-verify.sh --dry-run branch1 branch2
```

### What ci-merge-verify.sh does for each branch:
1. `git fetch origin <branch>` — pull latest
2. `git merge --no-edit FETCH_HEAD` — merge into testing branch
3. `bash scripts/verify-batch.sh <mode>` — run tiered verification:
   - **Tier 1:** Structural gates (2s)
   - **Tier 2:** TypeScript `tsc --noEmit` (5s)
   - **Tier 3:** Vite production build (12s)
   - **Tier 4:** Vitest unit tests (3s)
   - **Tier 5:** Vitest gate tests (5s)
   - **Tier 6:** Playwright E2E (3-12 min depending on mode)
4. If any tier fails → stop queue, report which branch broke it
5. JSON report written to `/tmp/ci-merge-verify-report.json`

### On failure:
- Read the verify log: `cat /tmp/verify_<branch_name>.log`
- Fix the issue inline (update selectors, fix imports, resolve conflicts)
- Re-run: `bash scripts/ci-merge-verify.sh --mode smoke remaining-branch1 remaining-branch2`

---

## Step 4: Parallel Fan-Out (Optional — for 10+ PRs)

When the backlog is large, use `git worktree` to spawn sandboxed clones
and dispatch subagents to pre-check branches before they enter the main queue.

### Create worktrees:
```bash
git worktree add ../agent-2-worktree ci-testing-verify 2>/dev/null || true
git worktree add ../agent-3-worktree ci-testing-verify 2>/dev/null || true

# Symlink node_modules to avoid reinstalling
ln -sf "$(pwd)/node_modules" ../agent-2-worktree/node_modules
ln -sf "$(pwd)/node_modules" ../agent-3-worktree/node_modules
```

### Create task manifests:
Write a markdown task file for each subagent with their assigned branches:

```markdown
# Pre-Flight Check (Agent N)
**Branches to verify:**
1. `conveyor/feature-branch-a`
2. `conveyor/feature-branch-b`

**Instructions:**
1. git checkout <branch>
2. bash scripts/structural-gates.sh
3. npx tsc --noEmit
4. Fix any errors, commit, push back to origin
```

### Dispatch via kai-bridge:
```
mcp_kai-bridge_heartbeat_enqueue(
  task_file: "/path/to/task_agentN.md",
  workspace: "/path/to/agent-N-worktree"
)
```

### Monitor:
```
mcp_kai-bridge_check_heartbeat()
mcp_kai-bridge_review_completions(since_hours: 2)
```

### Cleanup worktrees when done:
```bash
git worktree remove ../agent-2-worktree --force 2>/dev/null || true
git worktree remove ../agent-3-worktree --force 2>/dev/null || true
```

---

## Step 5: Supabase Schema Sync (If Needed)

If E2E tests hit 404s on tables like `notes` or `user_knowledge_base`, the
Supabase branch database is out of sync with the migration files. Fix by:

1. Check what migrations exist on the branch DB vs local files:
   ```
   mcp_supabase-mcp-server_list_migrations(project_id: "<branch-project-ref>")
   ```
2. Apply missing migrations directly:
   ```
   mcp_supabase-mcp-server_apply_migration(
     project_id: "<branch-project-ref>",
     name: "<migration_name>",
     query: "<SQL content>"
   )
   ```
3. Or rebase the branch to re-run all migrations:
   ```
   mcp_supabase-mcp-server_rebase_branch(branch_id: "<branch-uuid>")
   ```

---

## Step 6: Fix Common E2E Failures

### Pattern: Test selectors referencing old UI text
- **Symptom:** `locator.click: Timeout waiting for selector`
- **Fix:** Find the actual text in the component source:
  ```bash
  grep -r "Button text" src/pages/ src/components/
  ```
  Update the test selector to match.

### Pattern: Tests assume authenticated session on protected routes
- **Symptom:** Test navigates to `/onboarding/complete`, asserts URL, but app redirects to login
- **Fix:** Either mock the auth state or update the test to expect the redirect:
  ```typescript
  // Option 1: Skip if no auth
  test.skip(!process.env.TEST_USER_EMAIL, 'Requires authenticated session');

  // Option 2: Assert the redirect instead
  await expect(page).not.toHaveURL(/\/onboarding\/complete/);
  ```

### Pattern: Supabase table 404 in test logs
- **Symptom:** `PGRST205: Could not find the table 'public.notes'`
- **Fix:** Apply the missing migration to the branch DB (see Step 5).

---

## Step 7: Report Results

After the merge+verify loop completes, output a summary:

```
✅ CI Verify Complete — 17 branches processed

| # | Branch                          | Status  | Time |
|---|-------------------------------|---------|------|
| 1 | ninja/w2-03-pkce-auth-fix     | ✅ pass | 42s  |
| 2 | conveyor/pri-xendit-live       | ✅ pass | 38s  |
| 3 | conveyor/pri-checkout-routing  | ❌ fail | 55s  |
| 4 | (remaining branches skipped)  |         |      |

Report: /tmp/ci-merge-verify-report.json
```

Commit the merged testing branch:
```bash
git add -A
git commit -m "ci: batch merge + verify — N PRs passed, M fixed"
```

---

## Rules

- **Never merge directly to `main`.** Always use a testing branch (`ci-testing-verify`).
- **Stop on first failure.** Fix it before continuing — don't mask cascading breaks.
- **Keep verify mode appropriate.** Use `quick` for structural pre-flight, `smoke` for normal merges, `full` only for final validation before pushing to `main`.
- **Clean up worktrees** after subagents complete.
- **The JSON report is the source of truth** — always check `/tmp/ci-merge-verify-report.json`.
