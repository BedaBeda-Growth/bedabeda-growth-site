# Major Improvement Enforcement — {INITIATIVE_NAME}

_Initiative slug:_ `{SLUG}`
_Enforcement version:_ v{N}
_Date:_ {DATE}
_Linked plan:_ `plans/major-improvement-{SLUG}-v{N}.md`
_Linked rules:_ `plans/major-improvement-{SLUG}-rules.md`
_Registry entry:_ `rule-registry/{SLUG}.md`

---

## Purpose

This file defines when this initiative is winning, degrading, or failing.

All conditions here feed the Health Board. No other definition of "healthy" exists for this initiative.

---

## Health Pillars Affected

| Pillar | Lens | This initiative contributes to |
|---|---|---|
| {PILLAR} | {LENS} | {HOW_IT_CONTRIBUTES} |

---

## Condition Definitions

### Condition: {CONDITION_1_NAME}
**What this measures:** {WHAT_CONDITION_1_MEASURES}

| Status | Criteria |
|---|---|
| 🟢 Green | {GREEN_CRITERIA_1} |
| 🟡 Yellow | {YELLOW_CRITERIA_1} |
| 🔴 Red | {RED_CRITERIA_1} |
| 🔴 Immediate Red | {IMMEDIATE_RED_1 — zero tolerance, no yellow phase} |

**Freshness SLA:**
- Fresh if last check <= {FRESH_MINUTES} minutes old
- Yellow if > {YELLOW_STALE_MINUTES} minutes stale
- Red if > {RED_STALE_MINUTES} minutes stale

**Verification method:** {VERIFICATION_METHOD_1}
**Check frequency:** {CHECK_FREQUENCY_1}
**Escalation trigger:** {ESCALATION_TRIGGER_1}
**Auto-action:** {AUTO_ACTION_1 or "none — requires human judgment"}

---

### Condition: {CONDITION_2_NAME}
**What this measures:** {WHAT_CONDITION_2_MEASURES}

| Status | Criteria |
|---|---|
| 🟢 Green | {GREEN_CRITERIA_2} |
| 🟡 Yellow | {YELLOW_CRITERIA_2} |
| 🔴 Red | {RED_CRITERIA_2} |
| 🔴 Immediate Red | {IMMEDIATE_RED_2} |

**Freshness SLA:**
- Fresh if last check <= {FRESH_MINUTES} minutes old
- Yellow if > {YELLOW_STALE_MINUTES} minutes stale
- Red if > {RED_STALE_MINUTES} minutes stale

**Verification method:** {VERIFICATION_METHOD_2}
**Check frequency:** {CHECK_FREQUENCY_2}
**Escalation trigger:** {ESCALATION_TRIGGER_2}
**Auto-action:** {AUTO_ACTION_2}

---

### Condition: {CONDITION_3_NAME}
**What this measures:** {WHAT_CONDITION_3_MEASURES}

| Status | Criteria |
|---|---|
| 🟢 Green | {GREEN_CRITERIA_3} |
| 🟡 Yellow | {YELLOW_CRITERIA_3} |
| 🔴 Red | {RED_CRITERIA_3} |
| 🔴 Immediate Red | {IMMEDIATE_RED_3} |

**Freshness SLA:** {FRESHNESS_SLA_3}
**Verification method:** {VERIFICATION_METHOD_3}
**Check frequency:** {CHECK_FREQUENCY_3}
**Escalation trigger:** {ESCALATION_TRIGGER_3}
**Auto-action:** {AUTO_ACTION_3}

---

## Combined Board State Logic

| Overall state | Criteria |
|---|---|
| 🟢 Initiative healthy | All conditions green. All signals fresh within SLA. |
| 🟡 Initiative degraded | Any condition yellow. Or any signal stale beyond yellow SLA. Or confidence is low. |
| 🔴 Initiative failed | Any condition red. Or any immediate red triggered. Or stale beyond red SLA with no fresh pass. |

---

## Stale-State Policy

> **A stale check is a degraded check.**

- Any signal stale beyond its yellow SLA → condition downgrades to yellow
- Any signal stale beyond its red SLA → condition downgrades to red immediately
- If rerun fails or signal remains stale → escalate
- If monitoring remains stale repeatedly → Team/Functional absorbs the failure

Staleness is never neutral. It is always a degraded state.

---

## Auto-Action Matrix

For each board state, the next safe action:

| State | Cause | Next safe action | Auto-executable? | Authorization needed? | Evidence that resolves it |
|---|---|---|---|---|---|
| {CONDITION} 🟡 | {CAUSE} | {NEXT_ACTION} | yes / no | yes / no | {RESOLUTION_EVIDENCE} |
| {CONDITION} 🔴 | {CAUSE} | {NEXT_ACTION} | yes / no | yes / no | {RESOLUTION_EVIDENCE} |
| Stale 🟡 | Signal age > {YELLOW_SLA} | Rerun check automatically | yes | no | Fresh pass with green result |
| Stale 🔴 | Signal age > {RED_SLA} | Rerun + escalate | yes (rerun), no (escalate) | yes (escalate) | Fresh pass with green result |

---

## Persistent Red Protocol

If any condition stays red for **3+ consecutive days**:

1. Create or update megafix plan at `plans/megafix/{SLUG}/PLAN.md`
2. Append current evidence and latest check results
3. Track hypothesis status in the megafix plan
4. Generate candidate Rule Ledger rule if a fix pattern becomes durable

---

## Enforcement Change Log

| Date | Change | Version |
|---|---|---|
| {DATE} | Initial enforcement definition | v1 |
