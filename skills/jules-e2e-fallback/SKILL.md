---
name: "jules-e2e-fallback"
description: "Check Jules status for failing E2E tests, pull the code down, fix the issues locally, ensure unit tests remain green, and push back for a final Jules E2E run. Use this when Jules repeatedly struggles to fix an E2E test or times out."
ruleDomains:
  - ops
  - deploy
  - testing
---

# Jules E2E Fallback

When a Jules session tasked with running E2E tests (like Playwright verification) gets stuck in a failure loop or times out, you (the local agent) must intervene. This skill defines the fast-path for pulling the failing branch down, investigating the test failure, fixing it locally, and pushing it back up for a clean Jules run to maintain velocity.

## Phase 1: Diagnose the Failure

1. **Check Jules Status:**
   Find the failing session ID or branch by listing recent sessions:
   ```bash
   jules remote ls --limit 10
   ```
   Or explicitly ask the user which session/branch is failing.

2. **Read the Logs:**
   If the user hasn't provided the error, check the logs of the failing session to understand *why* the E2E test failed. Look for specific Playwright assertions, timeout errors, or unexpected UI states.
   ```bash
   jules remote logs <SESSION_ID>
   ```

## Phase 2: Local Repair

1. **Pull and Checkout the Branch:**
   Identify the branch Jules was working on (e.g., `ci-integration-rocket-batch-3`) and pull it locally:
   ```bash
   git fetch origin <BRANCH_NAME>
   git checkout <BRANCH_NAME>
   git pull origin <BRANCH_NAME>
   ```

2. **Implement the Fix:**
   Based on the Playwright logs, modify the corresponding source code (`src/...`) or the test file itself (`tests/...`).
   - If a test selector changed due to a UI update, fix the test.
   - If the UI is genuinely broken or missing a state handled by the test, fix the UI component.

## Phase 3: Local Verification

Before you send code back to Jules, you MUST ensure you didn't break the rest of the application.

1. **Run Unit Tests Natively:**
   Run the local, fast Vitest suite to guarantee your fix didn't introduce new regressions.
   ```bash
   # (Adjust command if repo uses jest or similar)
   npx vitest run
   ```
2. **Handle Failures:**
   If unit tests fail, fix them recursively until `npx vitest run` is **100% GREEN**.

## Phase 4: Push and Re-dispatch

1. **Commit and Push:**
   Commit your targeted fix with a descriptive message indicating it resolves the E2E failure.
   ```bash
   git add .
   git commit -m "fix(e2e): <short description of the fix>"
   git push origin <BRANCH_NAME>
   ```

2. **Dispatch Jules:**
   Trigger a new Jules session specifically to run the native E2E suite within its VM. Do NOT use GitHub Actions.
   ```bash
   jules remote new \
     --repo $(gh repo view --json nameWithOwner -q .nameWithOwner) \
     --session "Final E2E Verification & Self-Healing (Fallback Triggered)
   
   BRANCH: <BRANCH_NAME>

   PROCEDURE:
   1. git checkout <BRANCH_NAME> && git pull origin <BRANCH_NAME>
   2. bash scripts/switch-env.sh ci-testing
   3. npx playwright test
   4. If a test fails, read the Playwright output. Fix it locally in the VM and commit.
   5. Loop until 100% GREEN.
   6. git push origin <BRANCH_NAME>
   
   CRITICAL RULES:
   - GitHub Actions is STRICTLY for orchestration.
   - DO NOT run tests via GitHub Actions.
   - Run Playwright natively within the Jules/Vega VM."
   ```

3. **Report:**
   Inform the user that the branch was fixed locally, unit tests are green, and Jules has been re-dispatched to complete the E2E verification.
