# Rule Registry — {INITIATIVE_NAME}

_Initiative slug:_ `{SLUG}`
_Status:_ active | monitoring | resolved | paused
_Last updated:_ {DATE}
_Latest plan version:_ v{N}

---

## Quick Summary

**Intent:** {INTENT_ONE_SENTENCE}

**Standard:** {STANDARD_ONE_OR_TWO_SENTENCES}

**Current board state:** 🟢 Green | 🟡 Yellow | 🔴 Red | ❓ Unknown

---

## Required Behaviors

Things that must always happen for this initiative to be compliant:

1. {REQUIRED_1}
2. {REQUIRED_2}
3. {REQUIRED_3}

---

## Disallowed Behaviors

Things that must never happen:

1. {DISALLOWED_1}
2. {DISALLOWED_2}
3. {DISALLOWED_3}

---

## Green / Yellow / Red Criteria

### 🟢 Green
{GREEN_CRITERIA_SUMMARY}

Full detail: see `plans/major-improvement-{SLUG}-enforcement.md`

### 🟡 Yellow
{YELLOW_CRITERIA_SUMMARY}

Yellow means: degraded, stale, low-confidence, or watch-state. Not failing yet, but not trusted as healthy.

### 🔴 Red
{RED_CRITERIA_SUMMARY}

Red means: broken or needing immediate intervention.

### 🔴 Immediate Red (zero-tolerance conditions)
{IMMEDIATE_RED_SUMMARY}

---

## Verification Method

How we check compliance:

- **Method:** {VERIFICATION_METHOD}
- **Frequency:** {CHECK_FREQUENCY}
- **Freshness SLA:** Signals older than {FRESH_WINDOW} are considered stale and downgrade to yellow

---

## Escalation Trigger

What fires when red persists:

{ESCALATION_TRIGGER}

Persistent red (3+ days) → create/update megafix plan at `plans/megafix/{SLUG}/PLAN.md`

---

## Source Plans

| Version | File | Date | Status |
|---|---|---|---|
| v1 | `plans/major-improvement-{SLUG}-v1.md` | {DATE} | active / superseded |
| v2 | `plans/major-improvement-{SLUG}-v2.md` | {DATE} | active / superseded |

---

## Rule Ledger Keys

Rules in `Supabase rule_ledger.rules` that enforce this initiative:

| rule_key | domain | severity | autonomy_level |
|---|---|---|---|
| `{RULE_KEY_1}` | {DOMAIN_1} | {SEV_1} | simulate |
| `{RULE_KEY_2}` | {DOMAIN_2} | {SEV_2} | simulate |

_To query: Use `supabase-mcp-server execute_sql` with project_id `cjgsgowvbynyoceuaona`: `SELECT rule_key, name, autonomy_level FROM rule_ledger.rules WHERE rule_key LIKE '{SLUG}%';`_

---

## Health Board Connection

| Pillar | Lens | How this initiative feeds it |
|---|---|---|
| {PILLAR} | {LENS} | {HOW_IT_CONTRIBUTES} |

---

## History & Decision Log

| Date | Decision | Outcome |
|---|---|---|
| {DATE} | {DECISION_1} | {OUTCOME_1} |

---

## Status Notes

{ANY_ADDITIONAL_CONTEXT_ABOUT_CURRENT_STATE}
