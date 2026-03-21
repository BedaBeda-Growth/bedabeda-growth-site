---
name: "Advance"
description: "Dispatch menu for pipeline bottlenecks — runs get-status, maps stuck items to dispatch commands, presents a numbered menu, executes what Nick approves."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
  - payments
---

# `/advance` — Dispatch Menu for Pipeline Bottlenecks

**Coupled to `/get-status`.** Runs the same data pull first, then generates actionable dispatch commands for everything that's stuck, stalled, or ready to move.

---

## Step 1: Pull Pipeline Data

First, run a silent background sync so Jules completions are recognized:

```bash
python3 ~/scceo-1/grok-personal/status_reconcile.py --apply True
```

Then run the same parallel data pull as `/get-status`:

1. `check_work_ledger()` — all items with nag summary
2. `check_dispatch_registry(status_filter="queued,running,completed,failed")` — all active + recent dispatches (**explicit filter required**)
3. `check_agent_prs(state="all")` — ALL PRs across repos (**`state="all"`** — need open for actions + merged for context)
4. `check_heartbeat()` — active run, queue depth, escalations
5. `read_director_queue()` — director task chain statuses
6. `check_all_buses()` — message bus status per repo

**All 6 calls in parallel.** If fresh get-status data exists from this same session (within last 5 minutes), reuse it instead of re-pulling.

Then classify into columns and detect bottlenecks using the same logic as get-status Step 2 and Step 3.

---

## Step 2: Identify Advanceable Items

For each bottleneck or stuck item, determine the correct advance action:

| Current State | Condition | Advance Action | Tool |
|---|---|---|---|
| `pending` in backlog | Has plan file in `gemini-tasks/` or `plans/` | Dispatch to heartbeat | `heartbeat_enqueue(task_file, repo)` |
| `pending` in backlog | No plan file exists | Generate task file first | Suggest running `/conveyor-dispatch` for that repo |
| `dispatched` | Stalled > 2h, no completion | Re-dispatch with failure context | `dispatch_agent(repo, "Retry: {context from previous attempt}")` |
| `built` | Unverified > 24h | Run verification check | Direct curl/grep/git structural checks |
| `failed` | In dispatch registry | Re-dispatch with error context | `dispatch_agent(repo, "{prompt with error summary}")` |
| Open PR | CI failing | Dispatch CI fix | `dispatch_agent(repo, "Fix CI: {error from PR checks}")` |
| Open PR | CI passing | Merge-ready, needs Nick | Flag as `needs_nick` in menu |
| Director task | Blocked on unmet dependency | Check dependency status, unblock if possible | `update_director_queue(task_id, action="complete")` on the dependency |
| Revenue gate | Open / bypass test passing | Priority fix — escalate immediately | Surface at top of menu with ⚠️ |
| P1 in backlog | Not dispatched, high priority sitting idle | Dispatch immediately | `heartbeat_enqueue()` or `dispatch_agent()` |

### Finding Plan Files

When checking if a pending item has a plan file:
1. Check `~/scceo-1/gemini-tasks/conveyor/{item-id}.md`
2. Check `~/scceo-1/gemini-tasks/{repo}/{item-id}.md`
3. Check `~/scceo-1/plans/{item-id}.md`
4. Check the target repo's local `plans/` directory

If found in any location → eligible for direct dispatch.
If not found → suggest `/conveyor-dispatch` to generate plans first.

---

## Step 3: Present Numbered Menu

Format the menu like this:

```
## Advance Menu — {HH:MM AM/PM ET}

Based on current pipeline status:

1. ⚠️ [rocket] Fix revenue gate: jitsi-jwt (gate OPEN, revenue leaking)
   → dispatch_agent("rocket", "Fix jitsi JWT gate: bypass test should fail when...")

2. [rocket] Retry subscription-gating (stalled >2h, no completion)
   → dispatch_agent("rocket", "Complete subscription gating. Previous attempt stalled at: {context}")

3. [rocket] Verify homepage-faces-fix (built 26h ago, PR merged, unverified)
   → Will curl live site + grep for face images on homepage

4. [app] Dispatch auth-redirect-fix (P1 sitting in backlog, plan file ready)
   → heartbeat_enqueue("~/scceo-1/gemini-tasks/conveyor/auth-redirect-fix.md", repo="app")

5. [spark-kanban] Fix CI on PR #18 (type error in task-sort.ts)
   → dispatch_agent("spark-kanban", "Fix tsc error in task-sort.ts: {error text}")

6. [rv] Merge-ready: contact-form PR #7 (CI passing, needs review)
   → 👤 Needs Nick: review + merge

Which ones? (e.g. "1, 3" or "all except 6" or "skip")
```

### Menu Ordering Rules

1. **Revenue gates first** (⚠️ prefix) — money is actively leaking
2. **Stalled/failed dispatches** — work that started but got stuck
3. **Unverified built items** — shipped but not confirmed
4. **P1s in backlog** — high-priority work not yet started
5. **CI fixable items** — quick wins to unblock PRs
6. **Needs_nick items last** (👤 prefix) — Nick's call, can't auto-dispatch

### Menu Rules

- **Max 10 items in the menu.** If more exist, show top 10 by priority and note "N more items available — say 'show all' to see the full list."
- **Show the exact command** that will run for each item. No ambiguity.
- **For re-dispatches**, always include the failure/stall context in the prompt so agents don't repeat the same mistake.
- **For verifications**, describe the specific check that will run (curl URL, grep output, git diff, etc.).

---


## Rule Gate (run before acting)

Before dispatching, deploying, or mutating state, call:

```
check_rule_hits(domain="payments", last_n=5)
```

If any `high` or `critical` severity hits are active:
- Surface them to Nick before proceeding
- Do not suppress or skip — a recent hit means the system detected drift
- If the hit is expected and understood, note it and continue

This gate costs one MCP call. It prevents re-triggering known violations.

## Step 4: Execute Approved Commands

**Wait for Nick's response.** Only execute what Nick explicitly approves.

Nick can say:
- `"1, 3"` → execute items 1 and 3
- `"all"` → execute everything (except needs_nick items)
- `"all except 6"` → execute everything except item 6
- `"skip"` → do nothing
- `"just 1"` → execute only item 1

For each approved item:

### 4a. Execute the Action
Run the dispatch/verification/fix command as shown in the menu.

### 4b. Update Work Ledger
- Dispatched items: `update_work_ledger(item_id, "update_status", "dispatched")`
- Verified items: `update_work_ledger(item_id, "verify")`
- Failed verifications: `update_work_ledger(item_id, "add_note", "Verification failed: {reason}")`

### 4c. Update Dispatch Registry (for dispatches)
The dispatch tools handle this automatically. No manual registry update needed.

### 4d. Report Result Inline

After executing each approved item, report immediately:

```
✅ #1: Dispatched jitsi-jwt gate fix to rocket (task_id: jitsi-jwt-fix-20260310)
✅ #3: Verified homepage-faces-fix — 4 face images found on homepage, all loading
❌ #4: auth-redirect-fix dispatch failed — heartbeat queue full, will retry in 2min
```

---

## Safety Rules

These are **non-negotiable**. No exceptions.

1. **Items touching auth/checkout/signup → always `needs_nick`.** Never auto-dispatch changes to authentication flows, payment processing, or user registration without Nick's explicit approval per-item.

2. **Re-dispatches include the failure reason.** The prompt sent to the agent must contain what went wrong last time so it doesn't repeat. Pull context from dispatch registry `error_summary` field or heartbeat run log.

3. **Verifications use structural gates where available.** Prefer `curl` + status code, `grep` + expected output, `git diff` + expected changes over "looks right." If no structural gate exists, flag as `needs_nick` for manual verification.

4. **Never auto-merge PRs.** Always flag as `needs_nick`. Nick reviews and merges.

5. **Never dispatch to a repo with an active heartbeat run.** Check `check_heartbeat()` — if a run is active for that repo, skip it and note in the menu: "⏳ Skipped — heartbeat run active in {repo}."

6. **Max 4 concurrent dispatches per repo.** Respect the convoy limit from `/conveyor-dispatch`.

7. **Revenue gate fixes are always priority 1** in the menu, but still require Nick's approval to execute.

---

## Relationship to Other Skills

| Skill | What It Does | How `/advance` Differs |
|---|---|---|
| `/get-status` | Read-only pipeline board | `/advance` acts on the board — generates dispatch commands |
| `/plan-advance` | Executes one day-plan step | `/advance` is cross-repo batch dispatch, not day-plan scoped |
| `/conveyor-dispatch` | Full morning pipeline: sync → plan → enqueue | `/advance` is tactical — targets bottlenecks, not full pipeline |
| `/whats-next` | Auto-fix + signals + recommendations | `/advance` is simpler — explicit menu, Nick picks, we execute |
| `/status-reconcile` | Auto-sync ledger from evidence | `/advance` may trigger states that reconcile later syncs |

No conflicts. `/advance` complements all of these.

---

## Python Automation Audit

After dispatch: were any advance actions deterministic (status check, ledger query, CI fix script)?

- Quick check: `python3 ~/.agents/skills/prefer-python-over-llm/scripts/classify_task.py "action description"`
- If scriptable → log `rule_ledger.skill_usage` with `python_candidate=true`
- Rule: `ops-prefer-python-over-llm`

---

## Variants / Absorbed Modes

### (default)
The full dispatch menu flow covers all use cases: get-status → map stuck items → numbered menu → Nick picks → execute.
This replaces `plan-advance` (execute next unblocked move in the day plan), which is a subset of the menu flow.
*(absorbed: plan-advance)*

### --verify
Execute verification tests and structural gates natively.
*(absorbed: advance-and-verify)*

### --local
Batch merge PRs locally, execute unit tests locally, and skip cloud-based verification bounds.
*(absorbed: local-advance)*