---
name: "clear-pipe"
description: "Orchestrate the entire verification and merge pipeline (check status, PR batching, test coverage sweep, cloud unit testing, local integration stamp, and Jules Playwright E2E) to eliminate manual handoffs. Produces a verified pre-production integration branch (ci-testing-verify or staging). NEVER touches main — explicit handoff to final-verify. Use when Nick says ''clear the pipe'', ''batch verify'', or wants to resolve the verification backlog."
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
  - deploy
---

# Clear Pipe — Batch Orchestration Pipeline

> **Purpose:** Automate the multi-phase transition from completed Jules work to a fully verified, E2E-tested pre-production branch, eliminating manual wait times and context switches.
>
> **Important:** This skill is an orchestrator. It wraps and delegates to existing atomic skills (`check-jules-status`, `jules-merge-verify`, `ci-full-verify`).
> 
> **CRITICAL RULE:** This skill NEVER touches the `main` branch. It strictly stops at the pre-production integration branch, requiring Nick to explicitly run `/final-verify` to deploy.

---

## Phase 0: Branch & Scope Setup

1. **Identify the working repo** and navigate to its root.
2. **Dynamically detect the pre-production integration branch:**
   ```bash
   TEST_BRANCH=$(git branch -r | grep 'origin/ci-testing-verify$' > /dev/null && echo "ci-testing-verify" || echo "staging")
   ```
3. **Ensure the branch exists locally and is up to date:**
   ```bash
   git fetch origin main --no-tags
   git checkout $TEST_BRANCH 2>/dev/null || git checkout -b $TEST_BRANCH origin/main
   git pull origin $TEST_BRANCH || true
   ```

---

## Phase 1: Check Pipeline & Prep PRs (check-jules-status)

1. Run `jules remote list --session` to list all recent sessions.
2. Identify sessions marked `Completed` or `Awaiting User Feedback`.
3. If any `Completed` session has no PR, request one via `jules remote respond`.
4. **Gate:** Ensure all items are in a PR (or explicitly skipped by Nick).
5. **Zero-Trust Proof Gate:** Reject PRs that only say "Tests pass" without raw terminal output.

---

## Phase 2: Cloud Merge & Unit Test (jules-merge-verify)

1. **Run `/jules-merge-verify` logic:** batch PRs (max 8), dispatch Jules to merge sequentially into `ci-integration-$BATCH_ID`.
2. **Async Polling Loop:** check every 600 seconds until session is Completed.
3. **Partial Success Recovery:** mark failed PRs as `blocked`, proceed with successful subset.

---

## Phase 2.5: Test Coverage Sweep

> **Why this phase exists:** When we pull down new Jules work and merge it, we need to confirm the test suite actually covers the new functionality — not just that old tests still pass. This phase diffs the merged branch's source symbols against the test suite and blocks advancement if meaningful new symbols have zero test coverage.

1. **Run the coverage sweep script against the current integration branch:**
   ```bash
   python3 .agents/skills/clear-pipe/scripts/coverage_sweep.py \
     --root . \
     --output /tmp/coverage_sweep_report.json \
     --exit-code \
     --verbose
   ```
   The script will:
   - Walk source dirs and extract exported functions, classes, and DB/RPC calls
   - Walk test dirs and map which symbols are referenced by existing tests
   - Diff them, flag uncovered symbols and stale test references pointing at deleted/renamed symbols
   - Emit a JSON report + human-readable summary

2. **Review the report:**
   ```bash
   cat /tmp/coverage_sweep_report.json | python3 -c "
   import json,sys
   r=json.load(sys.stdin)
   print(f''Status: {r[\"status\"]} | Coverage: {r[\"coverage_pct\"]:.1f}%'')
   print(f''Gaps: {r[\"uncovered_symbols\"]} uncovered symbols'')
   print(f''RPC gaps: {[k for k,v in r[\"rpc_coverage\"].items() if not v]}'')
   "
   ```

3. **If uncovered symbols are found (status = yellow or red):**

   **Option A — Auto-stub (preferred for new functions with no similar test):**
   ```bash
   python3 .agents/skills/clear-pipe/scripts/coverage_sweep.py \
     --root . \
     --output /tmp/coverage_sweep_report.json \
     --fix
   ```
   Writes stub test files under `__tests__/generated/`. Each stub has a forced-fail assertion visible in CI.

   **Option B — Refactor an existing test (preferred when a close match exists):**
   - The report includes `refactor_suggestions` — existing test files with high name similarity.
   - Expand the suggested test to cover the new symbol using real data. No mocks of the function under test.

   **Option C — Explicit skip (only for test-irrelevant symbols):**
   - Add `// coverage-sweep-skip: <reason>` in the source file above the symbol.
   - Surface this skip to Nick before advancing.

4. **After implementing stubs or refactors — re-run the test suite** and verify green/acceptable.

5. **Gate:**
   - `GREEN` (coverage >= 80%): proceed to Phase 3.
   - `YELLOW` (50-79%): proceed with warning — log uncovered symbols in work ledger as debt.
   - `RED` (< 50% or uncovered RPCs): **BLOCK** Phase 3. Fix gaps or justify skips.
   - Any uncovered `rpc` kind symbol is always a gate — DB calls must have at least one test.

---

## Phase 3: Local Integration Stamp

1. Pull `ci-integration-$BATCH_ID`, run full test suite locally, fix any failures.
2. Merge to `$TEST_BRANCH` and push.

---

## Phase 4: Cloud E2E Self-Healing Loop (Jules)

Dispatch Jules against `$TEST_BRANCH` to run Playwright, self-heal failures, and push green.

---

## Phase 5: Handoff to `final-verify`

Update work ledger to `verified`. Present summary to Nick. STOP — do not run `/final-verify` without explicit command.

---

## Variants / Absorbed Modes

### --batch
Orchestrate merging multiple PRs sequentially.
*(absorbed: batch-verify)*

### --finish
Run full unit tests, ensure 100% green, dispatch final E2E.
*(absorbed: finish-pipeline)*
