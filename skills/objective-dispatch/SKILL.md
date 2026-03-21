---
name: "Objective Dispatch"
description: "Allocate and dispatch Jules work across 3 strategic lanes (Freely Experience, Rocket Hardening, Team Priorities) with daily budget enforcement. 80/80/80 + 50 reserve."
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
  - deploy
---

# Objective Dispatch — Strategic Lane Allocation

## Trigger Phrases

### Full objective planning cycle
- "objective dispatch", "plan objectives", "lane dispatch", "allocate lanes"

### Check lane status only
- "lane status", "lane budget", "check lanes"

### Reserve deployment
- "use reserve", "deploy reserve", "reserve dispatch"

### Reallocate between lanes
- "reallocate", "move budget", "shift budget"

## Budget Model

| Lane | Budget | Purpose |
|------|--------|---------|
| Freely Experience | **90** | Freely v7 transformation (30% floor enforced). Think jobs, worker UX, company API |
| Rocket Hardening | 80 | Bug fixes, refactoring, streamlining, tech debt |
| Team Priorities | 70 | Product board items, critical bugs, cross-cutting |
| Reserve | 50 | End-of-day test runs, retries, emergency fixes |

Total: 300 Jules jobs/day. Budget auto-resets daily. Freely floor: min 30% of dispatch must be freely_experience.

---

## Phase 0: Preflight

Before anything else:

1. **Check objectives** to align with North Star:
```
check_objectives()
```

2. **Load lane budget status:**
```bash
cd ~/scceo-1/grok-personal && python3 lane_budget.py report
```

3. If any lane is at 0 remaining, note it and skip that lane in subsequent phases.

4. If Nick provided specific priorities for any lane, those override the auto-pull in Phase 1.

---

## Phase 1: Intake (Per Lane)

Pull candidate items from the work ledger for each lane.

### Freely Experience (repo=app)
```python
from work_ledger import WorkLedger
ledger = WorkLedger()
# get_dispatchable() enforces shadow-duplicate filtering + AUTO-CONFLICT exclusion
candidates = [
    i for i in ledger.get_dispatchable(repo='app', limit=50)
    if i.get('item_type') != 'content'
]
```

### Rocket Hardening (repo=rocket, engineering type)
```python
# get_dispatchable() enforces shadow-duplicate filtering + AUTO-CONFLICT exclusion
candidates = ledger.get_dispatchable(repo='rocket', limit=50)
```

### Team Priorities (any repo, P0/P1 or product board)
```python
# get_dispatchable() enforces shadow-duplicate filtering + AUTO-CONFLICT exclusion
all_candidates = [
    i for i in ledger.get_dispatchable(limit=200)
    if i.get('item_type') != 'content'
    and (i.get('priority', 99) <= 1 or i.get('sos_task_id'))
]
# Exclude items already captured by Freely or Rocket lanes.
freely_ids = {i['id'] for i in freely_candidates}
rocket_ids = {i['id'] for i in rocket_candidates}
candidates = [i for i in all_candidates if i['id'] not in freely_ids and i['id'] not in rocket_ids]
```

If Nick provided explicit priorities for a lane, use those instead of the auto-pull.

---

## Phase 2: Rank (Per Lane)

Within each lane, score items:

```python
def score_item(item):
    priority_score = {0: 100, 1: 75, 2: 50, 3: 25}.get(item.get('priority', 2), 25)
    blast = (item.get('blast_radius', 0) or 0) * 5
    readiness = 0
    if item.get('done_criteria'):
        readiness += 20
    if item.get('plan_id'):
        readiness += 10
    staleness = 0
    created = item.get('created_at', '')
    if created:
        # +15 if pending > 3 days
        from datetime import datetime, timezone
        try:
            age = (datetime.now(timezone.utc) - datetime.fromisoformat(created)).days
            if age > 3:
                staleness = 15
        except Exception:
            pass
    gate_bonus = 50 if item.get('is_gate') else 0
    return priority_score + blast + readiness + staleness + gate_bonus
```

Sort descending. Top N items per lane (where N = remaining budget for that lane).

**Cap selection at the lane's remaining budget.** Never select more items than the lane can fund.

---

## Phase 3: Objective Documents

For each selected item that does NOT already have an objective doc:

Create `~/scceo-1/objectives/{lane}/{item-id}.md`:

```markdown
# Objective: {item title}

**Item ID:** {item_id}
**Lane:** {lane}
**Repo:** {repo}
**Priority:** P{priority}
**Date:** {today}

## What We're Trying to Achieve
{item's impact_tie or description}

## Current State
{Brief description of what the system does now}

## Definition of Done
{item's done_criteria or checkboxes, listed as checkboxes}

## Plan
{If plan_id exists, reference plans/{plan_id}.md. Otherwise, outline the approach.}

## Verification
{How do we know it worked? Specific tests, URLs, or behaviors to check.}
```

Items that already have a `plan_id` or an existing objective doc in `objectives/{lane}/` skip this step.

---

## Phase 4: Present to Nick

Show a 3-column summary. Use a datatable or formatted markdown:

```
## Objective Dispatch Plan — {date}

Freely Floor: {n_freely}/{n_total} selected = {pct}%  (min 30%) ✅ / ⚠️

### Freely Experience ({remaining}/90 remaining)
1. [item-id] Title (P{n}, score: {score})
2. ...

### Rocket Hardening ({remaining}/80 remaining)
1. [item-id] Title (P{n}, score: {score})
2. ...

### Team Priorities ({remaining}/70 remaining)
1. [item-id] Title (P{n}, score: {score})
2. ...

### Reserve: {remaining}/50 available

Total items selected: {N}
```

**Wait for Nick's approval.** He may:
- Approve all ("go", "let it rip")
- Remove specific items ("drop item-x")
- Add items ("add item-y to rocket lane")
- Move items between lanes ("move item-z to team")
- Adjust lane budgets ("give rocket 20 more from freely")

Only proceed to Phase 5 after explicit approval.

---

## Phase 5: Dispatch

For each approved item:

### Step 5a: Assign Lane
```python
ledger.assign_lane(item_id, lane)
ledger.save()
```

### Step 5b: Generate Task File
Create `~/scceo-1/gemini-tasks/conveyor/{item-id}.md` using the conveyor-dispatch format:

```markdown
# Conveyor Item: {item title}

**Item ID:** {item_id}
**Repo:** {repo}
**Priority:** P{priority}
**Lane:** {lane}

Read the `conveyor-item` skill for your execution protocol.

## Task Prompt
{Contents of objectives/{lane}/{item-id}.md}

## Acceptance Criteria
{done_criteria or checkboxes}

## Execution Protocol
1. Create branch `conveyor/{item-id}` from latest main
2. Execute the work described above
3. Run quick CI tests
4. Self-reflect: rate confidence 1-10 on each criterion
5. If confidence < 9, retry once with adjusted approach
6. Push and open a PR titled `[Conveyor] {item title}` targeting main
7. Append status to `conveyor-status.jsonl`
```

### Step 5c: Debit Lane Budget
```bash
cd ~/scceo-1/grok-personal && python3 lane_budget.py debit {lane} --item-id {item-id} --repo {repo}
```

### Step 5d: Enqueue to Heartbeat
```
heartbeat_enqueue(
  task_file="/Users/nicholaspetros/scceo-1/gemini-tasks/conveyor/{item-id}.md",
  repo="{repo}",
  model="pro-high"
)
```

### Step 5e: Update Work Ledger
```
update_work_ledger(item_id, "update_status", "dispatched")
update_work_ledger(item_id, "add_note", "Lane: {lane} | Dispatched via objective-dispatch")
```

**Stagger dispatches:** 2 minutes between repos, as per conveyor-dispatch rules.

**Collision guard:** Before each repo's dispatches, run `check_heartbeat()`. Skip repos with active runs.

---

## Phase 6: Track

After all dispatches:

1. Show updated lane budget:
```bash
cd ~/scceo-1/grok-personal && python3 lane_budget.py report
```

2. Send team message with dispatch summary:
```
send_team_message("Objective dispatch complete: {N} items across 3 lanes. Freely:{n1} Rocket:{n2} Team:{n3}. Reserve: {remaining}/50.", priority="normal")
```

3. Log to memory:
```
kai_memory_journal("Objective dispatch: {N} items. Freely={n1}, Rocket={n2}, Team={n3}. Reserve intact at {remaining}.", tags=["dispatch", "lanes", "objectives"])
```

---

## Reserve Deployment

When Nick says "use reserve" or "deploy reserve":

1. Show what's available: `python3 lane_budget.py status`
2. Present candidates (failed items from any lane, or Nick-specified items)
3. On approval, use `lane_budget.py reserve --item-id {id} --repo {repo} --reason "{reason}"`
4. Dispatch normally via heartbeat

Reserve is for:
- Retrying failed items from any lane
- Last-minute test/CI verification batches
- Emergency fixes that come in after lanes are allocated
- Nick-directed items that don't fit a lane

---

## Reallocation

When Nick says "reallocate" or "move budget":

```bash
cd ~/scceo-1/grok-personal && python3 lane_budget.py reallocate {from_lane} {to_lane} {count}
```

Example: "Give rocket 20 more from freely"
```bash
python3 lane_budget.py reallocate freely_experience rocket_hardening 20
```

Show updated status after reallocation.

---

## Midday Top-Up (Optional)

If called again after the morning dispatch:
1. Check which lanes have budget remaining
2. Pull new candidates (items that completed early, new items from SOS)
3. Run Phase 1-5 for lanes with remaining budget
4. This is additive. Already-dispatched items are not re-dispatched.

---

## Non-Negotiable Rules

1. **Always present to Nick before dispatching.** No blind lane allocation.
2. **Lane budget is a hard cap.** If a lane is at 0, stop. Use reserve or reallocate.
3. **Reserve requires justification.** Every reserve debit needs a reason.
4. **Collision guard before every dispatch.** No dispatching to repos with active heartbeat runs.
5. **Max 4 items per repo per dispatch wave.** Respect context pressure caps.
6. **Never dispatch content items.** Only buildable work.
7. **Stagger repos by 2 minutes.** Don't blast all at once.
8. **Lane assignment persists on the work ledger item.** Historical tracking.
9. **Debit lane budget BEFORE enqueuing.** Budget gate comes first.
10. **Daily budget resets automatically.** No manual reset needed.
11. **Freely Transformation Floor (30%):** Before presenting to Nick, verify `freely_experience` items selected >= 30% of total items across all lanes. If not, pull additional Freely items by score until floor met OR lane budget (90) exhausted. Freely v7 targets (`freely-v7-*` IDs) get a +25 score bonus within the lane.
