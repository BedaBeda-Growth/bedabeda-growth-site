---
name: "Daily Plan"
description: "Build today's execution plan — pull all signals, rank top 5, isolate Nick's 2-3 moves, queue Kai's execution with verification gates."
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

# Daily Plan — The Planner

> **Ready to dispatch?** After planning, use `conveyor-dispatch` to batch-select items and enqueue to the heartbeat. This skill **plans** — it doesn't dispatch agents.

## Trigger Phrases
- "plan", "daily plan", "what's the plan", "let's plan", "replan"

## Core Rule
**Nick's time is the bottleneck.** Max 3 actions for Nick, ~1 hour total. Everything else goes to Kai.

## Objective Alignment (Mandatory)
Before ranking priorities, run an objectives pass:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Map each candidate priority to at least one objective ID
- If any candidate has no objective mapping, stop and ask: **"What's the objective here?"**
- If net-new durable capability appears, append a candidate to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`
- Ensure every selected priority includes a verification loop tied to its objective

## Efficiency Rubric (Mandatory)
Before locking priorities, evaluate each candidate:
- `time_delta` (faster/slower)
- `cost_delta` (cheaper/more expensive per outcome)
- `cycle_delta` (fewer/more loops + handoffs)
- `capacity_delta` (increases/decreases quality output at scale)
- `quality_risk`
- `decision`: `keep` / `park` / `reject`

Default: **reject or park net-negative efficiency work** unless Nick explicitly overrides.

## Step 1: Gather Signals (parallel)

| Source | How |
|--------|-----|
| Strike List | Read `~/Desktop/Rocket/Todos/YYYY-MM-DD.md` |
| Work Ledger | `check_work_ledger()` — nag list, unverified built items |
| Revenue Gates | `run_revenue_gate_checks()` — any open gate = auto P1 |
| SOS/Team | Work ledger items where `sos_task_id` exists and `status = pending` |
| Director Queue | `read_director_queue()` — in-progress / stuck |
| Agent Bus | `check_all_buses()` — completed work needing review |
| Deploy Queue | `git -C <repo> log --oneline main..staging` for rocket, app, rv |
| Team Chat | `check_team_chat(unread_only=True)` |

## Step 2: Rank Top 5

Priority stack (highest first):

| Tier | Signal |
|------|--------|
| 1 | Revenue gate OPEN |
| 2 | Live site broken (auth, signup, checkout) |
| 3 | Pipeline blocker (dead API key, failed cron) |
| 4 | Deploy queue > 2 commits |
| 5 | Team submissions (SOS) — especially first-time submitters |
| 6 | Unverified "built" items (agent work needing verification) |
| 7 | Content/growth gaps |
| 8 | Technical debt |

**Max 5 priorities.** Overflow goes to "Parked" with a reason.

## Step 2.5: Codebase Relevance Check

**Before locking priorities, verify each candidate is still relevant to the CURRENT codebase.**

The codebase moves fast — features ship, dashboards get rebuilt, pricing changes. Tasks written against old code waste compute and risk regressions.

For each candidate priority:

1. **Check the target repo's current state.** Is the component/page/feature still there? Has it been replaced?
2. **Flag stale references:**
   - Old dashboard layout/navigation (new Ember dashboard is live)
   - Old pricing ($9/$18/$97 → now $29/$49/$79 by market)
   - Features already shipped (Notes, voice, meeting cards, referral links)
   - Components that no longer exist or have been restructured
3. **Decision per item:**
   - **Current** → keep in plan
   - **Needs rewrite** → update the task prompt to target current code, then keep
   - **Obsolete** → archive from work ledger with reason, drop from plan
4. **Archive obsolete items:** `update_work_ledger(item_id, "update_status", "archived")` with a note explaining why

**This check is mandatory.** Never dispatch work against code that no longer exists. A 2-minute relevance scan prevents hours of wasted agent compute.

## Step 2.6: Efficiency Gate (before lock)

For each candidate priority, run the Efficiency Rubric.
- Keep items that are clearly efficiency-positive (or immediate revenue protection).
- Park/reject items with high complexity tax and weak throughput/capacity gain.
- If qualitative (e.g., marketing/process), require a clear path to faster cycle time, lower effort, or higher quality throughput.

## Step 3: Define Each Priority

Every priority must have ALL of these:

```
id: "p1"
title: "Fix subscription gating for expired trials"
why: "Revenue gate open — bypass test failing"
owner: "kai" | "nick" | "agent"
size: "S" | "M" | "L"
status: "queued"
done_criteria: "Gate pri-79297299 bypass test passes"
quality_gate: "curl -s https://rocket.hirefreely.co/pricing | grep 'trial expired'"
nick_action: null | "Approve merge to main (~5 min)"
depends_on: null | "p2"
efficiency_assessment:
  time_delta: "..."
  cost_delta: "..."
  cycle_delta: "..."
  capacity_delta: "..."
  quality_risk: "low|med|high"
  decision: "keep|park|reject"
```

## Step 4: Build Nick's Block

Extract actions where `nick_action != null`. Rules:
- **Max 3 items**
- **Max ~1 hour total**
- Each must be specific: exact action + where to do it + time estimate
- Only: decisions, approvals, external comms, steering
- If more than 3 need Nick: Kai takes over the less critical ones

## Step 5: Build Kai's Queue

Everything not in Nick's block. Ordered by:
1. No dependencies first
2. Then items unblocked by Nick's actions
3. Method for each: `hands-on` / `dispatch` / `verify` / `mcp-tool`

## Step 6: Write Outputs

### `~/Desktop/Rocket/Day Plan.md` (human-readable)

```markdown
# Day Plan — YYYY-MM-DD

> Generated HH:MM ET | 5 priorities | Nick: 3 actions (~1h) | Kai: executing

## Nick's Block (~1 hour)

### 1. [Action] — ~XX min
[Specific: what, where, how]

### 2. [Action] — ~XX min
...

---

## Priorities

### P1: [Title] (S/M/L) — Owner
**Why:** ...
**Done:** ...
**Gate:** ...
**Status:** queued
**Next:** ...

### P2: ...

---

## Kai's Queue
| # | Action | Method | Blocked By | Status |
|---|--------|--------|------------|--------|
| 1 | ... | dispatch | — | queued |

## New Team Submissions
- [count] new SOS items since yesterday
- [list if < 5, summary if more]

## Parked
- [items not making today's cut, with reason]
```

### `~/Desktop/Rocket/day-plan.json` (machine-readable)

```json
{
  "date": "2026-03-06",
  "generated_at": "2026-03-06T07:22:00-05:00",
  "priorities": [
    {
      "id": "p1",
      "title": "...",
      "why": "...",
      "owner": "kai",
      "size": "M",
      "status": "queued",
      "done_criteria": "...",
      "quality_gate": "...",
      "nick_action": null,
      "depends_on": null,
      "updated_at": null,
      "verified_at": null,
      "notes": []
    }
  ],
  "nick_block": [
    {
      "priority_id": "p3",
      "action": "Approve PR #619 for merge",
      "time_estimate_min": 5,
      "status": "pending"
    }
  ],
  "kai_queue": [
    {
      "priority_id": "p1",
      "action": "Dispatch agent to fix subscription gating",
      "method": "dispatch",
      "blocked_by": null,
      "status": "queued"
    }
  ],
  "new_team_items": [],
  "parked": [],
  "state_version": 1
}
```

## Step 7: Report to Nick

```
PLAN SET — [date] | 5 priorities | Nick: 3 (~1h) | Kai: executing

YOUR BLOCK:
1. [thing] — ~X min
2. [thing] — ~X min
3. [thing] — ~X min

I'M STARTING: [first Kai queue item]

TEAM: X new submissions (folded in / parked)
```

## Rules
- **day-plan.json is the machine source of truth.** `/plan-advance` reads it, not the markdown.
- **Day Plan.md is the human view.** Both are written together, always in sync.
- **Never more than 5 priorities.** Focus beats breadth.
- **Never more than 3 Nick actions.** Kai absorbs overflow.
- **Every priority has a quality gate.** No gate = not a priority, it's a wish.
- **Every priority must pass the efficiency rubric.** Net-negative items are parked/rejected by default.
- **New team submissions are always acknowledged.** Even if parked.
