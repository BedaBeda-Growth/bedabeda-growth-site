---
name: schedule-work
description: Break a plan file from the plans/ folder into logical, bite-sized Jules job tasks and add each task to the work ledger, categorized for the correct repo. Use when Nick says "shatter this plan", "break this plan into Jules tasks", "split this plan into ledger items", "create Jules jobs from this plan", or when a large plan in plans/ needs to be decomposed into dispatchable work-ledger items. LLM justified — task boundary identification, repo categorization, scope sizing, and done-criteria writing require judgment that a script cannot provide.
ruleDomains:
  - ops
---

# schedule-work

Decompose a plan file in `plans/` into logical Jules-sized tasks and register each in the work ledger.

## North Star

Advances **NSO-04 — Kai Runs the Machine** and **NSO-06 — Zero Human Barriers Mid-Execution**.
Each shattered task becomes a directly dispatchable Jules job without Nick having to manually slice plans.

## Core Workflow

### Step 1 — Read the Plan

Load the plan file. It lives in `/Users/nicholaspetros/scceo-1/plans/`.

```bash
head -80 /Users/nicholaspetros/scceo-1/plans/<plan-file>.md
```

Identify:
- **Source repo** — from the plan name prefix (`rocket-`, `scceo-`, `spark-kanban-`, `rv-`, `app-`) or an explicit `**Repo:** ...` field inside the plan
- **Plan title** — the H1 heading or `# Plan: ...` line
- **Plan type** — feature build, bug fix, cleanup, infrastructure, ops, content
- **Phases / steps** — numbered sections, H2 headings, or discrete bullet clusters

Confirm the target repo before proceeding. If ambiguous, ask Nick.

### Step 2 — Shard into Tasks

Run the helper script to extract task candidates:

```bash
python3 /Users/nicholaspetros/scceo-1/.agents/skills/schedule-work/scripts/shatter_plan.py \
  /Users/nicholaspetros/scceo-1/plans/<plan-file>.md
```

The script outputs a draft JSON array of candidate tasks. Review and refine:
- **Merge** tasks that are too atomic to stand alone (< ~30 min Jules work)
- **Split** steps that are too large for a single Jules session (> ~4 hours Jules work or spanning multiple unrelated concerns)
- **Keep** each task scoped to one coherent deliverable with verifiable output

**Target task size:** Each task should be completeable by Jules in one session (1–3 hours of cloud coding).

### Step 3 — Write Acceptance Criteria for Each Task

For each sharded task, write:
- `done_criteria.business_goal` — one sentence: what is done when this task is complete?
- `done_criteria.evidence_required` — list of concrete proofs: test output, PR link, migration applied, etc.
- Acceptance criteria checklist (for Jules prompt use)

Use the plan's existing success criteria / step verification where available. Do not invent goals not in the plan.

### Step 4 — Add Each Task to the Work Ledger

**ID convention for shattered items:**
```
AUTO-{YYYYMMDD}-{repo}-{short-slug}
```
Example: `AUTO-20260321-rocket-checkout-dual-stack-phase1`

Write each JSON item into the ledger at:
`/Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json`

See `add-to-ledger` skill for full ledger item shape. Required fields per item:
- `id`, `title`, `owner: "kai"`, `repo`, `status: "planned"`, `priority`, `blast_radius`, `verified: false`
- `item_type`, `impact_tie`, `notes`, `done_criteria`, `created_at`, `updated_at`
- `links.plan_source` — path to the originating plan file

### Step 5 — Generate Jules Task Files (Optional)

```bash
python3 /Users/nicholaspetros/scceo-1/.agents/skills/schedule-work/scripts/shatter_plan.py \
  /Users/nicholaspetros/scceo-1/plans/<plan-file>.md \
  --generate-task-files \
  --output-dir /Users/nicholaspetros/scceo-1/plans/
```

### Step 6 — Confirm and Report

- Number of tasks created
- Their ledger IDs
- Their task file paths (if generated)
- Suggested dispatch order (dependencies first)

## Repo Identification Cheat Sheet

| Plan prefix / keyword | Repo slug |
|----------------------|-----------|
| `rocket-`, `scceo-rocket` | `rocket` |
| `scceo-`, `platform-` | `scceo` |
| `spark-kanban-` | `spark-kanban` |
| `rv-`, `renovio-` | `rv` |
| `app-`, `freely-` | `app` |
| `grok-personal`, `kai-agent` | `scceo` |
| `finance-`, `ap-` | `scceo` |

When the plan spans multiple repos, create separate ledger items per repo.

## Task Size Guidelines

| Jules task size | Signs |
|----------------|-------|
| Good (1-3h) | One PR, one feature/fix, clear AC, test command available |
| Too small | Single file rename, one-liner fix — merge with adjacent task |
| Too large | Multiple unrelated subsystems, >5 distinct AC items — split further |

## Rules This Skill Enforces

- `ops-work-must-be-tracked` — every shattered task gets a ledger item before dispatch
- `ops-done-means-verified-everywhere` — done_criteria must specify evidence, not just intent
- `ops-no-human-mid-execution` — Jules task files must be self-contained so Jules never needs to ask
