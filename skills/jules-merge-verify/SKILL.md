---
name: "jules-merge-verify"
description: "Scan open Jules/Conveyor PRs against project docs for sanity, batch them, and dispatch coordinated Jules sessions to sequentially merge PRs into a ci-integration branch, run unit tests after each merge, fix failures, and culminate in a full Playwright E2E run — all on cloud Vega machines so local hardware is never bottlenecked. Use when there are open PRs from Jules that need integration testing before landing on main."
ruleDomains:
  - ops
  - deploy
---

# Jules Merge & Verify

Offload the merge-test-fix loop to Jules cloud VMs. One Jules session handles an entire batch: merge PR → unit test → fix → next PR → … → Playwright E2E → push.

## Repo Map

| Key | GitHub | Local Path |
|-----|--------|------------|
| `rocket` | `PinchForth/fractional-ignite` | `~/SOS/Rocket/fractional-ignite` |
| `spark-kanban` | `PinchForth/spark-kanban` | `~/Documents/spark-kanban` |
| `app` | `FreelyPF/app` | `~/SOS/App` |
| `rv` | `PinchForth/rv` | `~/rv` |
| `scceo` | `PinchForth/scceo` | `~/scceo-1` |

## Phase 1 — Gather & Scan PRs

### 1.1 List open PRs

Per target repo:

```bash
cd <local_path> && gh pr list --state open --json number,title,headRefName,url
```

Collect every PR into a working list: `[{number, title, branch, url, repo_key}]`.

### 1.2 Quick sanity scan

For each PR, fetch the diff and check against project docs and rules:

```bash
gh pr diff <number> --color=never
```

**Flag a PR if any of these are true:**
- Touches >30 files (probable scope explosion)
- Deletes or renames core config (`vite.config`, `tsconfig`, `package.json` scripts section)
- Introduces new dependencies not mentioned in the originating plan
- Contains obvious placeholder code (`TODO`, `FIXME`, `console.log("test")`)
- Conflicts with another PR in the same batch (overlapping file set)

Present a scan dashboard to Nick:

```
## 🔍 PR Scan Results

| # | Repo | PR | Title | Files | Flags | Verdict |
|---|------|----|-------|-------|-------|---------|
| 1 | rocket | #42 | Fix test cleanup | 4 | — | ✅ PASS |
| 2 | rocket | #43 | Pricing overhaul | 38 | 🚩 >30 files | ⚠️ REVIEW |
| 3 | spark  | #12 | Add email guard | 6 | — | ✅ PASS |
```

Wait for Nick to approve/reject the list before proceeding.

### 1.3 Build batches

Group passing PRs into batches for a single Jules session:

- **Max 8 PRs per batch** (avoid token-limit pressure in one session).
- **One batch per repo** (Jules checks out one repo per session).
- Order PRs from least-risk → most-risk within each batch (smaller diffs first).
- If two PRs touch overlapping files, place them adjacent so merge conflicts surface early.


## Rule Gate (run before acting)

Before dispatching, deploying, or mutating state, call:

```
check_rule_hits(domain="deploy", last_n=5)
```

If any `high` or `critical` severity hits are active:
- Surface them to Nick before proceeding
- Do not suppress or skip — a recent hit means the system detected drift
- If the hit is expected and understood, note it and continue

This gate costs one MCP call. It prevents re-triggering known violations.

## Phase 2 — Dispatch to Jules

For each batch, dispatch a single Jules session with the merge-verify prompt:

```bash
jules remote new \
  --repo <owner/repo> \
  --session "Sequential Merge & Verify Loop

BRANCHES (merge in this exact order):
1. <branch_1>  — <title_1>
2. <branch_2>  — <title_2>
3. <branch_3>  — <title_3>

PROCEDURE:
1. git checkout main && git pull origin main
2. git checkout -b ci-integration-<batch_id>
3. For each branch above, in order:
   a. git merge origin/<branch> --no-edit
   b. If merge conflicts: resolve them logically, commit.
   c. Run unit tests: npm run test:unit (or vitest run)
   d. If tests fail: diagnose, fix, commit fix, re-run tests.
   e. Only proceed to next branch once tests are GREEN.
4. After ALL branches are merged and unit tests pass:
   a. Run full E2E suite: npx playwright test
   b. If E2E fails: diagnose, fix, commit, re-run until green.
5. Push ci-integration-<batch_id> to origin.
6. Open a PR: base=main, head=ci-integration-<batch_id>.
7. In the PR body, list every original PR merged and test results.

IMPORTANT:
- Never skip a failing test — fix it before moving on.
- Commit frequently with clear messages.
- If a single PR causes cascading failures you cannot resolve in 3 attempts, skip it, revert its merge, note it in the PR body, and continue with the remaining PRs."
```

Record returned `session_id` mapped to the batch.

## Phase 3 — Monitor

```bash
jules remote list --session
```

Check periodically. If a session is stalled (no activity for >30 min), flag it.

## Phase 4 — Land the Batch

Once Jules reports success:

1. Review the `ci-integration-<batch_id>` PR on GitHub — verify the test evidence in the PR body.
2. Merge:
   ```bash
   gh pr merge <ci_pr_number> --squash --delete-branch
   ```
3. Close the original individual PRs that were absorbed:
   ```bash
   gh pr close <original_pr_number> --comment "Merged via ci-integration-<batch_id>"
   ```

## Phase 5 — Update Ledger & Sync

Mark each absorbed item as `verified` in the work ledger:

```bash
cd ~/scceo-1/grok-personal && python3 ledger_distributor.py pull --execute
cd ~/scceo-1/grok-personal && python3 ledger_to_dashboard.py --sync
```

## Failure Handling

| Scenario | Action |
|----------|--------|
| Jules session times out | Re-dispatch batch with `--session` picking up from last green state |
| Single PR causes cascading failures | Jules auto-skips after 3 attempts; flag that PR for manual review |
| Merge conflict between two batch PRs | Jules resolves if possible; if not, the later PR is skipped |
| Playwright fails on infra (not code) | Re-run the session — transient flakes are expected |

## Output Contract

Always report:
1. **Scan Dashboard** — per-PR flag/verdict table
2. **Dispatch Summary** — batch_id, repo, session_id, PR list
3. **Session Status** — live/completed/failed
4. **Landing Report** — merged ci-integration PR URL, closed original PRs
5. **Ledger Sync Confirmation**
