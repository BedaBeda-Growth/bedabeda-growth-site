---
name: add-to-ledger
description: Add or update a skill work item in the company work ledger from any repo so the skill can be tracked, dispatched, verified, and updated correctly over time. Use when creating a new skill, reviving an old skill, registering skill work before editing, or when Nick says "add this skill to the ledger", "track this skill", "put this in the work ledger", or "make sure this skill is tracked properly."
ruleDomains:
  - ops
---

# Add to Ledger

Use this skill whenever skill work needs a durable work-ledger record before implementation, update, dispatch, or follow-up.

## Core Rule

A skill is not operationally real until it has a work ledger item.

The ledger is the company system of record for active work. For skill work, the ledger item is what allows planning, dispatch, status updates, verification routing, and later maintenance across repos.

## Works From Any Repo

The work ledger lives centrally at:
- `/Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json`

The canonical skill source of truth lives in Supabase `rule_ledger.skills`, and repos pull skills from there with `sync_skills.py`. Because of that split:
- **Use the work ledger to track the work**
- **Use `rule_ledger.skills` to publish the skill definition**

You do **not** need to be inside `scceo-1` to decide that a skill needs tracking. But when adding the ledger item, update the central work ledger file or central ledger system — not a repo-local note.

## When To Create vs Update

### Create a new ledger item when
- the skill does not yet have a ledger item
- the user is asking for a brand-new skill
- the skill exists but there is no active tracked work item for the requested change
- a dormant skill is being revived with clearly new scope

### Update an existing ledger item when
- the skill already has an active item in `pending`, `planned`, `dispatched`, `built`, or `verification_submitted`
- the request is a continuation of the same scope
- the skill already has plan links, PR links, or notes that match the current request

### Surface to Nick before creating a second item when
- you find multiple ledger items for the same skill
- one item is `failed` and another is active
- the new request could either be follow-up work or a distinct new initiative

Default to **one canonical active ledger item per skill scope**.

## Required Inputs

Before writing anything, determine these fields:
- `skill_slug` — kebab-case slug, e.g. `add-to-ledger`
- `title` — explicit skill-work title
- `repo` — primary repo affected by the work (`scceo`, `rocket`, `rv`, etc.)
- `owner` — usually `kai` unless Nick assigns someone else
- `status` — usually `planned` if this is queued work, `in_progress` only if work is actively underway now
- `priority` — `1`, `2`, or `3`
- `item_type` — usually `ops`-adjacent skill work should be stored as `engineering`
- `impact_tie` — why this skill matters operationally

If any of these are unclear, infer conservatively from the request and note the assumption in `notes`.

## Search Procedure

Always search the ledger before creating anything.

### Method 1 — text search
```bash
grep -n "add-to-ledger\|Add to Ledger" /Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json
```

### Method 2 — JSON scan
```python
import json
from pathlib import Path

ledger = json.loads(Path('/Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json').read_text())
matches = []
for item in ledger['items']:
    haystack = ' '.join([
        str(item.get('id', '')),
        str(item.get('title', '')),
        str(item.get('plan_id', '')),
        str(item.get('repo', '')),
        json.dumps(item.get('links', {})),
        json.dumps(item.get('notes', [])),
    ]).lower()
    if 'add-to-ledger' in haystack or 'add to ledger' in haystack:
        matches.append(item)
print(matches)
```

Search by all of the following when relevant:
- skill slug
- human skill name
- old title variants
- related plan IDs
- linked PRs or docs

## Ledger Item Shape

Follow the live work-ledger structure. A valid item should include at least:
- `id`
- `title`
- `owner`
- `repo`
- `status`
- `priority`
- `blast_radius`
- `verified`
- `notes`
- `links`
- `item_type`
- `created_at`
- `updated_at`

Useful optional fields for skill work:
- `plan_id`
- `result_summary`
- `done_criteria`
- `links.repo_items`
- `links.skill_slug`
- `links.skill_paths`
- `links.supabase_skill_slug`

## Title and ID Conventions

Prefer IDs that are stable and obviously skill-related.

### Recommended ID
```text
AUTO-{YYYYMMDD}-skill-{skill-slug}
```

Example:
```text
AUTO-20260312-skill-add-to-ledger
```

### Recommended title
```text
[SKILL] Add to Ledger — register and maintain skill work in the company work ledger
```

Keep titles explicit enough that another agent can immediately understand the work without opening notes.

## Recommended Default Values for Skill Work

Use these unless the request clearly implies something else:

```json
{
  "owner": "kai",
  "repo": "scceo",
  "status": "planned",
  "priority": 2,
  "blast_radius": 3,
  "verified": false,
  "item_type": "engineering"
}
```

## Creation Workflow

### Step 1 — Normalize the skill identity
Determine the final slug and display name.

If the user says only a title-like phrase, convert it to kebab-case for the slug and use title case for the display name.

### Step 2 — Search for an existing ledger item
Search the central work ledger first.

If an active matching item exists:
- reuse it
- append a note for the new request
- update status only if the work has materially advanced
- do not create a duplicate

### Step 3 — Choose the correct status
Use the one-way work-ledger state machine:
- `pending` — backlog only
- `planned` — selected and defined, ready for implementation
- `dispatched` — handed to another worker/system
- `built` — work artifacts created
- `verification_submitted` — ready for human/Kai verification
- `verified` — verified complete
- `failed` — broken or rejected and needs another pass

For newly registered skill work, prefer `planned`.
Do **not** jump straight to `verified`.

### Step 4 — Write the ledger item
When creating a new item, include the current ISO timestamp in `created_at` and `updated_at`.

Minimum note to add on creation:
```text
[kai] Skill registered for tracking. Scope: create/update the `{skill_slug}` skill so it can be maintained, published, and followed across repos.
```

Also add a note capturing:
- what triggered the registration
- any assumptions about repo or scope
- whether the skill already exists or is brand new

### Step 5 — Link the skill artifacts
When known, attach links/metadata such as:
- `links.skill_slug`
- `links.skill_paths.workspace`
- `links.skill_paths.global`
- `links.supabase_skill_slug`
- plan path
- review path
- PR URL

For a brand-new skill, it is acceptable to create the item before these links exist. Add them later as milestones happen.

### Step 6 — Announce the canonical mapping
After creation or update, state clearly:
- ledger item ID
- skill slug
- current status
- why this item is the canonical tracker for the skill work

## Update Workflow

If the skill already has a ledger item, update it instead of creating a new one.

Typical updates:
- append a note when the scope changes
- set `plan_id` when a plan is created
- add plan/review file paths to `links`
- add skill file paths once the skill exists
- advance status along the allowed path
- set `result_summary` when implementation lands

### Example note updates
```text
[kai] Scope refined — this skill should teach agents how to register skill work in the central work ledger from any repo.
```

```text
[kai] Skill scaffold created at /Users/nicholaspetros/scceo-1/skills/add-to-ledger.
```

```text
[kai] Published to Supabase rule_ledger.skills and ready for repo sync.
```

## Duplicate Prevention Rules

Do not create a new item if any of these are true:
- the same `skill_slug` already appears in an active item title, note, or link
- the current request is an extension of an existing skill build
- the only difference is wording, not scope

If duplicate items already exist:
1. choose the most advanced canonical item
2. append a note documenting the duplicate relationship
3. mark the duplicate `failed` only if Nick explicitly wants cleanup, otherwise surface it

Prefer the status order:
`verified > verification_submitted > built > dispatched > planned > pending > failed`

## Relationship To Other Skills

Use this skill before or alongside:
- `add-skill` — to create a brand-new skill after registration exists
- `update-skill` — to modify a tracked skill without losing continuity
- `work-ledger-sync` — to keep the item fresh during implementation

### Recommended chain for new skill work
1. `add-to-ledger`
2. `add-skill`
3. `work-ledger-sync`
4. publish to `rule_ledger.skills`
5. sync repos with `sync_skills.py`

## Minimal JSON Example

```json
{
  "id": "AUTO-20260312-skill-add-to-ledger",
  "title": "[SKILL] Add to Ledger — register and maintain skill work in the company work ledger",
  "owner": "kai",
  "impact_tie": "Ensure new and updated skills are tracked, dispatchable, and maintainable across repos.",
  "repo": "scceo",
  "status": "planned",
  "priority": 2,
  "blast_radius": 3,
  "confidence_tier": 2,
  "estimate": "30m",
  "is_gate": false,
  "verified": false,
  "verified_by": null,
  "verified_at": null,
  "verifier": null,
  "verify_result": null,
  "plan_id": null,
  "director_task_id": null,
  "dispatch_method": null,
  "dispatched_at": null,
  "completed_at": null,
  "result_summary": null,
  "checkboxes": [],
  "notes": [
    {
      "at": "2026-03-12T19:47:00+00:00",
      "text": "[kai] Skill registered for tracking. Scope: create/update the `add-to-ledger` skill so it can be maintained, published, and followed across repos."
    }
  ],
  "done_criteria": {
    "business_goal": "Skill work is visible and can be followed through planning, implementation, publication, and verification.",
    "objective_ids": [],
    "objective_note": "",
    "post_merge_guard": "Skill is published to the central skill source of truth and synced where needed.",
    "evidence_required": ["SKILL.md path", "Supabase skill row if published"],
    "submission_checks": [],
    "validated_test_data": [],
    "objective_verification": []
  },
  "bypass_test": null,
  "audit_log": [],
  "links": {
    "repo_items": [],
    "skill_slug": "add-to-ledger",
    "skill_paths": {
      "workspace": "/Users/nicholaspetros/scceo-1/skills/add-to-ledger"
    },
    "supabase_skill_slug": "add-to-ledger"
  },
  "feedback_loop": [],
  "cost_estimate_usd": null,
  "cost_estimate_breakdown": {},
  "cost_actual_usd": null,
  "cost_variance_pct": null,
  "cost_variance_flag": false,
  "item_type": "engineering",
  "sos_task_id": null,
  "last_checked": null,
  "created_at": "2026-03-12T19:47:00+00:00",
  "version": 1,
  "locked_by": null,
  "locked_at": null,
  "lock_expires_at": null,
  "updated_at": "2026-03-12T19:47:00+00:00"
}
```

## Completion Criteria

Do not claim this skill was "added to ledger" unless one of these is true:
- an existing canonical item was found and updated, or
- a new canonical ledger item was created successfully

Before finishing, confirm:
- [ ] searched for existing skill-related ledger items
- [ ] avoided duplicates or surfaced them
- [ ] wrote or updated the canonical ledger item
- [ ] captured skill slug and tracking context in notes or links
- [ ] reported the ledger item ID back to Nick

If any box is unchecked, the work is not complete.
