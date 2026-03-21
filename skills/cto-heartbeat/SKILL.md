---
name: "CTO Heartbeat"
description: "Drive CTO mode — plan, dispatch via heartbeat, monitor completions, verify, and close work items at Mach 6 speed."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
  - deploy
---

# CTO Heartbeat — Operational Playbook

> **Batch morning dispatch?** Use `conveyor-dispatch` instead — it syncs, selects, generates task files, and enqueues items across all repos in one shot. This skill is for **single-item dispatch, monitoring, and verification**.

Use this skill when Nick asks to:
- dispatch a single task to Gemini via the heartbeat system
- check what's running / completed / escalated
- run the full CTO loop: plan → dispatch → monitor → verify → close
- monitor and verify agent completions

## Non-negotiables

1. **"Done" = verified on the live site.** Never mark verified from agent output alone.
2. **One active task at a time.** Supervisor enforces this. Don't fight it.
3. **Always set session_id** so completions route back to this session.
4. **20 dispatches/day** hard cap. Plan tasks to maximize value per dispatch.
5. **Never skip verification.** If you can't verify, say "not verified."
6. **Always specify `repo` or `workspace`** when dispatching. Without it, AG runs in the playground — work is lost.
7. **Efficiency dispatch-worthiness gate:** only dispatch work expected to reduce bottlenecks or increase throughput/capacity; park net-negative complexity work unless Nick explicitly overrides.

## Objective Alignment (Mandatory)
Before dispatching any task:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Map the work item to at least one objective ID in the task context
- If unmapped, pause and ask: **"What's the objective here?"**
- Ensure acceptance criteria include objective-level verification loop evidence
- Log net-new durable objective candidates to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`

## Phase 1: Orient (every session start)

Run these in sequence:

1. `kai_warm_start()` — heartbeat digest is included automatically
2. `check_heartbeat()` — active run, queue depths, escalations
3. `review_completions(since_hours=24)` — what completed since last session
4. `check_work_ledger()` — what needs verification or dispatch

Surface to Nick:
- Any escalated items (supervisor couldn't complete)
- Completions awaiting verification
- Highest-priority unplanned items

## Phase 2: Plan

When identifying work to dispatch:

1. Check work ledger for highest-priority `pending` or `planned` items
2. Run quick efficiency filter: `time_delta`, `cost_delta`, `cycle_delta`, `capacity_delta`, `quality_risk`, decision `keep|park|reject`
3. Write task markdown file to `~/scceo-1/gemini-tasks/<task-id>.md` for `keep` items
4. Use this template:

```markdown
# [Task Title]

**Revenue Impact:** [Why this matters — connect to $30k plan]
**Context:** [What the agent needs to know about current state]

## Files to Read First
- path/to/file1.ts
- path/to/file2.py

## Task
[Clear, specific, scoped instructions. One task per dispatch.]

## Design Standards
- [Constraints: no breaking changes, match existing patterns, etc.]

## Acceptance Criteria
- [ ] Users can complete Stripe checkout
  verify:
    grep: "createSession.*stripe"
    test: "npm run test:checkout"
- [ ] Error shown on payment failure
  verify:
    grep: "error.*payment"
    test: "npm run test:errors"

## Files to Modify
- path/to/target/file.ts
```

Rules:
- One task per file. Don't batch.
- Acceptance criteria must be grep-verifiable or visually checkable
- Include "Files to Read First" so agent has context
- Include timeout expectation in task body if needed


## Rule Gate (run before acting)

Before dispatching, deploying, or mutating state, call:

```
check_rule_hits(domain="deploy", last_n=5)
```

If any `high` or `critical` severity hits are active:
- Surface them to Nick before proceeding
- Do not suppress or skip — a recent hit means the system detected drift
- If the hit is expected and understood, note it and continue

This gate costs one MCP call. It prevents re-triggering known violations.

## Phase 3: Dispatch

```
heartbeat_enqueue(
  task_file="/Users/nicholaspetros/scceo-1/gemini-tasks/<task-id>.md",
  model="pro-high",
  session_id="<current-session-id>",
  repo="rocket"
)
```

**Workspace targeting (REQUIRED):** Always specify `repo` so AG works in the correct repo.

Repo keys: `rocket`, `spark-kanban`, `app`, `rv`, `scceo`

Alternatively, pass a full path via `workspace` instead of `repo`:
```
heartbeat_enqueue(
  task_file="...",
  workspace="~/Documents/Rocket/fractional-ignite"
)
```

Model selection guide:
- `pro-high` — default for multi-file, complex logic
- `flash` — quick formatting, single-file, copy changes
- `pro-low` — medium complexity, faster than pro-high

**Run Bus integration (when available):**
Dispatch automatically creates a `RunEnvelope` with:
- `run_id` — deterministic from task_id + timestamp
- `originating_session_id` — current Craft session (for completion routing)
- `repo` + `workspace` — from dispatch params
- `model` + `fallback_model` — from model selection
- `timeout_seconds` + `stall_threshold_seconds` — from task metadata or defaults (1800s / 240s)
- `expected_outputs` — parsed from acceptance criteria in task file

The run bus tracks this envelope from `pending` → `running` → completion. No manual monitoring needed — Phase 4 handles it.

After enqueue:
- Update work ledger: `update_work_ledger(item_id, "update_status", "dispatched")`
- Confirm task appears in queue: `check_heartbeat()`

## Phase 4: Monitor

### Real-Time Run Bus (preferred — when available)

The AG feedback loop provides live run telemetry via the local run bus. When `web_chat.py` exposes the `/runs` API:

**Live status:**
- `GET /runs` — all active runs with state, repo, model, elapsed time
- `GET /runs/<run_id>` — full RunEnvelope + event history
- `GET /runs/feed` — SSE stream of run events (progress, stalls, completions)

**Run health indicators:**
- `running` — healthy, file changes within threshold
- `waiting` — paused for input or dependency
- `stalled` — no file changes or heartbeat for >240s (configurable per run)
- `blocked` — human intervention required
- `verifying` — completion written, awaiting verification handoff

**Operator control actions (via `/runs/<run_id>/action`):**
- `retry_run(run_id)` — restart a failed/stalled run
- `pause_run(run_id)` — halt execution, preserve state
- `cancel_run(run_id)` — terminate run, mark cancelled
- `switch_model(run_id, model)` — swap worker model mid-run (e.g. Gemini → Opus)
- `request_snapshot(run_id)` — force a status snapshot from the worker
- `narrow_repo_scope(run_id, repo)` — constrain a drifting worker to one repo
- `heartbeat` — explicit "keep alive" for legitimate long-think tasks

**Stall response protocol:**
1. Run bus emits `run.stalled` → Craft receives warning in session
2. Check: is the task-file still being appended? (legitimate thinking vs truly stuck)
3. If stuck >8 min: `switch_model` or `retry_run`
4. If repo-thrashing (>3 repos in <5 min): `narrow_repo_scope`
5. If retries exhausted: `cancel_run` → escalate to Nick

### Legacy Polling (fallback)

The supervisor handles polling automatically (every 15s when running). You will receive:

- **macOS notification (Glass sound)** — task completed successfully
- **macOS alert (Basso sound)** — escalation, retries exhausted
- **Deep link** — escalation auto-creates Craft Agent sidebar session

To check manually:
- `check_heartbeat()` — is something running? what's queued?
- `review_completions(since_hours=1)` — recent results
- `heartbeat_control(action="tick")` — force one cycle

To pause/resume:
- `heartbeat_control(action="pause")` — halt new dispatches
- `heartbeat_control(action="resume")` — restart dispatches

## Phase 5: Verify + Close

When a completion arrives (via run bus `run.completed` event or `review_completions()`):

1. **Auto-Verify Phase**:
   - Run quick CI gates using the `verification-router` skill.
   - Read the structured acceptance criteria from the corresponding task file.
   - For each criterion, run its associated `grep` and/or `test` commands.
2. Read the completion summary + run event history
3. **Artifact sanity check:** Did files actually change in the target repo? (run bus tracks `run.file_changed` events — if completion claims success but zero artifacts, it's suspicious)
4. If passes all criteria and CI gates:
   - `update_work_ledger(item_id, "verify", summary_of_gates)`
   - Run transitions to `done`
   - Post to team chat: `send_team_message("Verified: <item> — <summary>")`
5. If fails any (CI gates, artifact check, or criteria missing):
   - `update_work_ledger(item_id, "fail", "what failed and why")`
   - notify Nick with failure evidence
   - Run transitions to `failed`
   - Decide: refine prompt and re-dispatch with `retry_run` (auto-retry once), or escalate to Nick with failure evidence
6. Move to next priority item

**Remember:** "Done" = verified on the live site. Run bus `done` state only means the agent finished. Ledger verification is still Kai or Nick, never the agent.

## Supervisor Management

Start the supervisor (must be running for dispatch to work):
```bash
python3 ~/scceo-1/grok-personal/gemini_bridge/heartbeat_supervisor.py watch --interval 15
```

Start the session router (must be running for completions to appear in session):
```bash
python3 ~/scceo-1/grok-personal/session_router.py --watch
```

Check if running:
```bash
ps aux | grep heartbeat_supervisor
ps aux | grep session_router
```

## Quick Invocation Examples

- "Check what the heartbeat did overnight and verify completions."
- "Dispatch the top 3 priorities to Gemini via heartbeat."
- "What's running right now? Any escalations?"
- "Pause the heartbeat — I need to review before more dispatches."
- "Write a task for pri-045 and send it to Gemini."
