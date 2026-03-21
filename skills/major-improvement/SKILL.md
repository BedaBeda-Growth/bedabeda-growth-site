---
name: "Major Improvement"
icon: "🏗️"
description: "Turn big org-wide improvement ideas into versioned plan artifacts, persistent rules, and red/yellow/green enforcement entries. Mandatory prior-context discovery. No loss of iteration history."
alwaysAllow:
  - Bash
  - Read
  - Grep
ruleDomains:
  - ops
---

# 🏗️ Major Improvement

Use this skill whenever Nick says:
- "this is a major improvement"
- "let's formalize this initiative"
- "build this properly — plans, rules, enforcement"
- "make this stick"
- "this keeps breaking — turn it into a permanent system"
- "this is too important to manage ad hoc"

---

## Core Purpose

This skill converts a significant improvement idea into:
1. A **versioned plan artifact** — so the initiative has history and memory
2. A **canonical rule entry** — so the standard is durable and machine-readable
3. A **red/yellow/green enforcement definition** — so the system can tell when it's winning or losing

Every run must satisfy all three outputs. A run that stops at a plan is incomplete. A rule without enforcement criteria is incomplete.

---

## Step 0 — Prior Context Discovery (MANDATORY FIRST STEP)

Before proposing, proposing any plan, or creating any file:

### 0.1 — Normalize the initiative slug
Convert the initiative name to a stable reusable slug:
- lowercase
- hyphens only (no spaces, no underscores)
- domain-prefixed when relevant (e.g. `payments-checkout-health`, `email-signal-adapters`, `health-board-freshness`)
- max 5 words

**Example:** "Health Board Freshness SLAs" → `health-board-freshness`

### 0.2 — Search for existing plan versions
```bash
ls /Users/nicholaspetros/scceo-1/plans/ | grep -i "major-improvement-SLUG"
ls /Users/nicholaspetros/scceo-1/plans/ | grep -i "SLUG"
find /Users/nicholaspetros/scceo-1/plans/ -name "*SLUG*" -type f
find /Users/nicholaspetros/scceo-1/plans/ -name "*SLUG*" -type d
```

### 0.3 — Search for existing rule entries in the central registry
```bash
find /Users/nicholaspetros/scceo-1/rule-registry/ -name "*SLUG*"
grep -r "SLUG" /Users/nicholaspetros/scceo-1/rule-registry/ 2>/dev/null
```

### 0.4 — Search for enforcement files
```bash
find /Users/nicholaspetros/scceo-1/plans/ -name "*SLUG*enforcement*"
find /Users/nicholaspetros/scceo-1/plans/ -name "*SLUG*rules*"
```

### 0.5 — Check the Red Light / Green Light plan for references
```bash
grep -i "SLUG" /Users/nicholaspetros/scceo-1/plans/red-light-green-light-plan-v3.md
```

### 0.6 — Check the rules ledger for related rules
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT rule_key, name, domain FROM rule_ledger.rules
WHERE rule_key LIKE '%RELATED_TERM%' OR name LIKE '%RELATED_TERM%';
```

### 0.7 — Report prior context before taking any action

**You MUST report:**
- Prior plan versions found (list paths and version numbers)
- Prior rule entries found (list slugs and file paths)
- Prior enforcement files found
- Related Rule Ledger rules found
- Summary of what the prior context tells us

**Only after reporting may you propose an action.**

---

## Step 1 — Decision: Update vs New Version

After prior context discovery:

### If no prior version exists:
→ Create `major-improvement-SLUG-v1.md` in `/Users/nicholaspetros/scceo-1/plans/`

### If prior version(s) exist (v1 through v4):
→ Create the next version: `major-improvement-SLUG-vN.md`
→ **Never overwrite or modify** the existing version

### If v5+ exists:
→ The initiative is mature. Use the folder structure.
→ Create `/Users/nicholaspetros/scceo-1/plans/major-improvement-SLUG/vN.md`
→ The folder must also contain `index.md`, `rules.md`, `enforcement.md`, `decision-log.md`

### What changed?
Every new version must include a **"What Changed"** section at the top explaining what differs from the prior version.

---

## Step 2 — Write the Plan Version

Use the plan template from:
`/Users/nicholaspetros/scceo-1/skills/major-improvement/templates/plan-version.md`

Required sections:
- Initiative metadata (slug, version, date, owner)
- Prior context summary (what versions came before, what they decided)
- What changed from the prior version
- Problem statement (what is broken / stale / missing)
- Proposed standard (what good looks like)
- Scope (what is in / out of scope)
- Implementation phases
- Open decisions
- Success criteria

---

## Step 3 — Write or Update the Rules File

Use the rules template from:
`/Users/nicholaspetros/scceo-1/skills/major-improvement/templates/rules.md`

This file lives at:
- **Early (v1–v4):** `major-improvement-SLUG-rules.md` in `/Users/nicholaspetros/scceo-1/plans/`
- **Mature (v5+):** `rules.md` inside `/Users/nicholaspetros/scceo-1/plans/major-improvement-SLUG/`

Rules file must include:
- Initiative slug
- Version of rules
- Required behaviors (what must always happen)
- Disallowed behaviors (what must never happen)
- Standards (quantified thresholds where possible)
- Verification method (how to confirm compliance)

---

## Step 4 — Write or Update the Enforcement File

Use the enforcement template from:
`/Users/nicholaspetros/scceo-1/skills/major-improvement/templates/enforcement.md`

This file lives at:
- **Early (v1–v4):** `major-improvement-SLUG-enforcement.md` in `/Users/nicholaspetros/scceo-1/plans/`
- **Mature (v5+):** `enforcement.md` inside `/Users/nicholaspetros/scceo-1/plans/major-improvement-SLUG/`

Enforcement file must define for each monitored condition:
- **Green** criteria (what proves it's healthy and current)
- **Yellow** criteria (degraded, stale, or low-confidence — watch state)
- **Red** criteria (broken or needing immediate intervention)
- **Immediate red** criteria (zero-tolerance conditions that skip yellow)
- Verification method (scheduled check, manual, rule evaluator, synthetic probe)
- Escalation trigger (what fires when red persists)
- Freshness SLA (if signal-dependent: max age before downgrade)

---

## Step 5 — Write or Update the Central Rule Registry Entry

Every major improvement **must** write or update a canonical entry in the central rule registry.

Registry location: `/Users/nicholaspetros/scceo-1/rule-registry/`

Entry file: `/Users/nicholaspetros/scceo-1/rule-registry/SLUG.md`

Use the registry template from:
`/Users/nicholaspetros/scceo-1/skills/major-improvement/templates/registry-entry.md`

Required fields:
- `initiative_slug`
- `status` (active / monitoring / resolved / paused)
- `intent` (one sentence — why this initiative exists)
- `standard` (what good looks like — the bar we're holding)
- `required_behaviors` (list)
- `disallowed_behaviors` (list)
- `green_criteria` (list)
- `yellow_criteria` (list)
- `red_criteria` (list)
- `verification_method`
- `escalation_trigger`
- `source_plans` (list of plan file paths)
- `latest_version`
- `last_updated`
- `rule_ledger_keys` (list of related Supabase `rule_ledger.rules` rule_keys, if any)

---

## Naming Reference

### Early initiatives (v1–v4): Flat files in `/plans/`
```
major-improvement-SLUG-v1.md
major-improvement-SLUG-v2.md
major-improvement-SLUG-rules.md
major-improvement-SLUG-enforcement.md
```

### Mature initiatives (v5+): Folder structure
```
plans/major-improvement-SLUG/
  index.md              ← summary and cross-links
  v1.md                 ← preserved
  v2.md                 ← preserved
  ...
  vN.md                 ← latest
  rules.md              ← current rules
  enforcement.md        ← current enforcement
  decision-log.md       ← key decisions and rationale
```

### Central rule registry
```
rule-registry/
  SLUG.md               ← canonical entry
  index.md              ← all active initiatives
```

---

## Required Output Contract

Every run of `major-improvement` must report in this exact order:

```
MAJOR IMPROVEMENT — [INITIATIVE NAME] — [DATE]

Initiative slug: [slug]
Version: [v1 / v2 / vN]

### Prior Context Found
- Prior plans: [list paths or "none"]
- Prior rule entries: [list paths or "none"]
- Prior enforcement files: [list paths or "none"]
- Related Rule Ledger rules: [list rule_keys or "none"]
- Summary: [what prior context tells us — 2–5 sentences]

### Action Taken
- Plan action: [created vN / updated vN / folderized]
- Rule action: [created / updated]
- Enforcement action: [created / updated]
- Registry action: [created / updated SLUG.md]

### Red/Yellow/Green Summary
[Table or list of current green / yellow / red definitions from enforcement file]

### What Future Work Must Comply With
[The standard planted by this improvement — concise, actionable]
```

---

## Guardrails (Hard Rules)

These are non-negotiable behaviors:

1. **Never start fresh if relevant context exists.**
   If a prior version is found, start from it. Do not ignore it.

2. **Never overwrite a substantive prior version.**
   Create `vN+1`. Preserve `vN`.

3. **Never stop at a plan without rule output.**
   A plan without rules means the standard is still informal. That's not good enough.

4. **Never stop at rules without enforcement criteria.**
   Rules without green/yellow/red definitions are unverifiable. That's not good enough.

5. **Treat repeated failures as preservation failures unless proven otherwise.**
   If the same problem recurs, assume the prior system failed to stick — and say why.

6. **Do not add a second source of truth.**
   The Rule Ledger (Supabase `rule_ledger.rules`) remains the enforcement engine.
   The registry at `rule-registry/` is documentation and discovery — not a parallel engine.

7. **Always cross-link.**
   Plan files must reference enforcement files.
   Registry entries must reference plan files.
   Enforcement files must reference registry entries.

---

## Integration with Red/Green v3

This skill operates inside the existing operating system.

- **Green/Yellow/Red definitions created here feed the Health Board.**
  When a major improvement defines freshness SLAs or signal criteria, those thresholds become the input to health board evaluation for the relevant pillar.

- **Rules created here belong in Supabase `rule_ledger.rules`.**
  Use the `add-rule` skill to add any machine-evaluable rule from an improvement into the Rule Ledger. Then run `distribute_rules.py` to push everywhere.

- **Persistent reds from improvements feed megafix.**
  If an enforcement definition stays red for 3+ days, create/update a megafix plan at `plans/megafix/{slug}/PLAN.md`.

- **This skill is how improvements become institutional memory.**
  The registry entry at `rule-registry/SLUG.md` is the durable version of the lesson. It survives session resets, agent changes, and org turnover.

---

## Priority Heuristics

When multiple versions of an initiative exist, prefer:
1. Initiatives that are red today
2. Initiatives with no enforcement file
3. Initiatives with rules in `simulate` that have earned promotion
4. Initiatives whose freshness SLA has never been defined
5. Initiatives referenced in megafix plans as unresolved

---

## Special Lens

Ask on every run:
- What stops this improvement from silently becoming stale?
- If Nick vanished for 30 days, would this standard survive?
- Is the verification method automatable, or does it require human judgment every time?
- What exact condition would make a future agent say "this improved initiative is now red"?
- Is there already a Rule Ledger rule that overlaps with this? Should we merge or extend?
