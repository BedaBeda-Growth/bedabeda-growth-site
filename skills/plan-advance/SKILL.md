---
name: "Plan Advance"
description: "Execute the next unblocked move in the day plan, verify the gate, update state, report progress."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
---

# Plan Advance — The Executor

> **Batch dispatch across repos?** Use `conveyor-dispatch`. This skill advances the **daily plan** one step at a time — it doesn't batch-select or enqueue to the heartbeat.

## Trigger Phrases
- "advance", "next", "push", "move it", "what's next", "keep going"

## Core Rule
**Read state → execute one move → verify gate → update state → report.** No re-planning. No re-evaluating priorities. Just advance.

## Objective Alignment (Mandatory)
Before executing the next move:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Confirm the target priority maps to at least one objective ID
- If mapping is missing, pause and ask: **"What's the objective here?"**
- Ensure the quality gate also verifies objective-level outcome (not just task completion)
- If work introduces a net-new objective, append a proposed entry to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`

**Efficiency stop rule:** if verification evidence shows cycle-time/cost blow-up with weak capacity gain, flag for stop/re-scope and surface to Nick instead of blindly continuing.

## State Machine

Every priority follows this transition graph:

```
queued → in_progress → built → verified → done
                  ↘ blocked (side state — check dependency, unblock, resume)
                  ↘ needs_nick (side state — flag in report, skip to next)
```

Only valid transitions:
- `queued` → `in_progress` (Kai starts working on it)
- `in_progress` → `built` (code/work complete, awaiting verification)
- `in_progress` → `blocked` (dependency not met or external blocker)
- `in_progress` → `needs_nick` (requires Nick's decision/approval)
- `built` → `verified` (quality gate passes)
- `built` → `in_progress` (quality gate failed — fix and retry)
- `blocked` → `in_progress` (blocker resolved)
- `needs_nick` → `in_progress` (Nick completed his action)
- `verified` → `done` (final — logged in work ledger)

## Step 1: Read State

Read `~/Desktop/Rocket/day-plan.json`. Parse the priorities array.

If file doesn't exist or is stale (different date): tell Nick to run `/daily-plan` first. Stop.

Also read (parallel):
- `check_all_buses()` — new agent completions
- `check_team_chat(unread_only=True)` — new messages
- `read_director_queue()` — dispatched task updates
- `GET /runs` (when run bus available) — active/completed/stalled AG runs matching plan priorities

## Step 2: Preemption Check

Before advancing, scan for interrupts. **Only these 5 things preempt the plan:**

| Interrupt | Action |
|-----------|--------|
| Revenue gate just opened | Insert as P0, alert Nick immediately |
| Live site down / auth broken | Insert as P0, alert Nick immediately |
| Deploy blocker (CI red, merge conflict) | Insert at current position, fix before continuing |
| AG run blocked/stalled >8 min (via run bus) | Surface to Nick with run context, offer control actions (retry/switch model/cancel) |
| New SOS item that outranks current top 5 | Swap with lowest priority, note the change |

If none of these: continue with the plan as-is. Do NOT re-plan for minor inputs.

For non-preempting new inputs (SOS items, team messages, minor Sentry errors):
- Add to `new_team_items` in `day-plan.json`
- Acknowledge in report
- Do not disrupt execution

## Step 3: Find Next Action

Walk priorities `p1` → `p5` in order:

1. Skip `done` and `verified`
2. Skip `needs_nick` (but count for report)
3. If `blocked`: check if blocker resolved → if yes, transition to `in_progress`
4. First `queued` or `in_progress` item = **the target**

If ALL items are done/verified: report "Plan complete" and suggest running `/daily-plan` for next batch.

## Step 4: Execute

Based on target's current status:

| Status | Action |
|--------|--------|
| `queued` | Transition to `in_progress`. Execute the planned action (dispatch agent, run command, write code, etc.) |
| `in_progress` | Continue work or check if done. If agent was dispatched, check bus for result. |
| `built` | Run the quality gate. Transition to `verified` or back to `in_progress`. |

**Execution methods:**
- **dispatch**: `dispatch_agent(repo, prompt)` — for code work in other repos
- **hands-on**: Direct work in scceo-1 (edits, scripts, verifications)
- **verify**: Run quality gate command (curl, grep, git check, Sentry query)
- **mcp-tool**: Use a kai-brain MCP tool (update_work_ledger, etc.)

**10-minute rule:** If hands-on work will take >10 min, consider dispatching to an agent instead.

## Step 5: Verify Gate

Every priority has a `quality_gate` field. After execution:

1. Run the gate command/check
2. If **PASSES**: transition to `verified`, record timestamp
3. If **FAILS**: transition back to `in_progress`, record failure reason, determine fix action
4. If gate passes but efficiency is net-negative (higher time/cost/cycles without capacity gain): set `needs_nick` and request re-scope/stop decision

Gate examples:
- `curl -s -o /dev/null -w "%{http_code}" https://rocket.hirefreely.co/auth` → expect 200
- `git -C /path/to/repo log --oneline main..staging | wc -l` → expect 0
- `grep -r "jitsi-token" /path/to/repo/supabase/functions/` → expect matches
- Manual: "Nick confirms on live site" → set `needs_nick`

## Step 6: Update State

After every action, update `~/Desktop/Rocket/day-plan.json`:

```python
priority["status"] = "verified"  # new status
priority["updated_at"] = "2026-03-06T08:15:00-05:00"
priority["verified_at"] = "2026-03-06T08:15:00-05:00"  # if verified
priority["notes"].append("Gate passed: live site returns 200")
```

Increment `state_version` by 1.

Also update `~/Desktop/Rocket/Day Plan.md` to match:
- Update status field
- Add timestamp
- Update "Next" action

Also update work ledger if applicable:
- `update_work_ledger(item_id, "verify")` for verified items
- `update_work_ledger(item_id, "add_note", "...")` for progress

## Step 7: Chain Small Wins

If the next action is:
- Kai-owned (no Nick dependency)
- Small (< 5 min)
- Independent (no external side effects)

→ Execute it immediately and chain into the same report. Up to 3 chains per `/advance` call.

**NEVER chain:**
- Merges to main/production
- External communications
- Financial actions
- Auth/security code changes
- Anything flagged `needs_nick`

## Step 8: Report

Every `/advance` ends with this card:

```
ADVANCE — HH:MM ET (v{state_version})

MOVED:
  [x] P2: Merged rocket staging → main
      Gate: PASSED — live site 200, no new Sentry errors

PROGRESS: 3/5 done | 1 needs Nick | 1 queued

NICK:
  [ ] Approve PR #619 (~5 min) — blocks P1
  [ ] Post tweets (~20 min) — P5

KAI NEXT: P4 — running gate check on PKCE fix

NEW: 2 SOS items from Cristine (acknowledged, parked for next plan)
```

**Report rules:**
- Always show what JUST moved (with gate result)
- Always show fraction: X/5 done
- Always surface Nick blockers with time estimates
- Always show Kai's immediate next action
- New team items: count + acknowledge

## Rules

- **Never re-plan during /advance.** Priorities are set. Execute them. If the world shifted, tell Nick to run `/daily-plan`.
- **day-plan.json is source of truth.** Read JSON, not markdown. Write both.
- **State transitions are strict.** No skipping steps. `queued` → `done` is not valid.
- **Blocked = flag loudly, not skip silently.** Nick needs to see what's waiting on him.
- **Quality gates are real verification.** "I ran the command" ≠ done. "Gate output matches expected" = done.
- **New team items get acknowledged immediately.** Even if parked. Team trust depends on visibility.
- **Compound small wins.** Three quick verifications in one /advance = momentum.
