---
name: "Conveyor Dispatch"
description: "Let it rip — full morning dispatch that syncs, selects, generates per-item task files, and enqueues everything to the heartbeat for autonomous execution."
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

# Conveyor Dispatch — Let It Rip

## Trigger Phrases

### Full pipeline (plan + activate all)
- "let it rip", "conveyor dispatch", "start the conveyor", "morning dispatch", "kick off conveyor"

### Plan only (write task files, don't enqueue)
- "plan the conveyor", "plan only", "conveyor plan", "prep the conveyor"

### Activate a specific repo (enqueue its task files to heartbeat)
- "activate rocket", "activate app", "fire rocket", "send rocket"

## What This Skill Does

Two modes — **Plan** and **Activate** — that can run together or separately.

### Mode 1: Full Pipeline ("let it rip")
Runs both phases end-to-end: plan all repos, then activate all non-excluded repos.

### Mode 2: Plan Only ("plan the conveyor")
Runs Steps 1-6: sync, distribute, select, generate task files. **Stops after task files are written.** Nothing is enqueued. Nick activates repos individually when ready.

### Mode 3: Activate Repo ("activate rocket")
Runs Steps 7-9 for ONE repo: collision guard, enqueue task files, confirm. Requires task files to already exist from a prior plan run. If no task files exist for that repo, tell Nick to run "plan the conveyor" first.

**Typical flow:** Plan the conveyor in the morning → activate repos one at a time as Nick clears out of them.

---

## Repo Targeting

By default, dispatches to all repos: rocket, spark-kanban, app, rv.

**To target specific repos:** Nick can say "dispatch rocket only" or "dispatch rocket and app" — skip all other repos in Steps 5-8. Planning (Steps 1-4) still runs for ALL repos so plans stay fresh everywhere.

**To exclude repos:** Nick can say "skip rv" or "not rv" — dispatch to everything except the named repos.

If Nick specifies repos, confirm back: "Dispatching to rocket and app only. Skipping spark-kanban, rv."

## Prerequisites

Before running, verify:
- [ ] Antigravity desktop app is running (required for heartbeat dispatch)
- [ ] `gh` CLI is authenticated
- [ ] Internet connection (for SOS sync and git operations)

---

## Step 0: Hygiene Cleanup

Before doing anything else, clear out inactive Agent RAM and ghost sessions:

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --execute --hours 6
```

## Step 1: Ingest Overnight Sidecar Results

Read sidecar status files from all repos and merge into master ledger:

```bash
cd ~/scceo-1/grok-personal && python3 conveyor_feed.py --ingest
```

Report the ingest summary. If `updated > 0`, items completed overnight.

## Step 2: Show Current Feed

Before dispatching new work, show what's already in flight:

```bash
cd ~/scceo-1/grok-personal && python3 conveyor_feed.py
```

Note any items still `executing` or `blocked` — don't re-dispatch those.

## Step 3: Sync Work Ledger from SOS

Pull latest tasks and priorities:

```bash
cd ~/scceo-1/grok-personal && python3 fresh_start.py
```

## Step 4: Distribute to All Repos

Push items to per-repo `work-ledger.md` files:

```bash
cd ~/scceo-1/grok-personal && python3 ledger_distributor.py sync --execute
```

Report: which repos received items, how many per repo, any conflicts flagged.

## Step 5: Select Items for Dispatch

For each repo, select the highest-priority buildable items (efficiency-first tie-break):

```python
import sys, json
sys.path.insert(0, '.')
from work_ledger import WorkLedger

ledger = WorkLedger()
repos = {
    'rocket': 'pro-high',
    'spark-kanban': 'pro-high',
    'app': 'pro-high',
    'rv': 'flash',
}

dispatch_plan = {}

for repo, model in repos.items():
    candidates = [
        i for i in ledger.get_items(repo=repo)
        if i.get('status') in ('pending', 'planned')
        and i.get('item_type') != 'content'
    ]
    # Gates first, then by priority, then by efficiency ROI (high→low), then lower coordination tax
    candidates.sort(key=lambda x: (
        0 if x.get('is_gate') else 1,
        x.get('priority', 2),
        -(x.get('efficiency_score', 0) or 0),
        (x.get('coordination_tax', 0) or 0),
    ))
    selected = candidates[:4]  # Max 4 per repo
    if selected:
        dispatch_plan[repo] = {
            'model': model,
            'items': selected,
        }
        print(f"\n{repo} ({model}): {len(selected)} items")
        for item in selected:
            print(f"  - {item['id']}: {item['title'][:60]} (P{item.get('priority', '?')})")

if not dispatch_plan:
    print("\n⚠️ No items to dispatch. Queue is empty or all items are in-flight.")
```

**Show this selection to Nick and wait for confirmation before proceeding.**

If Nick says "go" or "let it rip" — continue. If Nick wants to adjust, modify the selection.

## Step 5.5: Collision Guard

Before dispatching, check for active work in each target repo:

```
check_heartbeat()
```

For each repo in the dispatch plan:
1. **Active heartbeat run in this repo?** → Remove repo from dispatch. Tell Nick: "Skipping {repo} — heartbeat task already running ({task_id})."
2. **Sidecar shows `executing` or `started` status for an item?** → Remove that item. Tell Nick: "Skipping {item_id} — already executing."
3. **Nick said he's working manually in a repo?** → Remove repo from dispatch. Trust his word.

If all items for a repo are removed, skip that repo entirely.

**Show the final adjusted plan if anything changed.** Nick should see exactly what's going out before it goes.

## Step 6: Generate Per-Item Task Files

For each selected item, create a task file:

```bash
mkdir -p ~/scceo-1/gemini-tasks/conveyor
```

Each task file at `~/scceo-1/gemini-tasks/conveyor/{item-id}.md` should contain:

```markdown
# Conveyor Item: {item title}

**Item ID:** {item id}
**Repo:** {repo}
**Priority:** P{priority}

Read the `conveyor-item` skill for your execution protocol.

## Task Prompt
{item's impact_tie or detailed description}
{contents of plans/{id}.md if it exists in the target repo}

## Acceptance Criteria
{item's done_criteria or checkboxes — list each one}

## Files to Read First
{any context files referenced in the item or plan}

## Execution Protocol
1. Create branch `conveyor/{item-id}` from latest main
2. Execute the work described above
3. Run quick CI tests (check for ci-gates skill in the repo)
4. Self-reflect: rate confidence 1-10 on each acceptance criterion
5. If confidence < 9, retry once with adjusted approach
6. Push and open a PR titled `[Conveyor] {item title}` targeting main
7. Append status to `conveyor-status.jsonl` in repo root:
   {"id":"{item-id}","status":"pr_open","confidence":N,"pr_url":"...","summary":"...","at":"..."}
```

### Plan Complete Checkpoint

After generating all task files, report what's ready:

```
## Conveyor Planned

Task files ready in gemini-tasks/conveyor/:
- rocket: {N} items (pro-high)
- spark-kanban: {N} items (pro-high)
- app: {N} items (pro-high)
- rv: {N} items (flash)

Say "activate rocket" to start one repo, or "let it rip" to activate all.
```

**If mode is "plan only" → STOP HERE.** Don't proceed to Step 7.

**If mode is "let it rip" → continue to Step 7 for all repos.**

**If mode is "activate {repo}" → jump to Step 7 for that repo only.**

---

## Step 7: Enqueue to Heartbeat (Activate Phase)

**Before enqueuing any repo, run the collision guard (Step 5.5) for that repo.** Even if it passed during planning, check again — Nick may have started manual work since then.

### Single-repo activation ("activate rocket")

If Nick says "activate {repo}", enqueue ONLY that repo's task files:

1. Verify task files exist in `gemini-tasks/conveyor/` for that repo
2. Run collision guard for that repo
3. Enqueue each item:

```
heartbeat_enqueue(
  task_file="/Users/nicholaspetros/scceo-1/gemini-tasks/conveyor/{item-id}.md",
  repo="{repo}",
  model="{model}"  # pro-high for rocket/spark-kanban/app, flash for rv
)
```

4. Confirm: "Activated {repo}: {N} items enqueued."

### Multi-repo activation ("let it rip" or "activate all")

Enqueue all planned repos. Stagger by 2 minutes to avoid rate limits.

| Order | Repo | Model | Timing |
|-------|------|-------|--------|
| 1 | rocket | pro-high | T+0 |
| 2 | spark-kanban | pro-high | T+2min |
| 3 | app | pro-high | T+4min |
| 4 | rv | flash | T+6min |

Skip any repo not in the dispatch plan or excluded by Nick.

## Step 8: Confirm All Queued

Verify everything made it to the heartbeat queue:

```
check_heartbeat()
```

Each per-item task should appear as `pending` with the correct workspace path.

## Step 9: Show Morning Dashboard

```bash
cd ~/scceo-1/grok-personal && python3 conveyor_feed.py
```

Present the final summary:

```
## Conveyor Status

### Activated
- rocket: {N} items (pro-high) ✅
- spark-kanban: {N} items (pro-high) ✅

### Planned (not yet activated)
- app: {N} items (pro-high) — say "activate app"
- rv: {N} items (flash) — say "activate rv"

### Total: {active} active / {planned} planned across {repo_count} repos

### Check Progress
  python3 grok-personal/conveyor_feed.py --since 4
  check_heartbeat()
  review_completions(since_hours=4)
```

---

## Mid-Day Check (Optional)

At any point during the day, you can check conveyor progress:

```bash
# Dashboard
cd ~/scceo-1/grok-personal && python3 conveyor_feed.py --since 8

# Queue state
check_heartbeat()

# Completed tasks
review_completions(since_hours=4)
```

## Error Recovery

| Situation | Action |
|-----------|--------|
| `fresh_start.py` fails | Skip SOS sync, proceed with existing ledger data |
| `ledger_distributor.py` has conflicts | Check AUTO-CONFLICT tags, resolve manually, re-run |
| No items selected for a repo | That repo has nothing pending — skip it |
| Heartbeat enqueue fails | Check if AG desktop app is running, retry |
| Agent task times out | Heartbeat handles retry automatically |
| Agent reports low confidence | Shows as ⚠️ in evening review dashboard |

## Non-Negotiable Rules

1. **Always show item selection to Nick before enqueuing.** No blind dispatch.
2. **Max 4 items per repo.** Respect the context pressure cap.
2.1 **Efficiency-first by default.** If two items have similar priority, dispatch the one with better efficiency ROI and lower coordination burden first.
3. **Stagger repos by 2 minutes.** Don't blast all at once.
4. **RV uses `flash` model.** It's static HTML, doesn't need pro-high.
5. **Never dispatch `content` type items.** Only buildable work.
6. **Never dispatch items already in-flight.** Check sidecar/heartbeat first.
7. **Never dispatch to a repo with an active heartbeat run.** Collision guard is mandatory.
8. **Repo filter applies to dispatch only.** Planning/distribution always covers all repos.
9. **If Nick says he's working in a repo, don't dispatch there.** No arguments, no "but it's safe." Just skip it.
