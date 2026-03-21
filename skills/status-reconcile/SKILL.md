---
name: "Status Reconcile"
description: "Auto-sync ledger status from plans, queues, and git evidence with forward-safe transitions and deterministic matching."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
---

# Status Reconcile

Use this skill to reconcile work ledger statuses from objective evidence.

## Purpose
Auto-sync ledger status from plans + queues + git evidence.

## Trigger
- After plan generation
- On-demand before standup

## Inputs
- `repo` (optional)
- `days_lookback`
- `apply` (`true`/`false`)
- `min_confidence`

## Objective Alignment (Mandatory)
Before applying transitions:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Include objective coverage status in reconciliation report output
- Flag items that are built/planned but objective-unmapped
- If a recurring unmapped pattern appears, add a candidate to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`

## Workflow
1. Run `planning_status_sync` precheck.
2. Scan `director_queue.json` and `plan_pipeline_queue.json`.
3. Scan git logs for explicit ledger IDs.
4. Build status suggestions with confidence scoring.
5. Apply only **forward-safe** transitions.
6. **Never** mark `verified` automatically.
7. Sync linked SOS tasks when available.
8. Write both JSON and JSONL reconciliation reports.

## Output
- `applied_count`
- `skipped_count`
- `errors`
- `report_path`

## Guardrails
- Deterministic ID matching only.
- No fuzzy completion claims.
- Never downgrade status.
- Never mark `verified` automatically.
- If `apply=false`, perform dry-run only.

## Transition policy
Allowed examples:
- `pending -> planned`
- `planned -> built`
- `dispatched -> built` (only with deterministic evidence)

Disallowed examples:
- Any backward transition
- `built -> verified` (must be human-verified)

## Reporting contract
Always produce:
- machine-readable JSON summary
- append-only JSONL event log
- list of skipped items with reason
- list of confidence-threshold rejections

---

## Variants / Absorbed Modes

### --snapshot
Read-only view of the current day-plan status without mutating or applying transitions. Generates a 30-second current status summary for Nick.
*(absorbed: status-snapshot)*
