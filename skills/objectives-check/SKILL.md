---
name: "Objectives Check"
description: "Hard gate: map work to one of the 6 North Star Objectives (NSO-01 through NSO-06) before any plan, dispatch, or execution proceeds. No mapping = stop. Use whenever planning, scoping, dispatching, or closing work. Trigger phrases: 'objectives check', 'check against objectives', 'objective alignment', 'what's the objective here'."
alwaysAllow:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
---

# Objectives Check

Use this skill whenever planning, scoping, dispatching, or closing work.

## Trigger Phrases
- "objectives check"
- "check against objectives"
- "objective alignment"
- "what's the objective here"

## Core Rule — HARD GATE

This is a **hard gate, not a suggestion**.

**No objective mapping = no execution dispatch.**

The only exception: Nick explicitly overrides with `objective_override=true` + a written rationale logged in the work ledger. Momentum is not a reason to skip this. An unmapped task is a task we shouldn't be doing.

## The 6 North Stars (NSO-01 through NSO-06)

Read from: `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`

| ID | Title |
|----|-------|
| NSO-01 | Payment Works Everywhere |
| NSO-02 | Community Is Stickier Than Any Feature |
| NSO-03 | Every Happy User Recruits One More |
| NSO-04 | Kai Runs the Machine |
| NSO-05 | Top of Funnel Is Always Full |
| NSO-06 | Zero Human Barriers Mid-Execution |
| NSO-07 | Client Relationships Are Grounded in Mutual Accountability |

## Required Inputs
1. Current work payload (task list, plan draft, scope, or execution item)
2. Objectives registry: `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
3. Objectives candidate log: `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`

## Workflow

### Step 1: Load North Stars
Read `OBJECTIVES.md`. Extract all 6 NSOs with their statements and verification loops.

### Step 2: Map Work to NSO IDs
For each item in the payload:
- map to at least one NSO ID (NSO-01 through NSO-06)
- include a one-line rationale: "This advances NSO-XX because..."
- note required verification loop

If an item has no clear mapping:
- **STOP. Do not proceed to dispatch.**
- Ask: **"Which of the 6 North Stars does this advance?"**
- If Nick can't answer — the work is not a priority. Remove or defer it.
- Mark item as `objective-unmapped` — it is excluded from planning selection.

### Step 3: Detect Objective Gaps
Flag objective-level risks:
- Required capabilities not present in plan/scope
- Verification loop missing for a covered NSO
- NSO mentioned but no concrete measure of progress

### Step 4: Capture Net-New Objective Candidates
If work introduces a durable capability that genuinely doesn't map to any of the 6 NSOs:
1. Add a candidate entry to `OBJECTIVES_LOG.md` with `status: proposed`
2. Include source context and why this isn't covered by an existing NSO
3. Ask Nick for accept/reject decision before proceeding
4. **Do not auto-accept.** New North Stars require explicit approval.

### Step 5: Return Objective Alignment Card
Return this compact structure:

```yaml
covered:
  - item: "..."
    nso_ids: ["NSO-01"]
    rationale: "This advances NSO-01 because..."
    verification_loop: "..."

blocked:
  - item: "..."
    reason: "objective-unmapped"
    action: "STOP — ask Nick which North Star this advances before dispatching"

gaps:
  - item: "..."
    issue: "missing verification loop for NSO-02"
    risk: "..."

new-nso-candidates:
  - candidate_id: "CAND-NSO-..."
    proposed_objective: "..."
    status: "proposed — awaiting Nick decision"

required-verification:
  - item: "..."
    checks:
      - "command or concrete manual check"
    pass_condition: "..."
    fail_condition: "..."
```

## Integration Rule for Other Skills
When this skill is embedded into another skill:
- Run this objective check **before finalizing plan/dispatch** — it is a pre-dispatch gate
- If any item is `objective-unmapped`, the dispatch is blocked until mapped or Nick overrides
- Rerun at verification/close to confirm NSO progress evidence

## Non-Negotiables
1. **No silent unmapped work.** Unmapped = blocked.
2. **No dispatch without NSO mapping.** This is the gate, not a post-hoc check.
3. **No objective marked covered without a verification loop.**
4. **No auto-accepting new NSOs** — log first, Nick decides.
5. **Nick override requires written rationale** in the work ledger — not just verbal.

Enforced by: Rule `ops-objective-alignment-required` (simulate)