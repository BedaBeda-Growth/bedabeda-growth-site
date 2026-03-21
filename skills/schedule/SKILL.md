---
name: "Schedule (Jules Dispatch)"
description: "Dispatch planned work-ledger items to Jules, mark them active, and hand off tracking to heartbeat PR polling."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
---

# Schedule (Jules Dispatch)

Use this skill when Nick asks to schedule/dispatch a work-ledger item via Jules.

## Inputs

- `item_id` (required, e.g. `pri-123`)
- `repo` (optional override; defaults from ledger item)
- `mode` (`review` default, or `go`)
- `force` (optional, for re-dispatching non-planned items)

## Canonical status mapping

Keep ledger schema stable:

- **in progress** (display) => `dispatched`
- **in review** (display) => `built`
- merged and awaiting human verification => `verification_submitted`

Do **not** invent ad-hoc ledger statuses.

## Dispatch flow (strict)

1. Validate item exists in `grok-personal/data/work_ledger.json`.
2. Validate dispatch eligibility:
   - default: status must be `planned` or `pending`
   - if not, require explicit `force`
3. Dispatch with:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && \
python3 schedule_dispatch.py <item_id> --mode review
```

Optional overrides:

```bash
python3 schedule_dispatch.py <item_id> --repo rocket --mode go --force
```

4. Confirm result JSON includes:
   - `ok: true`
   - `jules_session_id`
   - `status_after: dispatched` (or existing status for force redispatch)
5. Confirm heartbeat status is present in response and note if it was started.

## Metadata requirements

After dispatch, ensure the ledger item contains:

- `links.jules_session_id`
- `links.jules_repo`
- `links.jules_last_seen_status`
- `links.pr_url` (if available)
- `orchestration.run_id` (set to `jules_session_id`)
- `orchestration.workflow_name` (`jules`)
- `orchestration.awaiting_human` (true when mode=review)

and a note like:

- `[schedule] dispatched via Jules session=<id> repo=<org/repo> mode=<mode>`

Prompt must include tracking token:
- `Tracking token: [item:<item_id>]`

## Heartbeat integration expectations

Heartbeat supervisor polls Jules/GitHub every few minutes for items with `links.jules_session_id`:

- PR opens -> status moves to `built`
- PR merges -> status moves to `verification_submitted`
- PR closes unmerged -> status moves to `failed`

Only write ledger updates on real state change (no duplicate note spam).

## Output format

Always return:

1. `Dispatch`
2. `Ledger Update`
3. `Heartbeat Tracking`
4. `Next Action`

## Safety rules

- Never claim dispatched unless `jules_session_id` is captured.
- Never mark `verified` from agent output; verification is Kai/Nick only.
- Prefer `mode=review` unless Nick explicitly requests `go`.
