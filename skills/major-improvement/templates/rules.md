# Major Improvement Rules — {INITIATIVE_NAME}

_Initiative slug:_ `{SLUG}`
_Rules version:_ v{N}
_Date:_ {DATE}
_Linked plan:_ `plans/major-improvement-{SLUG}-v{N}.md`
_Registry entry:_ `rule-registry/{SLUG}.md`

---

## Intent

One sentence explaining why this set of rules exists:

> {INTENT_ONE_SENTENCE}

---

## Required Behaviors

These must always happen. No exceptions unless a formal override is logged.

1. **{RULE_NAME_1}**
   {RULE_DESCRIPTION_1}
   - Verification: {HOW_TO_VERIFY_1}
   - Frequency: {WHEN_TO_CHECK_1}

2. **{RULE_NAME_2}**
   {RULE_DESCRIPTION_2}
   - Verification: {HOW_TO_VERIFY_2}
   - Frequency: {WHEN_TO_CHECK_2}

3. **{RULE_NAME_3}**
   {RULE_DESCRIPTION_3}
   - Verification: {HOW_TO_VERIFY_3}
   - Frequency: {WHEN_TO_CHECK_3}

---

## Disallowed Behaviors

These must never happen. Each item is a hard stop.

1. **{DISALLOWED_1}**
   Reason: {WHY_DISALLOWED_1}

2. **{DISALLOWED_2}**
   Reason: {WHY_DISALLOWED_2}

3. **{DISALLOWED_3}**
   Reason: {WHY_DISALLOWED_3}

---

## Standards

Quantified thresholds that define compliance:

| Metric | Green threshold | Yellow threshold | Red threshold |
|---|---|---|---|
| {METRIC_1} | {GREEN_1} | {YELLOW_1} | {RED_1} |
| {METRIC_2} | {GREEN_2} | {YELLOW_2} | {RED_2} |
| {METRIC_3} | {GREEN_3} | {YELLOW_3} | {RED_3} |

---

## Freshness SLAs

If this initiative depends on signals that can go stale:

| Signal | Fresh window | Yellow if stale | Red if stale |
|---|---|---|---|
| {SIGNAL_1} | <= {FRESH_MINUTES} min | > {YELLOW_MINUTES} min | > {RED_MINUTES} min |
| {SIGNAL_2} | <= {FRESH_MINUTES} min | > {YELLOW_MINUTES} min | > {RED_MINUTES} min |

**Policy:** A stale check is a degraded check. Stale beyond SLA → automatic downgrade.

---

## Verification Method

How we confirm these rules are being followed:

- **Scheduled check:** {SCHEDULE_DESCRIPTION}
- **Manual check:** {MANUAL_CHECK_DESCRIPTION}
- **Rule Ledger keys involved:** {LIST_RULE_KEYS}
- **Health board connection:** Feeds {PILLAR} / {LENS} light

---

## Rule Ledger Entries

Rules in `Supabase rule_ledger.rules` that enforce this initiative:

| rule_key | domain | severity | autonomy_level | status |
|---|---|---|---|---|
| `{RULE_KEY_1}` | {DOMAIN_1} | {SEVERITY_1} | simulate | active |
| `{RULE_KEY_2}` | {DOMAIN_2} | {SEVERITY_2} | simulate | active |

To add a new rule, use the `add-rule` skill.

---

## Exception Process

If a required behavior needs to be temporarily waived:

1. Log the exception in `Supabase rule_ledger.rules` exceptions table with scope, reason, and expiry
2. Get approval from Nick
3. Exceptions auto-expire — they must be renewed explicitly

---

## Rules Change Log

| Date | Change | Version |
|---|---|---|
| {DATE} | Initial rules creation | v1 |
