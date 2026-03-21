# Work Ledger Item Schema

Full reference for all fields in `work_ledger.json` items.

## Required Fields

| Field | Type | Valid Values | Notes |
|-------|------|-------------|-------|
| `id` | string | `AUTO-YYYYMMDD-kebab-slug` | Auto-generated. Use today's date. |
| `title` | string | Any | Imperative: "Fix X", "Build Y", "Audit Z" |
| `owner` | string | `kai`, `nick`, or team handle | Who is responsible |
| `impact_tie` | string | `revenue`, `retention`, `growth`, `leverage`, `infrastructure`, `awareness` | Primary business impact |

## Core Optional Fields

| Field | Type | Default | Valid Values | Notes |
|-------|------|---------|-------------|-------|
| `repo` | string | `scceo` | `rocket`, `app`, `spark-kanban`, `rv`, `scceo` | Target repo |
| `item_type` | string | `engineering` | `engineering`, `business`, `ops`, `content`, `team` | Work category |
| `priority` | int | `2` | 0–5 | 0=critical/today, 1=this week, 2=next sprint, 3=backlog, 4=someday, 5=nice-to-have |
| `blast_radius` | int | `0` | 0–5 | How many users/flows affected if it fails. Revenue gate → 4+ |
| `confidence_tier` | int | `2` | 1–3 | 1=high (solution clear), 2=medium, 3=low/exploratory |
| `is_gate` | bool | `false` | `true`/`false` | Revenue leaks until this is fixed → `true` |
| `estimate` | string | `""` | `"2h"`, `"3d"`, `"1 sprint"`, etc. | Human-readable time estimate |
| `status` | string | `pending` | `pending`, `in_progress`, `completed`, `failed`, `verified` | Set by update_work_ledger |
| `verifier` | string | `null` | `ember`, `kai`, `nick` | Who verifies done criteria |
| `sos_task_id` | string | `null` | UUID | Link to SOS tasks table if synced |

## done_criteria Object

```json
{
  "business_goal": "string — one-sentence success statement from user perspective",
  "evidence_required": ["string — AI-verifiable check (no 'Nick confirms X')"],
  "objective_ids": ["obj-N"],
  "objective_note": "string — how this advances that objective",
  "post_merge_guard": "string — what to monitor after deploy",
  "submission_checks": [],
  "validated_test_data": [],
  "objective_verification": []
}
```

**Evidence examples (AI-verifiable):**
- ✅ `"GET /api/health returns 200"`
- ✅ `"Supabase query: SELECT COUNT(*) FROM email_validations WHERE validated_at IS NOT NULL > 0"`
- ✅ `"Live URL https://rocketcommunity.app/signup loads without JS errors"`
- ❌ `"Nick confirms it works"` — NOT allowed

## System-Managed Fields (do not set manually)

| Field | Set By | Notes |
|-------|--------|-------|
| `verified` | update_work_ledger | `true` after verification |
| `verified_by` | update_work_ledger | `kai` or `nick` |
| `verified_at` | update_work_ledger | ISO timestamp |
| `verify_result` | update_work_ledger | `approved`, `rejected`, `needs_revision` |
| `feedback_loop` | update_work_ledger | Rejection/correction history |
| `plan_id` | plan pipeline | Linked plan |
| `director_task_id` | director | Linked director queue task |
| `dispatch_method` | director | `heartbeat`, `single-shot`, etc. |
| `dispatched_at` | director | ISO timestamp |
| `completed_at` | director | ISO timestamp |
| `result_summary` | director/agent | Agent output summary |
| `audit_log` | system | Change history |
| `version` | system | Starts at 1 |
| `locked_by` / `locked_at` | system | Optimistic locking |

## Cost Fields (set before dispatch for costly items)

| Field | Type | Notes |
|-------|------|-------|
| `cost_estimate_usd` | float/null | Pre-dispatch estimate |
| `cost_estimate_breakdown` | dict | `{"agents": X, "compute": Y}` |
| `cost_actual_usd` | float/null | Set after completion |
| `cost_variance_pct` | float/null | Actual vs estimate % diff |
| `cost_variance_flag` | bool | Auto-set if variance > threshold |

## ID Generation Examples

| Title | ID |
|-------|----|
| Fix checkout flow on mobile | `AUTO-20260316-fix-checkout-mobile` |
| Audit email boundary compliance | `AUTO-20260316-audit-email-boundary` |
| Add referral credit to signup | `AUTO-20260316-add-referral-credit-signup` |
| Build Hetzner auto-scaler | `AUTO-20260316-build-hetzner-auto-scaler` |
