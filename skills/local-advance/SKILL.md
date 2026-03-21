---
name: "local-advance"
description: "Batch merge PRs locally, execute unit tests natively/locally (vitest), fix failures, and dispatch Jules to run Playwright E2E. Use this as a fast-path alternative to jules-merge-verify when Jules' orchestration fails or when you need tighter local control to push changes through the pipeline."
ruleDomains:
  - ops
  - deploy
---

# Local Advance — Batch Orchestrator

This skill is a fast-path alternative to `clear-pipe` / `jules-merge-verify`. Instead of dispatching Jules to perform the git merges and unit testing, **you (the local agent)** perform the merges and run unit tests natively locally. Once 100% green on unit tests, and only then, you dispatch Jules to run the heavy Playwright E2E tests in the cloud.

## Phase 1: PR Selection

1. **List open PRs:**
   ```bash
   gh pr list --state open --json number,title,headRefName,url
   ```
2. **Consult Nick:** Decide which PRs to bundle into the current integration batch based on priority and readiness. Max ~5 PRs per batch to keep debugging manageable.

## Phase 2: Local Branch Setup

1. **Checkout & Branch:**
   ```bash
   git checkout main && git pull origin main
   BATCH_NAME="ci-integration-batch-$(date +%s)"
   git checkout -b $BATCH_NAME
   ```

2. **Sequential Merge:**
   For each PR in the batch, fetch the reference and merge it:
   ```bash
   git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
   git merge pr-<PR_NUMBER> --no-edit
   ```
   *If conflicts arise, stop and resolve them immediately before merging the next PR.*

## Phase 3: Local Unit Testing & Self-Healing

1. **Run Unit Tests:**
   ```bash
   npx vitest run
   ```
   *Alternatively, if `jest` or `npm test` is the standard for the repo, use those.*
2. **Self-Heal:**
   If the tests fail, diagnose the failure, fix the code/tests, commit your fix, and re-run. Loop until tests are **100% GREEN**.

## Phase 4: Push to Cloud & Open PR

1. **Push:** 
   Push your new integration branch to origin, bypassing pre-push hooks if they get stuck looking for husky that wasn't properly synced:
   ```bash
   git push --no-verify --set-upstream origin $BATCH_NAME
   ```
2. **Open PR:**
   ```bash
   gh pr create -B main -H $BATCH_NAME --title "ci: Integration Batch" --body "Batch merge containing PRs: [list]. Vitest passed locally, dispatching Jules for E2E."
   ```

## Phase 5: Dispatch Jules for E2E Playwright

Now offload the heavy browser tests to Jules. 

**CRITICAL RULE:** Jules must never use GitHub Actions to run workflows natively. We only trigger the tests natively inside the Vega environment.

1. **Dispatch:**
   ```bash
   jules remote new \
     --repo $(gh repo view --json nameWithOwner -q .nameWithOwner) \
     --session "Final E2E Verification & Self-Healing

   BRANCH: $BATCH_NAME

   PROCEDURE:
   1. git checkout $BATCH_NAME && git pull origin $BATCH_NAME
   2. bash scripts/switch-env.sh ci-testing
   3. npx playwright test
   4. If a test fails, read the Playwright output/trace. Fix the test or the component code.
   5. Commit the fix and re-run the failed tests. Loop until 100% GREEN.
   6. git push origin $BATCH_NAME

   CRITICAL RULES FOR ENVIRONMENT CONTEXT:
   - GitHub Actions is strictly for ORCHESTRATION ONLY.
   - DO NOT attempt to run Playwright, Vitest, or NPM tests via GitHub Actions natively.
   - DO NOT modify files in .github/workflows to fix test failures.
   - Run all tests locally/natively exactly where you are inside the Jules/Vega VM."
   ```

2. **Monitor:** You can use `run-poll` to monitor the Jules task until completion.