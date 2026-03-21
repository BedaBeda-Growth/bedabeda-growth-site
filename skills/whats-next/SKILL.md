---
name: "What's Next"
description: "Review priorities, bugs, and health signals — auto-fix what's clearly broken, advance the conveyor pipeline, and surface the top 2-3 recommendations. Runs silently if nothing shifted."
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
  - payments
---

# What's Next — Priority Advancement Engine

When Nick says "what's next" (or this skill fires on its polling schedule), run this playbook.

**Execution context — TWO modes:**

1. **Nick's active session (manual trigger):** Runs in-thread. Full playbook. Output goes directly to Nick in this conversation.
2. **Background poll (SchedulerTick automation):** Craft Agent's scheduler always creates a new session per tick — this is a platform constraint, not a bug. In this mode: do all work silently, inject results into the pinned master session via `inject_message_to_session`, write poll state, then **produce zero visible output**. Nick sees only the injected note in his active thread. The background session should leave no trace.

**How to detect which mode you're in:** Check your session labels. If labels include `whats-next` + `auto` → you're a background poll. Otherwise → you're in Nick's session.

All state between polls is tracked in `.whats-next-poll-state.json`, not carried across sessions.

---

## Step 0.5: Session Registration + Context Recall (run first, in-thread only)

**If running in Nick's active session (not a background poll):** Do these two things before anything else.

### Register this session as active
```bash
python3 -c "
import json, os, datetime
os.makedirs(os.path.expanduser('~/.kai'), exist_ok=True)
state = {
    'session_id': '{SESSION_ID_FROM_session_state}',
    'sessions_dir': '/Users/nicholaspetros/scceo-1/sessions',
    'registered_at': datetime.datetime.now().isoformat()
}
json.dump(state, open(os.path.expanduser('~/.kai/active_session.json'), 'w'), indent=2)
"
```
This tells scheduled polls where to inject their output — they'll appear in this thread.

### Recall journal context
Call kai_memory_recall("current focus recent decisions active work dispatch status") before gathering signals. This is your steering memory — know what Nick is working on before you surface anything.

---

## Poll State Check (run second, before signal gathering)

Read the poll state file to understand what was already surfaced this session:

```bash
cat /Users/nicholaspetros/scceo-1/.whats-next-poll-state.json 2>/dev/null || echo '{"surfaced":[],"actioned":[],"last_poll_at":null,"session_id":null}'
```

The state file tracks:
- `session_id` — which session last wrote state. If different from current session, treat as fresh start (new conversation = new context).
- `surfaced` — list of item IDs or gate IDs surfaced in previous polls this session.
- `actioned` — items Nick confirmed as handled (set by Nick saying "done", "skip that", etc.).
- `last_poll_at` — ISO timestamp of last poll. If >30 min ago, do a full signal refresh.
- `last_conveyor_count` — item count from last advance. If unchanged and <10 min since last poll, skip conveyor step entirely.
- `last_gate_ids` — gate IDs that were OPEN last poll. Only resurface if new gates opened or existing ones got worse.

**Diff rule:** After gathering signals, compare against `surfaced` list. Only surface items that are:
1. New (not in `surfaced` list), OR
2. Escalated/worsened since last poll (e.g., gate was open then, still open now but severity increased), OR
3. Nick explicitly asks for a full refresh ("show me everything").

**If nothing new shifted** → exit silently. Write updated timestamp to state file, but output nothing.

---

## Rule 0: Auto-Fix Before Anything Else

**Before gathering signals, scan for and fix anything critically broken.**

Auto-fix means: detect the problem, apply the fix, log it, move on. No surface, no noise.

### What qualifies for auto-fix:

| Condition | Fix action |
|-----------|------------|
| Python syntax errors in grok-personal (misplaced docstrings, bad injections, etc.) | Run `codedoc_python_scanner.py --verify-syntax`, repair with `safe_inject_docstrings` pattern or direct edit |
| Broken import chain (module fails due to dependency with syntax error) | Fix the upstream broken file |
| Config file referencing missing path or dead key | Patch the config |
| Heartbeat dispatch module broken (dispatch_v3, heartbeat_supervisor) | Diagnose and fix — dispatch being down blocks everything |
| Dead lock file or stale PID blocking a process | Clear it |

### What does NOT qualify (surface to Nick instead):

- Any fix touching > 10 files at once
- User-facing flows (auth, checkout, signup, meetings)
- Production database schema or RLS changes
- Anything requiring a deploy or migration
- Revenue gate decisions

### Auto-fix protocol:

```bash
# 1. Check for Python syntax errors
cd /Users/nicholaspetros/scceo-1/grok-personal
python3 codedoc_python_scanner.py --verify-syntax --path . 2>/dev/null
```

If broken files found → apply targeted fix (see `safe_inject_docstrings()` or direct edit) → verify clean → log:

```python
# Log every auto-fix (don't skip this)
# update_work_ledger or append to team chat:
# "[auto-fix] Fixed: {what} in {file} — {1-line reason}"
```

Rule: **auto-fixes are silent**. Do not surface them to Nick unless they reveal a systemic issue that needs a decision.

---

## Step 1: Gather Signals (parallel where possible)

### 1a. Today's Top Priorities
```bash
cat ~/Desktop/Rocket/Todos/$(date +%Y-%m-%d).md
```
Focus on the **Top Priorities** section.

### 1b. Bugs & Errors
```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from bug_tracker import pull_bugs
bugs = pull_bugs()
open_bugs = [b for b in bugs if b.get('status') not in ('fixed', 'closed', 'wontfix')]
for b in sorted(open_bugs, key=lambda x: x.get('severity', 99))[:10]:
    print(f\"  [{b.get('severity','?')}] {b.get('title','?')[:80]} — {b.get('source','?')}\")
print(f'Total open: {len(open_bugs)}')
"
```

### 1c. Health Signals
```bash
cat ~/Desktop/Rocket/"Pipeline Health.md" 2>/dev/null | head -25
```

Also check:
- `check_work_ledger()` — unverified items, open gates, nag list
- `run_revenue_gate_checks()` — any OPEN gate = top priority
- **Payment processor health (once per session, not every poll):**
  ```bash
  cd /Users/nicholaspetros/scceo-1/grok-personal && python3 live_verification.py --json 2>/dev/null
  ```
  Any FAIL = surface immediately (payment FAILs block revenue). WARNs are informational only.

### 1d. Heartbeat Queue
- `check_heartbeat()` — active run, queue depths, escalations
- `review_completions(since_hours=4)` — completions needing verification
- **If a task looks fabricated, wrong-repo, or stale:** `cancel_run(task_id, reason="...")` — kills the process + removes from queue. Do this autonomously; no need to surface to Nick unless it reveals a systemic issue.
- **To debug a failing/timed-out task:** `get_run_log(run_id)` — reads the tail of the run log. Pass `run_id` from `check_heartbeat()` active_run or `review_completions()`.

### 1d.5. Queue Audit (run every poll)
```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 queue_audit.py --apply 2>/dev/null
```
This cross-references the heartbeat queue against git branches and commits in the target repos. Any task whose work already exists in a branch or commit gets auto-cancelled. Run it silently — only surface a count if > 0 were cancelled (e.g., "Cancelled 3 stale queue items via queue_audit").

### 1d.6. SOS Ledger Sync (every poll if op session active)
```bash
test -f ~/.op-session/meta && cd /Users/nicholaspetros/scceo-1/grok-personal && python3 sos_ledger_sync.py --apply 2>/dev/null || true
```
Syncs SOS Supabase task statuses into work_ledger.json. Run silently. If the op session isn't active, skip without surfacing.

### 1e. SOS Assigned to Nick
```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from pm_bridge import PMBridge
b = PMBridge()
tasks = b.supabase.table('tasks').select('title,status,priority').eq('assigned_to', 'nick@pinchforth.com').in_('status', ['active','in_progress','blocked']).order('priority', desc=True).limit(10).execute().data or []
for t in tasks:
    print(f\"  [{t.get('priority','?')}] {t.get('title','?')[:80]} — {t.get('status','?')}\")
print(f'Top {len(tasks)} Nick tasks')
"
```

---

## Step 2: Score & Rank

| Signal | Weight |
|--------|--------|
| Revenue blocker (open gate, payment error, checkout broken) | 10 |
| User-facing bug (auth, signup, meetings) | 8 |
| Today's Top Priority item (Nick's stated goals) | 7 |
| Unverified completion (agent shipped, needs verification) | 6 |
| Health signal degraded (email, pipeline step failing) | 5 |
| SOS assigned + blocked | 4 |
| Open bug (non-critical) | 3 |
| Backlog optimization | 1 |

---


## Rule Gate (run before acting)

Before dispatching, deploying, or mutating state, call:

```
check_rule_hits(domain="ops", last_n=5)
```

If any `high` or `critical` severity hits are active:
- Surface them to Nick before proceeding
- Do not suppress or skip — a recent hit means the system detected drift
- If the hit is expected and understood, note it and continue

This gate costs one MCP call. It prevents re-triggering known violations.

## Step 3: Conveyor Pipeline Advancement (run every poll)

**This runs every poll — no approval needed. Advancing the queue is always the right thing to do.**

### 3a. Check Acceleration Config

Read which repos are currently flagged for accelerated dispatch:

```bash
cat /Users/nicholaspetros/scceo-1/.conveyor-config.json 2>/dev/null || echo '{"accelerate":[]}'
```

`accelerate` is a list of repo keys (e.g. `["rocket", "app"]`). Accelerated repos get items **enqueued to heartbeat** immediately after plan generation. Non-accelerated repos get plans generated but **not enqueued** — Nick activates manually.

Nick can change acceleration by saying "accelerate rocket" or "stop accelerating spark-kanban". Update the config file accordingly.

### 3b. Ingest Overnight Sidecar Results

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 conveyor_feed.py --ingest 2>/dev/null
```

Merge any `conveyor-status.jsonl` updates from repo agents back into the work ledger.

### 3c. Identify Items to Advance

Check the work ledger for items that are stuck at `pending`/`ready` with no plan file:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
import json
data = json.load(open('data/work_ledger.json'))
items = data if isinstance(data, list) else data.get('items', [])
advanceable = [
    i for i in items
    if i.get('status') in ('pending', 'ready', 'planned')
    and not i.get('dispatched_at')
    and i.get('repo')  # must have a target repo
]
# Sort by priority
advanceable.sort(key=lambda x: (x.get('priority', 99), x.get('created_at', '')))
# Show top 10 per repo
from collections import defaultdict
by_repo = defaultdict(list)
for i in advanceable:
    by_repo[i['repo']].append(i)
for repo, items in sorted(by_repo.items()):
    print(f'  {repo}: {len(items)} advanceable (showing top 3)')
    for i in items[:3]:
        print(f\"    [{i.get('priority','?')}] {i.get('title','?')[:60]} — {i.get('status','?')}\")
"
```

### 3d. Classify Items — Simple vs Complex

Before generating plans, classify each advanceable item. This determines whether it gets a lightweight task file (no Grok) or goes into a batched Grok planning loop.

**Complex (needs Grok architecture review):**
- Tagged `[ARCH]`, `[INFRA]`, `[P0]`, `[SYSTEM]`, or `[MIGRATION]`
- New features touching multiple files/services
- Items with `dependencies` set on other items
- Items with `[REVENUE]` tag AND a new system/flow (not a fix)
- Title contains: "implement", "build", "redesign", "overhaul", "system", "pipeline", "refactor"

**Simple (direct task file, no Grok):**
- Bug fixes (`[BUG]`, `[FIX]`, `[SEC]`, `[PERF]` on isolated components)
- Config/env changes
- Copy/content updates
- Single-file or narrow-scope changes
- Verification / smoke test tasks

Classify programmatically:

```python
COMPLEX_TAGS = {"[ARCH]", "[INFRA]", "[P0]", "[SYSTEM]", "[MIGRATION]"}
COMPLEX_KEYWORDS = {"implement", "build", "redesign", "overhaul", "system", "pipeline", "refactor", "integrate"}

def classify(item):
    title = (item.get("title") or "").lower()
    tags = set(re.findall(r'\[[A-Z]+\]', item.get("title", "")))
    if tags & COMPLEX_TAGS:
        return "complex"
    if item.get("dependencies"):
        return "complex"
    if any(kw in title for kw in COMPLEX_KEYWORDS) and "[REVENUE]" in tags:
        return "complex"
    if any(kw in title for kw in {"implement", "build system", "redesign", "overhaul", "pipeline"}):
        return "complex"
    return "simple"
```

### 3e. Generate Plans — Two Paths

#### Path A: Simple items → direct task file (no Grok, fast)

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal
python3 task_prompt_generator.py --item {ITEM_ID} --output ../gemini-tasks/{REPO}/ 2>/dev/null
```

Run for ALL simple items in the batch. Each gets its own task file immediately.

#### Path B: Complex items → batch into ONE Grok plan loop

Group complex items into batches of `grok_batch_size` (default: 4, from config). Run **one** `grok-plan-loop` per batch — not one per item. The loop already handles N items together with wave scheduling and dependency graphing.

```
# For each batch of complex items:
Invoke [grok-plan-loop] skill with:
  - repo: {REPO}
  - scope: item IDs {ID1}, {ID2}, {ID3}, {ID4}
  - max_cycles: 5  (shorter than full-repo loop — we're reviewing a slice, not the whole backlog)
  - emit packet: true
```

**Why batching saves credits:** One Grok call reviews 4 items together with shared context (wave deps, concurrency map, rollback) instead of 4 separate calls each rebuilding that same context. Roughly 3-4x efficiency on complex batches.

**Batch size config:**

```json
{
  "accelerate": ["rocket"],
  "max_per_repo_per_poll": 10,
  "grok_batch_size": 4
}
```

Nick can say "smaller Grok batches" (→ 2) or "larger batches" (→ 6). Larger = more context efficiency but slower per-batch. Default 4 is the sweet spot.

**If no complex items in the poll window:** Skip Grok entirely. All items go Path A.
**If only 1 complex item:** Still goes Path B (one-item Grok batch). The architecture review overhead is worth it for P0/INFRA items even solo.

**Target:** `max_per_repo_per_poll` items per repo per poll, split across both paths. Configurable.

### 3f. Enqueue Accelerated Repos

For repos listed in `accelerate`, immediately enqueue the generated task files via heartbeat:

```bash
# heartbeat_enqueue(task_file=".../gemini-tasks/{repo}/{item_id}.md", repo="{repo}", session_id="{date}-dispatch")
```

For non-accelerated repos: task files are written to `gemini-tasks/{repo}/` but NOT enqueued. They sit ready for Nick to fire with "activate {repo}".

### 3g. Log Conveyor Activity

After each poll advance, append a summary line to the team chat:

```
[conveyor] Advanced {N} items: {repo1} → {count} queued | {repo2} → {count} planned (not enqueued) | Accelerating: {repos}
```

Only log if something actually moved. Silent if queue is empty or nothing changed.

---

## Step 4: Recommend Top 2-3

Only surface if something meaningful shifted. Format:

```
## What's Next

1. **[Title]** — [why this is #1, 1 sentence]
   Action: [specific next step]

2. **[Title]** — [why this is #2]
   Action: [specific next step]

3. **[Title]** — [why this is #3]
   Action: [specific next step]

---
Signals: [N] bugs open | [N] gates open | [N] completions pending | pipeline grade [X]
Conveyor: [N] items advanced | Accelerating: [repos] | Queue: [pending/running/done]
```

**If nothing shifted since last poll → exit silently. Zero output.**

---

## Step 4.5: Trend Analysis + Streamlining Recommendation

Run every poll — not just when something urgent surfaces. This is the "zoom out" step. Its job is to notice what the day-to-day signals are telling us about the system itself, not just what's broken right now.

### 4.5a. Recall recent patterns

Run two calls in parallel:
```
kai_memory_recall("recurring issues overbuilt systems streamlining efficiency patterns dispatch failures timeouts")
kai_memory_pattern_check("system efficiency dispatch heartbeat pipeline failures")
```

This pulls from the journal entries written in Step 6 across previous polls. If LM Studio is down, skip this step silently.

### 4.5b. Read the streamlining dedup log

```bash
cat ~/.kai/streamlining_log.jsonl 2>/dev/null | tail -20
```

This log tracks what recommendations have already been surfaced. Parse the `pattern_id` and `surfaced_at` fields. Any recommendation with a matching `pattern_id` surfaced within the last **7 days** should be skipped — Nick already saw it.

Format of each log entry (append-only JSONL):
```json
{"pattern_id": "heartbeat-timeout-510s", "recommendation": "Raise supervisor_hard_timeout to 900s", "surfaced_at": "2026-03-08T13:30:00Z", "poll_count": 3, "auto_escalated": false, "resolved": false}
```

### 4.5c. Analyze for patterns

Using the journal recall + today's signals, ask:

| Question | What to look for |
|----------|-----------------|
| **What signal has appeared 3+ polls in a row?** | Same gate open, same timeout, same error class |
| **What system is generating disproportionate noise?** | High failure rate relative to value delivered |
| **What's overbuilt for its actual usage?** | Complex pipeline for a simple outcome |
| **What could be eliminated, merged, or simplified?** | Duplicate mechanisms, dead code paths, redundant checks |
| **What manual work is happening that shouldn't be?** | Anything Nick is doing by hand that a rule could handle |

Count poll occurrences by scanning journal entries tagged `poll,whats-next` for recurring keywords. If a term (e.g. "heartbeat escalation", "xendit gate", "renovio timeout") appears in 3+ entries → it's a trend.

### 4.5d. Generate ONE streamlining recommendation

Surface only if:
1. The pattern is NEW — `pattern_id` not in dedup log within 7 days
2. It's actionable — a specific config change, deletion, merge, or routing fix
3. It's a genuine simplification — makes something faster, smaller, or removes a maintenance burden

**Format:**
```
🔧 [Streamlining] {Pattern title}
Trend: {N polls | N escalations | N failures} — {1 sentence on what keeps happening}
Root cause: {why it keeps recurring}
Recommendation: {specific action — e.g. "Raise supervisor_hard_timeout 510s → 900s in heartbeat_supervisor.py", "Route Renovio via --single rv, not heartbeat queue"}
Impact: {what gets faster/simpler — be concrete}
```

**Keep it to 1 recommendation per poll.** If multiple patterns qualify, pick the one with highest recurrence × impact. The others will surface in future polls.

### 4.5e. Auto-escalate if threshold hit

If the SAME pattern appears in **3+ journal entries** AND severity is **increasing** (more escalations, higher counts each time):

1. Add a streamlining task to the work ledger:
```python
# update_work_ledger or append to data/work_ledger.json
{
  "title": "[STREAMLINE][{REPO}] {Pattern title}",
  "status": "pending",
  "repo": "{relevant_repo}",
  "priority": 5,
  "tags": ["streamlining", "system-health"],
  "source": "whats-next-poll-trend",
  "created_at": "{now}"
}
```

2. Set `auto_escalated: true` in the dedup log entry.
3. Append a note to team chat: `[streamlining] Auto-added to {repo} queue: {pattern title} (seen in {N} polls, severity rising)`

Do NOT auto-escalate for business/revenue priorities — those should go through Nick. Auto-escalate is for **engineering system hygiene** only (timeouts, routing, dead code, overbuilt pipelines).

### 4.5f. Write to dedup log

After every recommendation (whether surfaced or skipped), append to the dedup log:

```bash
python3 - << 'EOF'
import json, datetime, os

entry = {
    "pattern_id": "{snake_case_pattern_id}",
    "recommendation": "{one-line recommendation}",
    "surfaced_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "poll_count": {N},  # how many journal entries had this pattern
    "auto_escalated": False,  # update if 4.5e fired
    "resolved": False
}

log_path = os.path.expanduser("~/.kai/streamlining_log.jsonl")
with open(log_path, 'a') as f:
    f.write(json.dumps(entry) + '\n')
EOF
```

### 4.5g. Journal the recommendation

```
kai_memory_journal(
  entry="Streamlining rec {date}: [{pattern_id}] — {1-line recommendation}. Trend evidence: {N journal entries, N polls}. Auto-escalated: {yes/no}. Next: {specific action}.",
  tags="streamlining,patterns,{repo}"
)
```

This is what future polls read via `kai_memory_recall("streamlining patterns")` to detect whether the recommendation was actioned, escalated, or ignored. If ignored for 3+ polls → bump to `auto_escalated: true`.

---

## Step 5: Update Today's Todo

- Mark newly completed items `[x]`
- If a new high-priority item was discovered (gate open, critical bug), append to Top Priorities

---

## Step 6: Write Poll State (always, every poll)

After every poll — whether you surfaced something or exited silently — write the updated state file:

```python
import json, datetime

SESSION_ID = "{current_session_id}"  # e.g. "260308-swift-rainbow" from session_state

# Load existing state
try:
    state = json.load(open('/Users/nicholaspetros/scceo-1/.whats-next-poll-state.json'))
except:
    state = {"surfaced": [], "actioned": [], "session_id": None}

# If new session, reset surfaced/actioned (fresh conversation context)
if state.get("session_id") != SESSION_ID:
    state["surfaced"] = []
    state["actioned"] = []
    state["session_id"] = SESSION_ID

# Merge in anything newly surfaced this poll (by item/gate ID)
newly_surfaced = [...]  # IDs of items you surfaced in Step 4
state["surfaced"] = list(set(state["surfaced"] + newly_surfaced))

# Update timestamps and counts
state["last_poll_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
state["last_gate_ids"] = [...]   # gate IDs that are currently OPEN
state["last_conveyor_count"] = N  # total advanceable items counted

with open('/Users/nicholaspetros/scceo-1/.whats-next-poll-state.json', 'w') as f:
    json.dump(state, f, indent=2)
```

**Nick can say "mark that done" or "skip xendit for now"** → append that item's ID to `actioned`. It won't resurface until the next session.

### Also journal what you found (in-thread runs only)

After writing the state file, call kai_memory_journal with a brief steering summary:

```
kai_memory_journal(
  entry="Poll {timestamp}: [1-2 sentence summary of what was surfaced and why].
  Gates open: {list}. Dispatched: {list}. Nick's focus: {current P0}.
  Next action: {what Nick should do next}.",
  tags="poll, whats-next, {date}"
)
```

This journal entry becomes the context that future polls (including background polls) read via `kai_memory_recall` before steering. Keep it dense and specific — this is Kai's working memory, not a log.

**What to always capture in the journal:**
- Nick's stated focus for the session (P0s, what he said matters today)
- Any decisions made ("skip xendit for now", "tax math is priority 1")
- What's dispatched and in flight
- What gates are open and who needs to act
- **Recurring signals this poll** — exact counts: heartbeat escalations (N), gate failures (N), stale items (N). Future polls need these numbers to detect trends.
- **Streamlining pattern if noticed** — even if below the 3-poll threshold, log it: "heartbeat timeouts at 21/31 again — 2nd poll in a row". These become the trend data.
- **What was skipped or deduped** — if a streamlining rec was suppressed because it was in the log within 7 days, note it: "skipped heartbeat-timeout rec (surfaced 2026-03-08, not yet actioned)"

---

## Repo Acceleration — How to Set It

Nick controls acceleration via natural language. Update `.conveyor-config.json` when he says:

| Nick says | Action |
|-----------|--------|
| "accelerate rocket" | Add `rocket` to `accelerate` array |
| "accelerate rocket and app" | Set `accelerate: ["rocket", "app"]` |
| "stop accelerating spark-kanban" | Remove from array |
| "pause the conveyor" | Set `accelerate: []` (plans still generate, nothing enqueues) |
| "full send" | Set `accelerate: ["rocket", "app", "spark-kanban", "rv"]` |

Config file: `/Users/nicholaspetros/scceo-1/.conveyor-config.json`

```json
{
  "accelerate": ["rocket", "app"],
  "max_per_repo_per_poll": 2,
  "updated_at": "2026-03-08T08:46:00"
}
```

---

## Rules

1. **Auto-fix first.** If something is broken and contained, fix it before even gathering signals.
2. **Never dispatch production-touching work without Nick.** Auto-dispatch is for agent-safe code tasks.
3. **Revenue blockers always surface first.** No exceptions.
4. **Keep recommendations to 2-3.** Nick needs the top things, not a wall of text.
5. **Be specific.** "Fix DodoPay 500 error in checkout edge function" not "investigate payment issues."
6. **Quiet when nothing changed.** No noise. Only surface/log when something actually moved.
7. **Track everything dispatched.** Every auto-dispatch + every auto-fix gets a work ledger note or team chat log.
8. **Conveyor advances every poll.** Even if nothing else needs attention, the queue always moves forward.
9. **Background polls create a new Craft Agent session (platform constraint — unavoidable).** Craft Agent's SchedulerTick always spawns a new session per tick. This is not a bug. The correct behavior: the background session does its work silently, injects everything into the pinned master thread via `inject_message_to_session`, then **produces zero output of its own**. Nick sees one clean thread (the pinned master), never the background session output. If you are in a background poll session (label: `whats-next`, `auto`): do all work silently, inject, write poll state, then end with no output — not even a summary sentence. If you are in Nick's active session (triggered manually by "what's next"): run the full playbook and respond in-thread normally.
10. **Diff against last poll.** Don't re-surface what Nick already saw. Read Step 0.5 state, compare, only output net-new signals. If nothing new → silent exit + state file update.
