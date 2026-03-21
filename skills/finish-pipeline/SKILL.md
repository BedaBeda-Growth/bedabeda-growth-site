---
name: "finish-pipeline"
description: "A meta-orchestrator skill specific to the current repo's pipeline. Tells the agent to wait for Jules skills to complete, verify everything is merged into the test branch, run the full unit test suite manually to get 100% green, and FINALLY dispatch the final E2E playwright suite to Jules. Use this when ready to close out a pipeline in a single repo."
ruleDomains:
  - ops
  - deploy
---

# Finish Pipeline — Repo-Specific Batch Orchestration

> **Purpose:** Automate the handoff from Jules feature work to a fully verified test branch within a single repository. Unlike broad cross-repo pipes, this explicitly orchestrates the sequence of `check-jules-status` -> `jules-merge-verify` -> `Local Self-Healing Unit Tests` -> `Jules Playwright Dispatch` in the selected repo.
>
> **Important:** This skill NEVER touches the `main` branch. It strictly stops at the pre-production integration branch (`ci-testing-verify` or `staging`), requiring Nick to explicitly run `/final-verify` to deploy.

---

## Phase 0: Branch Setup & Repo Context

1. **Verify Home Repo:** Ensure you are in the root directory of the single repository you are finishing the pipeline for.
2. **Detect the Test Branch:**
   ```bash
   TEST_BRANCH=$(git branch -r | grep 'origin/ci-testing-verify$' > /dev/null && echo "ci-testing-verify" || echo "staging")
   ```
3. **Checkout and Pull:**
   ```bash
   git fetch origin main --no-tags
   git checkout $TEST_BRANCH 2>/dev/null || git checkout -b $TEST_BRANCH origin/main
   git pull origin $TEST_BRANCH || true
   ```

---

## Phase 1: Wait & Prep Jules Sessions (check-jules-status)

**Skill to use:** `/check-jules-status`

1. Run the `check-jules-status` skill or manually run `jules remote list --session`.
2. Ensure targeted feature sessions are `Completed` or `Awaiting User Feedback`.
3. Verify all associated items have PRs opened targeting `main`. If not, dispatch a command asking Jules to create the PRs.
4. **Zero-Trust Proof Gate:** For each PR, verify the description contains raw terminal output, log snippets, or visual proof. 
   - If it only says "Tests pass" or "Verified" in prose without raw output, **REJECT IT**. Comment on the PR demanding actual log output and do not merge it.

---

## Phase 2: Merge Pipeline (jules-merge-verify)

**Skill to use:** `/jules-merge-verify`

1. Execute the `/jules-merge-verify` logic against the active batch of PRs.
2. This will dispatch a cloud Jules session to sequentially merge the pending PRs into a temporary `ci-integration` branch, resolving merge conflicts along the way.
3. Use a Wait Loop (`run-poll` or sleeping) until the Jules session completes.

---

## Phase 3: Local Unit Test Self-Healing Loop

**Condition: The unit tests must be 100% green before proceeding.**

1. **Pull the result branch from Phase 2:**
   ```bash
   # Extract the BATCH_ID used in Phase 2, e.g. ci-integration-123456
   git fetch origin
   git checkout ci-integration-$BATCH_ID
   git pull origin ci-integration-$BATCH_ID
   ```
2. **Run the Full Unit Test Suite Locally:**
   Determine the test runner (`vitest`, `jest`, etc.) and run the full suite.
   ```bash
   if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
     npx vitest run
   elif [ -f "jest.config.ts" ] || [ -f "jest.config.js" ]; then
     npx jest --ci
   else
     npm test
   fi
   ```
3. **Analyze and Tweak (The Dev Loop):**
   If the test suite fails, read the terminal output. Make ALL necessary code changes, fix the tests or components directly in the local workspace.
   ```bash
   # Add your fixes
   git add .
   git commit -m "chore: fix unit tests during pipeline finish"
   # Re-run tests until output is completely green.
   ```
4. **Merge to the Final Test Branch:**
   ```bash
   git checkout $TEST_BRANCH
   git merge ci-integration-$BATCH_ID --no-edit
   git push origin $TEST_BRANCH
   ```

---

## Phase 4: Final Playwright Dispatch to Jules

**Condition: Only proceed when Phase 3 is 100% green.**

1. Dispatch Jules to run the final Playwright E2E suite against the test branch. 
2. Use the standard E2E Self-Healing Jules dispatch instruction:

   ```bash
   jules remote new \
     --repo $(gh repo view --json nameWithOwner -q .nameWithOwner) \
     --session "Final E2E Verification & Self-Healing

   BRANCH: $TEST_BRANCH

   PROCEDURE:
   1. git checkout $TEST_BRANCH && git pull origin $TEST_BRANCH
   2. bash scripts/switch-env.sh ci-testing
   3. npx playwright test (or bash scripts/verify-batch.sh full)
   4. If a test fails, read the Playwright output/trace. Fix the test or the component code.
   5. Commit the fix and re-run the failed tests. Loop until 100% GREEN.
   6. git push origin $TEST_BRANCH
   
   CRITICAL SECRETS REFERENCE:
   If you need to edit GitHub Actions or CI scripts to fix tests, you MUST use these exact GitHub Secret names for the CI Testing environment. Do not guess or invent variations:
   - Supabase URL: \${{ secrets.CI_SUPABASE_URL }}
   - Supabase Anon Key: \${{ secrets.CI_SUPABASE_ANON_KEY }}
   - Supabase Service Role Key: \${{ secrets.CI_SUPABASE_SERVICE_ROLE_KEY }} (or secrets.CI_TESTING_SERVICE_KEY if legacy)
   - Stripe Public Key: \${{ secrets.STRIPE_TEST_PUBLIC_KEY }}
   - Stripe Secret Key: \${{ secrets.STRIPE_TEST_SECRET_KEY }}"
   ```

3. **Wait Loop:** Run `run-poll` or `jules remote list --session` until this final dispatch completes.

---

## Phase 5: Pipeline Handoff to final-verify

1. Update the Work Ledger via `work-ledger-sync` indicating the targeted ledger items are `verified`.
2. Present output to Nick cleanly showing:
   - Repo & Branch
   - Unit tests: Green (Local Stamp)
   - E2E tests: Green (Jules Playwright)
   - Ledger updated
3. Stop execution and await Nick's response. Do NOT run `/final-verify` without an explicit command.
