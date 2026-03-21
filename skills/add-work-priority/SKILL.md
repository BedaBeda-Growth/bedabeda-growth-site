---
name: add-work-priority
description: Add a new item to the work ledger (work_ledger.json) with all required and recommended fields correctly populated. Use when the user says add priority, add to work ledger, log this to the ledger, create a ledger item, add work item, or any equivalent. Guides Kai through gathering title, owner, impact_tie, repo, item_type, priority, blast_radius, done_criteria, and more — then writes via scripts/add_ledger_item.py. LLM justified — priority, blast_radius, done_criteria, and objective alignment all require judgment that a script cannot provide.
ruleDomains:
  - ops
---

# Add Work Priority

## Step 0 — Objectives Check (MANDATORY)

Call `check_objectives()` via kai-brain before doing anything else. Ask:
- Does this item advance a current Top 10 objective? Which one?
- Is there already a ledger item for this? If so, update it instead.
- Is a simpler path available (e.g. adding a note to an existing item)?

## Step 1 — Gather Required Fields

Collect or infer from context. Ask only if missing and cannot be inferred:

| Field | Required | Notes |
|-------|----------|-------|
| `title` | ✅ | Imperative: "Fix X" / "Build Y" / "Audit Z" |
| `owner` | ✅ | `kai`, `nick`, or team member handle |
| `impact_tie` | ✅ | `revenue`, `retention`, `growth`, `leverage`, `infrastructure`, `awareness` |
| `repo` | ✅ | `rocket`, `app`, `spark-kanban`, `rv`, `scceo` (default: `scceo`) |

## Step 2 — Gather Key Optional Fields (use judgment)

Infer from context; ask only when genuinely ambiguous:

| Field | Default | Guidance |
|-------|---------|----------|
| `item_type` | `engineering` | `engineering`, `business`, `ops`, `content`, `team` |
| `priority` | `2` | 0=critical/today, 1=this week, 2=next sprint, 3=backlog, 4=someday, 5=nice-to-have |
| `blast_radius` | `0` | 0–5: users/flows broken if this goes wrong. Revenue gate → 4+ |
| `confidence_tier` | `2` | 1=high confidence in approach, 2=medium, 3=exploratory |
| `is_gate` | `false` | `true` only if revenue leaks until this is fixed |
| `estimate` | `""` | Human-readable: `"2h"`, `"3d"`, `"1 sprint"` |
| `verifier` | `null` | `ember`, `kai`, or `nick` — who signs off on done |

## Step 3 — Build done_criteria

**Critical gate on handoff quality.** Every item must have:

```json
{
  "business_goal": "One-sentence statement of success from user perspective.",
  "evidence_required": ["AI-verifiable check 1", "AI-verifiable check 2"],
  "objective_ids": ["obj-N"],
  "objective_note": "How this advances that objective.",
  "post_merge_guard": "What to monitor after deploy (or empty string).",
  "submission_checks": [],
  "validated_test_data": [],
  "objective_verification": []
}
```

**Hard rule:** Every entry in `evidence_required` must be AI-verifiable (tool call, URL check, API response, DB query). Never "Nick confirms X".

## Step 4 — Generate ID

Format: `AUTO-YYYYMMDD-<kebab-slug>` where slug = 3–5 word kebab-case summary.

Example: "Fix email validation on signup" → `AUTO-20260316-fix-email-validation-signup`

## Step 5 — Run the Script

Assemble the full item dict, then run:

```bash
python3 ~/.agents/skills/add-work-priority/scripts/add_ledger_item.py '<json_string>'
```

Minimum required JSON:
```json
{
  "id": "AUTO-20260316-example-slug",
  "title": "Item title here",
  "owner": "kai",
  "impact_tie": "revenue",
  "repo": "rocket",
  "item_type": "engineering",
  "priority": 1,
  "blast_radius": 2,
  "confidence_tier": 2,
  "is_gate": false,
  "estimate": "1d",
  "done_criteria": {
    "business_goal": "...",
    "evidence_required": ["..."],
    "objective_ids": [],
    "objective_note": "",
    "post_merge_guard": "",
    "submission_checks": [],
    "validated_test_data": [],
    "objective_verification": []
  }
}
```

## Step 6 — Confirm

After the script succeeds, output a summary:

```
✅ Ledger item added
  ID:           AUTO-20260316-example-slug
  Title:        Item title here
  Owner:        kai | Repo: rocket
  Priority:     1 (this week) | Blast: 2 | Gate: No
  Impact tie:   revenue
  Business goal: <done_criteria.business_goal>
```

## Field Reference

See `references/schema.md` for full enum lists, field types, and valid values.
