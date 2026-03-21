---
name: verify-agent
description: Auto-verify an agent completion against CI gates + acceptance criteria. Use this standalone verification service to verify work ledger items fully without Nick's intervention.
ruleDomains:
  - ops
  - deploy
---

# Verify Agent Completion

This is the standalone verification service. Use this when asked to verify an agent's completion for a particular item.
It executes CI gates, matches acceptance criteria mechanically, updates the ledger, and alerts Nick only on failures.

## Inputs
Determine these before beginning:
- `item_id`: the work ledger item to verify (from `status="built"`)
- `repo`: target repository (e.g., `rocket`, `scceo`, `app`)
- `mode`: `quick` or `full` (default: `quick`)
- `auto_retry`: `true` or `false` (default: `true`)

## Procedure

1. **Get the Task File:**
   Load the task file from `/Users/nicholaspetros/scceo-1/gemini-tasks/<item_id>.md`
   If the task doesn't exist, check `plan_id` in the work ledger item.

2. **Run CI Gates:**
   Call the `verification-router` skill with the appropriate `repo` and `mode`.
   Store the result (Pass/Fail) and summary.
   If the result is Fail, skip step 2.5 and step 3.

2.5. **Smoke Test — Live Functionality Check (MANDATORY for user-facing repos):**
   If the item's repo is `rocket`, `app`, or `rv`, this step is mandatory.
   Rule: `ops-live-functionality-required`

   **Procedure:**
   a. Identify the relevant URL/page from the task file's acceptance criteria or description.
   b. If a dev server can be started: run `npm run dev` and hit the relevant endpoint.
   c. If a staging URL is available: HTTP GET the relevant page.
   d. Check that:
      - The page returns HTTP 200 (not 404, 500, or redirect loop)
      - Key UI elements mentioned in the AC are present in the response body
      - No JavaScript console errors that would prevent the feature from rendering
   e. If the page returns an error, key elements are missing, or the feature is not visible:
      → **FAIL immediately.** Do not proceed to AC matching.
      → Log: "Smoke test FAILED: [URL] returned [status/issue]. Feature is not functional."
   f. If no URL can be determined from the task file:
      → First check: is this a **backend-only item** (no UI surface — API, cron, migration, edge function with no page effect)? If yes → SKIP is valid, proceed to AC matching.
      → If the item has UI acceptance criteria but no smoke test URL → this is a **plan authoring failure**.
         Log: "⚠️ Smoke test URL missing for UI item. Plan must specify URL in AC. Marking CONDITIONAL."
         Mark verification as CONDITIONAL, not PASS. Do not silently continue.

3. **Match Acceptance Criteria (Mechanical):**
   Parse the acceptance criteria from the loaded task file.
   For each criterion that has a `verify` block:
   - If `grep: "pattern"`, run `grep_search` or standard `rg` in the targeted repo. Did it match?
   - If `test: "command"`, run the test via terminal in the targeted repo. Did it pass?
   - If the criterion is user-facing: prefer checks against a running environment over local grep.
   If all tests in this block match the expected output, mark the criterion as passed. 
   If no mechanical criteria are present, fallback to asking Nick or doing a manual sanity and functionality check of the diffs.

4. **Determine Outcome:**
   - **Success:** If CI gates pass AND all mechanical acceptance criteria pass.
   - **Failure:** If any gate fails OR any mechanical acceptance criteria fails to find the required result.

5. **Update Work Ledger:**
   If Success:
   - Call `update_work_ledger(item_id, "verify", gates_result.summary)`
   - Create a Slack/Team chat post if appropriate: `Verified: {item_id} — {summary}`
   
   If Failure:
   - Call `update_work_ledger(item_id, "fail", failed_criteria)`
   - Proceed to fallback routing.

6. **Fallback / Retry Logic (On Failure):**
   - **First failure** (if `auto_retry` is `true`):
     Refine the agent prompt using the failure logs (from CI gates or failed grep/test outputs). Send it back to the heartbeat or Jules system. 
   - **Second failure** (or if `auto_retry` is `false`):
     Escalate to Nick immediately. Show him exactly what was expected, what CI gates returned, what criteria failed, and suggest a fast fix.
