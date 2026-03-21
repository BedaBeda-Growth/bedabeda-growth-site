---
name: work-ledger-sync
description: >
  Universal work ledger tracking for every Antigravity session. This skill
  MUST be active in every session — planning, execution, review, dispatch,
  or ad-hoc. It ensures the work ledger is updated in real time so Nick has
  a universal view of where everything is as it happens. Use this skill at
  session start (register what you're working on), at every milestone
  (status transition, note, checkpoint), and at session end (final status
  sync). Triggers: any task execution, any plan creation, any code change,
  any dispatch, any review, any completion. If you are doing work, you are
  updating the ledger.
ruleDomains:
  - ops
---

# Work Ledger Sync — Universal Agent Rule

> **Prime directive:** If you are doing work, the work ledger knows about it.
> No exceptions. No "I'll update it later." Every session, every agent, every task.

## Why This Exists

The work ledger (`public.work_ledger` in Supabase) is the single
source of truth for what is happening across the company. The Health Board reads
it. The morning pipeline reads it. Nick reads it. If your work isn't reflected
there, it's invisible — and invisible work is wasted work.

## The Three Checkpoints

Every session has exactly three mandatory ledger touches:

### 1. SESSION START — Register

When a session begins (any session — dispatch, advance, megafix, ad-hoc):

1. Identify what you're working on (task ID, plan, or ad-hoc description)
2. Find or create the matching work ledger item
3. Set `status` to `in_progress` if not already
4. Append a note: `[agent] Session started — {what you're doing}`
5. Set `updated_at` to current ISO timestamp

### 2. DURING SESSION — Milestone Updates

Update the ledger at every significant transition:

| Event | Ledger Action |
|-------|--------------|
| Plan created | Append note with plan path. Set `plan_id` if applicable. |
| Code written | Append note: files changed, what was done. |
| Tests passed/failed | Append note with result. |
| PR opened | Set `status` → `built`. Add PR URL to `links`. |
| Dispatched to Jules/heartbeat | Set `status` → `dispatched`, `dispatch_method`, `dispatched_at`. |
| Blocked on something | Append note with blocker. Do NOT change status unless truly blocked. |
| Sub-task completed | Append note. Update checkboxes if they exist. |
| Error encountered | Append note with error detail. |
| Health board light affected | Append note referencing pillar/lens. |

**Minimum frequency:** At least one ledger update every 15 minutes of active work.
If you've been working for 15 minutes without a ledger touch, stop and update.

### 3. SESSION END — Final Sync

Before the session ends (completion signal, timeout, or handoff):

1. Set final `status`:
   - `built` if code is written and PR is open
   - `in_progress` if work continues in another session
   - `pending` if nothing was started (rare — why was the session opened?)
   - `done` only if fully verified (never self-verify)
2. Append a summary note: `[agent] Session complete — {what was accomplished}`
3. Set `updated_at` to current ISO timestamp
4. If using kai-bridge, call `signal_completion` with the summary

## How to Update the Ledger

### Method 1: Supabase MCP (Preferred & Required)

You must use the `supabase-mcp-server execute_sql` tool for all reads and writes. The target project is **`cjgsgowvbynyoceuaona`** (spark-kanban) and the table is **`public.work_ledger`**.

**1. Create a new item**
```sql
INSERT INTO public.work_ledger 
  (id, title, owner, repo, status, item_type) 
VALUES 
  ('session-1a2b3c4d', 'Descriptive Title', 'kai', 'scceo', 'in_progress', 'engineering');
```

**2. Update status and timestamp**
```sql
UPDATE public.work_ledger 
SET status = 'in_progress', updated_at = NOW() 
WHERE id = 'pri-my-task-id';
```

**3. Append a note (Safely handling JSONB)**
```sql
UPDATE public.work_ledger 
SET 
  notes = notes || jsonb_build_array(
    jsonb_build_object('at', NOW(), 'text', '[agent] Working on XYZ')
  ), 
  updated_at = NOW() 
WHERE id = 'pri-my-task-id';
```

### Method 2: Shell Fallback (If MCP Fails)

If and ONLY if the Supabase MCP tool returns an error or is unavailable, use the CLI fallback.

```bash
python3 ~/scceo-1/grok-personal/scripts/ledger_update.py \
  --id "pri-my-task-id" \
  --status "in_progress" \
  --note "[agent] Working on XYZ"
```

### Method 3: In-Session File Edit (DEPRECATED)
Do **NOT** edit `work_ledger.json` directly using file replacement tools. This creates high-latency parse windows and `AUTO-CONFLICT` version splits. The Supabase MCP allows instant, atomic Postgres updates across any repository.

## Status Transition Rules

Only forward transitions are allowed:

```
pending → planned → dispatched → in_progress → built → verified → done
```

**Never go backwards** unless explicitly told to by Nick.

**Never self-verify.** Only Nick or an explicit verification workflow sets
`verified: true`.

## What Counts as a Ledger-Worthy Event

Use this checklist. If ANY of these happen, touch the ledger:

- [ ] Session started
- [ ] Plan file created or updated
- [ ] Branch created
- [ ] Significant code written (not just formatting)
- [ ] Tests run (pass or fail)
- [ ] PR opened or updated
- [ ] Task dispatched to another agent/system
- [ ] Error or blocker encountered
- [ ] Task completed or handed off
- [ ] Session ending

## Integration with Existing Systems

### Health Board
The Team / Functional light reads work ledger data. If items pile up in
`in_progress` without advancing, the light turns red. Keep statuses accurate
to keep the health board accurate.

### Rule Ledger
Rule hits that affect work items should be noted in the ledger. If a deploy
rule blocks a PR, note it on the item.

### Morning Pipeline
Nick sees the ledger first thing. Items with stale `updated_at` (>24h) get
flagged. Keep timestamps fresh.

### Heartbeat Supervisor
The heartbeat reads ledger statuses to decide dispatch. If an item shows
`in_progress` but the session died, the heartbeat will flag it as stale.
Accurate statuses prevent false alerts.

## Edge Cases

**Multiple agents working the same item:** Only one agent should own an item
at a time. Check `locked_by` before claiming. If locked by another agent,
work on something else or append a note and wait.

**Ad-hoc work with no item:** Create one. Every piece of work deserves
tracking. Use the template in Section 1.

**Cross-repo work:** Use the primary repo as the item's `repo` field. Note
the other repos in notes.

**Session dies unexpectedly:** The heartbeat supervisor will detect stale
items. But prevention is better — update frequently so the last known state
is recent.

## Enforcement

This is not optional. This is a company rule equivalent to Rule Ledger
enforcement. Every agent, every session, every time. The work ledger is the
company's operational memory. If it's not there, it didn't happen.
