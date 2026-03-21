---
name: "Get Status"
description: "Cross-repo pipeline board — backlog, in-progress, shipped today, bottlenecks, and revenue gate health across all repos in one view. Read-only, never mutates state."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# `/get-status` — Cross-Repo Pipeline Board

**Read-only. Never mutates state. Always pull fresh data.**

---

## Step 1: Parallel Data Pull

Call ALL of the following in a single message (parallel tool calls):

1. `check_work_ledger()` — nag summary + all items by status
2. `check_dispatch_registry(status_filter="queued,running,completed,failed")` — all active + recent dispatches (**must pass explicit filter** — default only returns queued,running)
3. `check_agent_prs(state="all")` — ALL PRs across repos (**use `state="all"`**, not `state="open"` — we need open PRs for IN PROGRESS and merged-today PRs for SHIPPED)
4. `check_heartbeat()` — active run, queue depth, stalled/escalated
5. `read_director_queue()` — director task chain statuses
6. `check_all_buses()` — message bus completion results per repo

**Do NOT call these sequentially.** All 6 calls go out in a single parallel batch.

---

## Step 2: Classify Items Per Repo

For each repo (rocket, app, spark-kanban, rv, scceo), sort every item into:

**BACKLOG** (not yet moving):
- Work ledger `status` in: `pending`, `planned`
- Director queue `status`: `pending`

**IN PROGRESS** (actively being worked):
- Work ledger `status` in: `dispatched`, `built`, `verification_submitted`
- Dispatch registry `status` in: `queued`, `running`
- Open PRs from `check_agent_prs` (where PR state is `open`)
- Heartbeat active run
- Director queue `status`: `running`
- Message bus items with status `running`

**SHIPPED TODAY** (done and verified today):
- Work ledger `status = verified` AND `verified_at` is today's date
- Dispatch registry `status = completed` AND `completed_at` is today
- Merged PRs from today (from `check_agent_prs` where state is `merged` AND merged date is today)
- Message bus items completed today

**Deduplication:** A single work item may appear in multiple sources (e.g., work ledger + dispatch registry + PR). Deduplicate by `item_id` or `task_id`, keeping the entry with the most advanced status. Never show the same item twice in the same column.

---

## Step 3: Bottleneck Detection

Check for each of these and flag any that apply:

| Flag | Condition | Source |
|------|-----------|--------|
| `revenue-gate-open` | Any gate with OPEN bypass test | work_ledger nag tier 1 |
| `stalled-dispatch` | `dispatched` status > 2h with no completion | dispatch_registry timestamps |
| `verification-gap` | `built` status > 24h, not verified | work_ledger stale items |
| `failed-dispatch` | `status = failed` in dispatch registry | dispatch_registry |
| `stalled-run` | Heartbeat active run with stall/escalation flag | check_heartbeat |
| `ci-blocker` | Open PR with failing CI | check_agent_prs ci_status |
| `queue-congestion` | 3+ items queued for same repo | dispatch_registry grouped by repo |
| `director-blocked` | Director task with unmet `depends_on` | read_director_queue |
| `p1-in-backlog` | P1 item sitting in pending/planned, not dispatched | work_ledger |

**Priority order:** Revenue gates first (money is leaking), then stalled dispatches, then everything else.

---

## Step 4: Output Format

Print the board using this exact structure:

```
# Pipeline Status — {HH:MM AM/PM ET}

## {repo} ({N} backlog | {N} in-progress | {N} shipped)

BACKLOG:
  [ ] {item-name} — {status}, P{priority}
  [ ] {item-name} — {status}, P{priority}

IN PROGRESS:
  [~] {item-name} — {status} {elapsed}h ago via {system} ({state})
  [~] {item-name} — built, PR #{n} open, CI {✓|✗|pending}

SHIPPED TODAY:
  [x] {item-name} — verified {HH:MM ET} by {who}
```

(Repeat block for each repo that has items. Skip repos with nothing to show.)

Sort repos by: most in-progress items first, then most bottlenecks.
Sort items within columns by priority (P1 first).

Then close with:

```
---

TOTALS: {N} backlog | {N} in-progress | {N} shipped today

BOTTLENECKS:
  [!] {item} ({repo}) — {reason}
  ...
  (or: None detected)

GATES: {N} open ({gate-names}) — revenue leaking
  (or: All closed ✓)

HEARTBEAT: {N} active | {N} queued | {N} escalated
```

If everything is clean:
```
✅ Pipeline clean. Nothing stalled.
```

Always close with:
> Run `/advance` to dispatch or unblock anything on this board.

---

## Rules

1. **Never mutate state.** No writes to work ledger, dispatch registry, director queue, or any other data source.
2. **Always fresh data.** Call all 6 MCP tools every time — never cache between invocations.
3. **Deduplicate aggressively.** Same item in multiple sources = one entry in the most advanced column.
4. **Surface bottlenecks even when things look good.** The bottleneck section exists to catch things humans miss.
5. **Keep it scannable.** Nick should get the full picture in 15 seconds. Truncate item names at 50 chars if needed.
6. **Revenue gates always surface first.** Open gate = money actively leaking.
7. **Elapsed time** — calculate from dispatch timestamp to now. Show hours if < 48h, days if older.
8. **PR status** — show `CI ✓` or `CI ✗` or `CI pending` inline.
9. **Timestamps** always in ET (Nick's timezone).
10. **No recommendations in the board itself.** This is a status board, not an advisor. Point to `/advance` for actions.
