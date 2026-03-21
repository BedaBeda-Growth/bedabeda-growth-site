---
name: "Duplicate Cleanup"
description: "Audit the work ledger for duplicate priorities, select canonical items, move duplicates out of the active queue, and preserve traceability with canonical links and cleanup notes."
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
ruleDomains:
  - ops
---

# Duplicate Cleanup — Work Ledger Canonicalization

Use this skill whenever Nick, Kai, Gemini, or Antigravity needs to clean duplicate priorities out of the work ledger.

## Goal
Make sure duplicate work ledger items never remain active queue items once duplicate scope is confirmed.

## Canonical rule
If duplicate scope is confirmed:
- the duplicate item must **not** stay `pending`, `planned`, or `dispatched`
- it must move to either:
  - `duplicate`
  - `archived_duplicate`
- it must link to the canonical item
- it must preserve history

## Source of truth
Primary file:
- `/Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json`

Reference files:
- `/Users/nicholaspetros/scceo-1/grok-personal/work_ledger.py`
- `/Users/nicholaspetros/scceo-1/skills/plan-and-prioritize/SKILL.md`
- `/Users/nicholaspetros/scceo-1/sessions/260310-early-fern/data/duplicate-status-convention-2026-03-11.md`
- `/Users/nicholaspetros/scceo-1/sessions/260310-early-fern/data/2026-03-11-broader-planning-exercise-results.md`

## Definitions

### Canonical item
The one item that should remain authoritative for the work family.

### Duplicate item
A row that represents the same work and should no longer remain active in the planning queue.

### Status meanings
- `duplicate` — duplicate confirmed, retained for visible audit/history
- `archived_duplicate` — duplicate confirmed, intentionally removed from active queue consideration

## Canonical selection rules
Choose the canonical item in this order:
1. `verified`
2. `verification_submitted`
3. `built`
4. `dispatched`
5. `planned`
6. `pending`
7. `failed`

Tie-breakers:
1. has PR / Jules evidence
2. lower numeric priority
3. older `created_at`
4. richer metadata (`objective_ids`, `business_goal`, notes, links)

## Duplicate categories to clean first
1. exact-title duplicates
2. obvious same-scope duplicates with minor wording variation
3. `AUTO-CONFLICT-*` items
4. `[TEST]` / `DELETE ME` items
5. duplicate verification/fix variants already surfaced by planning analysis

## Required behavior for every confirmed duplicate
For each duplicate item:
1. set `status` to `duplicate` or `archived_duplicate`
2. set `links.canonical_item_id = <canonical-id>`
3. append a note:
   - `[duplicate-cleanup] Collapsed into canonical item <ID> because this row duplicates the same scope.`
4. preserve all previous notes/history
5. do **not** delete the row

## When to use `duplicate` vs `archived_duplicate`

### Use `duplicate`
- still useful to keep visibly audit-able for a bit
- family cleanup may still be under review
- you want it clearly visible as duplicate, but not active

### Use `archived_duplicate`
- `AUTO-CONFLICT-*`
- `[TEST]` / `DELETE ME`
- unquestionably redundant shadows
- rows that should vanish from active queue consideration immediately

## Required output
Always produce:
1. total duplicates processed
2. canonical families cleaned
3. rows moved to `duplicate`
4. rows moved to `archived_duplicate`
5. ambiguous items left unresolved
6. path to the cleanup report

## Required report
Write a report to a session data path with:
- duplicate item ID
- canonical item ID
- final status
- reason

## Safety rules
- Never delete rows
- Never overwrite history
- Never change the canonical item's implementation status unless clearly required
- Never leave confirmed duplicates as active queue items
- If scope is ambiguous, leave it unresolved and report it instead of forcing a collapse

## Done condition
The cleanup is only complete when:
- duplicate statuses are actually written into `work_ledger.json`
- canonical links exist
- notes exist
- post-check proves duplicates are no longer active queue items
