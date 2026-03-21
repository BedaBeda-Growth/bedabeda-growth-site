---
name: "Repo Planning"
description: "Route a unified Top-N task list across Freely, Rocket, and SOS, then output exactly three ready-to-execute master prompts with built-in validation gates mapped to the work ledger."
ruleDomains:
  - ops
---

# Repo Daily Master Planning Router v2

> **Ready to dispatch?** After generating master prompts, use `conveyor-dispatch` to batch-enqueue items to the heartbeat. This skill generates **planning prompts for Grok** — it doesn't dispatch agents directly.

**Use this skill when:** The user shares a Top N priorities list (typically 8, 10, or 20 tasks) spanning multiple repositories.

**Objective:** Parse the unified list and generate EXACTLY THREE separate, self-contained prompts (one for Freely, one for Rocket, one for SOS). These generated prompts will be copy-pasted into a downstream Gemini agent to create implementation-ready build plans WITH BUILT-IN VALIDATION GATES that map directly to the work ledger schema.

**CRITICAL FAILURE CONDITION:** Do NOT output a single consolidated list or plan. You must output exactly three distinct, ready-to-execute prompts, each ending with a Ledger Update JSON array.

## Objective Alignment (Mandatory)
Before routing or generating prompts:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Map each routed task to at least one objective ID
- If a task has no mapping, stop and ask: **"What's the objective here?"**
- Log any net-new durable objective candidates to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`
- Include objective-linked verification loops in each task's validation gate

**EFFICIENCY-FIRST RULE:** Every proposed task plan must include an efficiency judgment. If a task is net-negative on time/cost/cycle burden with weak capacity gain, mark it for re-scope or rejection by default.

## Step 1: Analyze and Route

Review the provided master task list.
Sort every task into exactly one of three buckets: Freely, Rocket, or SOS.

*If a repo label is missing or unexpected, place it in the closest matching bucket and add a brief explicit note about the assumption in that task's description.*

## Step 2: Generate the Prompts + Validation + Ledger Updates

Generate three separate prompts using the exact template below.
You must embed the routed tasks for each repo directly into their respective prompts so no context is lost.

Each prompt includes a new **Section 5: Validation Gate** per task, and ends with a **Ledger Update JSON** array that populates existing work ledger fields — no new items, no new statuses.

---

### GENERATED PROMPT TEMPLATE

*(Replicate this exact structure for Freely, Rocket, and SOS)*

**[Start of Prompt for [Repo Name]]**

You are the Master Planner for the **[Repo Name]** repository.
I have a list of tasks that require implementation-ready daily master plans WITH BUILT-IN VALIDATION GATES.

**Business Priority Order & North Star Context:**
Please ensure all planning adheres to the following sequence and goals:
1. Revenue protection first (breakage prevention, gating integrity, auth, deploy safety).
2. Activation / growth second (nurture, community, conversion, engagement).
3. North Star Goals: 200-300 net new paid users/week via Rocket gating; +60-72 paid/week from nurture flows; Community activation as growth multiplier.

**Owner Mapping:**
A = Cristine (Marketing) | B = Cyril (Community) | C = Ivana (Design) | D = Jes (Sales) | E = Jhem (CoS) | F = Nick (CEO)

**Your Tasks for Today:**
[INSERT THE FILTERED LIST OF TASKS FOR THIS REPO HERE. Preserve all fields exactly: ID, Title, Repo, Owner, Success Check, Projected Impact, Why Dispatch Today. Keep each task self-contained and scannable.]

**Your Instructions:**
Please output a master plan for this repository.
For EACH task listed above, provide a detailed fix plan that includes:

1. **Information Gathering:** State the current state from work ledger/Ember, identify relevant repo code snippets to pull (e.g., auth files), and list dependencies, blockers, and sequencing constraints.
2. **Goals & Constraints:** Define the exact intent of the build (the "What") and explicitly state any system boundaries or rules it cannot cross. Do NOT provide step-by-step code implementation details.
3. **QA & Deployment:** Outline the test strategy (unit/integration/E2E/smoke as relevant) and the deployment path to a stable "solid state."
4. **Alignment:** Explicitly state the owner assignment (aligned with the Person A-F map), tie success metrics to the projected impact (e.g., +X paid/week), and include cross-functional notes (marketing/community/design/sales/ops).
5. **Validation Gate:** For this task, provide ALL of the following:
   - **CLI validation commands:** One or more copy-paste-ready shell commands that a verification agent can run to confirm the task is truly done. These must be concrete (not pseudocode) and runnable from the repo root.
   - **Pass condition:** The exact expected output or exit code that means PASS.
   - **Fail condition:** What output means FAIL and requires rework.
   - **Smoke/E2E step:** If applicable, the browser-level or live-site check that confirms the user-facing behavior works (e.g., "Navigate to /meetings, click Join, verify JWT prompt appears").
   - **Gate classification:** Is this a revenue gate (bypass = revenue leaking) or a standard verification? Revenue gates get `bypass_test` with a runnable command; standard tasks get `done_criteria` with verification steps.
6. **Efficiency Assessment (required):** For each task, include `time_delta`, `cost_delta`, `cycle_delta`, `capacity_delta`, `quality_risk`, and a `decision` (`keep` | `park` | `reject`).
   - Default behavior: reject/park net-negative efficiency tasks unless explicitly required by Nick.

**Ledger Update JSON:**
At the end of your ENTIRE output for this repo, provide a JSON array with one entry per task. Each entry updates the EXISTING work ledger item (do NOT create new items). Use this exact schema:

```json
[
  {
    "id": "the-task-id",
    "done_criteria": {
      "description": "Human-readable summary of what 'done' means",
      "verification_commands": ["cmd1", "cmd2"],
      "pass_condition": "What PASS looks like",
      "fail_action": "What to do on FAIL (rework prompt or escalation)"
    },
    "bypass_test": {
      "description": "What this test checks (only for revenue gates)",
      "command": "single runnable shell command",
      "expect": "expected output string"
    },
    "checkboxes": [
      {"text": "Verification step 1", "done": false},
      {"text": "Verification step 2", "done": false},
      {"text": "Verified on live site", "done": false}
    ]
  }
]
```

**Rules for the JSON:**
- `bypass_test` is ONLY for revenue gate items. Omit it for standard tasks.
- `done_criteria.verification_commands` must be real, runnable commands — not pseudocode.
- Every task MUST have at least one checkbox with `"Verified on live site"` or `"Verified in CI"`.
- The last checkbox should always be the live-site or production verification step.

At the end of your output, also provide:
- Total estimated effort (hours) for this repo's payload
- Explicit tie-back to our business goals/revenue outcomes

**[End of Prompt for [Repo Name]]**

---

## Output Contract

Your final output must consist EXCLUSIVELY of the three generated prompts, clearly separated so they can be easily copied. Do not output the tasks outside of these prompts.

1. `Freely Master Prompt` (ends with Ledger Update JSON for Freely tasks)
2. `Rocket Master Prompt` (ends with Ledger Update JSON for Rocket tasks)
3. `SOS Master Prompt` (ends with Ledger Update JSON for SOS tasks)

Prioritize correctness and completeness over brevity. Ensure each generated prompt is executable as-is and each Ledger Update JSON is valid, parseable JSON.
