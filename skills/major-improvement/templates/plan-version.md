# Major Improvement Plan — {INITIATIVE_NAME} — v{N}

_Initiative slug:_ `{SLUG}`
_Version:_ v{N}
_Date:_ {DATE}
_Owner:_ {OWNER}
_Prior versions:_ {LIST_PRIOR_VERSIONS or "none — this is v1"}
_Status:_ draft | active | superseded

---

## What Changed from v{N-1}

> _(Required for v2+. Delete this section for v1.)_

- {WHAT_CHANGED_1}
- {WHAT_CHANGED_2}

**Why this version was needed:** {WHY_WE_VERSIONED}

---

## Prior Context Summary

> _(Required for v2+. For v1, write "No prior versions. This is the first iteration.")_

**Prior plans found:** {LIST_PRIOR_PLANS}
**Prior rules found:** {LIST_PRIOR_RULE_ENTRIES}
**What prior versions decided:** {SUMMARY_OF_PRIOR_DECISIONS}
**What they got right:** {WHAT_HELD_UP}
**What failed or became stale:** {WHAT_DIDNT_HOLD}

---

## Problem Statement

What is broken, stale, fragile, or unknowingly dangerous right now?

{PROBLEM_STATEMENT}

**Why this matters now:**
{URGENCY}

**What happens if we don't fix this:**
{CONSEQUENCE_OF_INACTION}

---

## Proposed Standard

What does good look like when this initiative is working correctly?

{PROPOSED_STANDARD}

### Measurable bar
- {METRIC_1}: {THRESHOLD_1}
- {METRIC_2}: {THRESHOLD_2}
- {METRIC_3}: {THRESHOLD_3}

---

## Scope

### In scope
- {IN_SCOPE_1}
- {IN_SCOPE_2}

### Out of scope
- {OUT_OF_SCOPE_1}
- {OUT_OF_SCOPE_2}

### Explicitly not building
- {NOT_BUILDING_1}

---

## Implementation Phases

### Phase 1 — {PHASE_1_NAME}
**Goal:** {PHASE_1_GOAL}
**Files to touch:** {PHASE_1_FILES}
**Done when:** {PHASE_1_DONE}

### Phase 2 — {PHASE_2_NAME}
**Goal:** {PHASE_2_GOAL}
**Files to touch:** {PHASE_2_FILES}
**Done when:** {PHASE_2_DONE}

### Phase 3 — {PHASE_3_NAME}
**Goal:** {PHASE_3_GOAL}
**Done when:** {PHASE_3_DONE}

---

## Rule Ledger Integration

Rules to add or update in `Supabase rule_ledger.rules`:

| rule_key | action | domain | trigger | notes |
|---|---|---|---|---|
| `{RULE_KEY}` | add / update | {DOMAIN} | {TRIGGER} | {NOTES} |

Use the `add-rule` skill to insert each rule.
All new rules start in `simulate`. Promote only after 50+ hits with 0 recurrences.

---

## Health Board Integration

This initiative affects the following health pillars:

| Pillar | Lens | Contributing signal | Effect |
|---|---|---|---|
| {PILLAR} | functional / human | {SIGNAL} | {EFFECT_ON_LIGHT} |

---

## Open Decisions

| # | Decision | Options | Blocking? |
|---|---|---|---|
| 1 | {DECISION_1} | {OPTIONS_1} | yes / no |
| 2 | {DECISION_2} | {OPTIONS_2} | yes / no |

---

## Success Criteria

We're done with this version when:

- [ ] {CRITERION_1}
- [ ] {CRITERION_2}
- [ ] {CRITERION_3}
- [ ] Red/yellow/green enforcement file exists and is current
- [ ] Central rule registry entry exists at `rule-registry/{SLUG}.md`
- [ ] Future work can discover this standard without asking

---

## Cross-links

- Enforcement file: `plans/major-improvement-{SLUG}-enforcement.md` (or `plans/major-improvement-{SLUG}/enforcement.md` if v5+)
- Rules file: `plans/major-improvement-{SLUG}-rules.md` (or `plans/major-improvement-{SLUG}/rules.md` if v5+)
- Registry entry: `rule-registry/{SLUG}.md`
- Related megafix: `plans/megafix/{SLUG}/PLAN.md` _(if exists)_
- Red/Green v3 plan: `plans/red-light-green-light-plan-v3.md`
