---
name: "Outcome Record"
description: "Record whether a rule intervention worked. Closes the detection→action→outcome loop so rules can prove their value and earn promotion. Uses Supabase Postgres — works from ANY workspace."
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Outcome Record — Close the Loop

Use this skill whenever:
- A rule hit was addressed and you need to record whether the fix worked
- A session ends and rule-triggered incidents were handled
- The morning pipeline detects hits past their recurrence window with no outcome
- Nick says "did that fix work?" or "mark that as resolved"

## Why This Exists

The rule ledger detects problems and takes actions. But without recorded outcomes, the system can never:
1. Prove a rule prevents recurrence
2. Earn autonomy promotion (simulate → auto_guarded → auto_safe)
3. Identify false positives
4. Learn which interventions actually work

**The loop:** Signal → Rule → Hit → Intervention → **Outcome** → Promotion

The outcome step is currently missing everywhere. This skill fills that gap.

## DB Location

**Supabase Postgres** — schema `rule_ledger`, project SOS (`cjgsgowvbynyoceuaona`)

Access via:
- **MCP:** `supabase-mcp-server execute_sql` with `project_id: cjgsgowvbynyoceuaona`
- **Terminal:** `psql "$RULES_DATABASE_URL"`

## Schema — `outcomes` table

| Field | Type | Notes |
|---|---|---|
| `rule_hit_id` | INTEGER | FK to rule_hits.id — the hit this outcome resolves |
| `outcome_type` | TEXT | `resolved`, `recurred`, `suppressed`, `false_positive`, `unknown` |
| `recurrence_window_hours` | INTEGER | How long we waited to check for recurrence |
| `impact_score` | REAL | 0.0–1.0, optional severity/impact rating |
| `auto_detected` | INTEGER | 1 if detected by outcome detector, 0 if manually recorded |
| `details` | TEXT | Free text: what happened, what changed, what was the fix |

## Workflow

### Quick Record (single outcome)

1. **Find the rule hit ID** — show unresolved hits via MCP:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT h.id, h.rule_key, h.hit_at, h.severity, h.notes
FROM rule_ledger.rule_hits h
LEFT JOIN rule_ledger.outcomes o ON o.rule_hit_id = h.id
WHERE o.id IS NULL
ORDER BY h.hit_at DESC LIMIT 10;
```

2. **Record the outcome:**
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
INSERT INTO rule_ledger.outcomes (
  rule_hit_id, outcome_type, recurrence_window_hours,
  impact_score, auto_detected, details
) VALUES (
  {HIT_ID},
  '{resolved|recurred|suppressed|false_positive|unknown}',
  24,
  {0.0-1.0},
  0,
  '{What happened after the intervention}'
);
```

3. **Verify:**
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT o.*, h.rule_key FROM rule_ledger.outcomes o
JOIN rule_ledger.rule_hits h ON h.id = o.rule_hit_id
WHERE o.rule_hit_id = {HIT_ID};
```

### Batch Record (session end sweep)

At session end, sweep all unresolved hits from the last 24h:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT h.id, h.rule_key, h.hit_at, h.severity, h.notes
FROM rule_ledger.rule_hits h
LEFT JOIN rule_ledger.outcomes o ON o.rule_hit_id = h.id
WHERE o.id IS NULL
AND h.hit_at >= NOW() - INTERVAL '24 hours'
ORDER BY h.hit_at DESC;
```

For each unresolved hit, record an outcome using the Quick Record insert above.

### Auto-Detect Outcomes (cron / morning pipeline)

Run the built-in outcome detector:
```bash
cd /Users/nicholaspetros/scceo-1 && python3 -c "
from rules_ledger.evaluator import RuleEvaluator
e = RuleEvaluator()
count = e.run_outcome_detector()
print(f'Outcomes auto-detected: {count}')
"
```

This checks hits past their recurrence window and writes `resolved` or `recurred` automatically.

## Outcome Types

| Type | When to Use |
|---|---|
| `resolved` | The problem was fixed and has not recurred within the window |
| `recurred` | The same trigger fired again within the recurrence window |
| `suppressed` | The hit was valid but the action was intentionally skipped |
| `false_positive` | The rule fired but the trigger was not actually a problem |
| `unknown` | Not enough information to determine — mark and move on |

## Summary Dashboard

To see the current outcome state across all rules via MCP:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT
   r.rule_key,
   COUNT(h.id) as total_hits,
   COUNT(o.id) as total_outcomes,
   SUM(CASE WHEN o.outcome_type = 'resolved' THEN 1 ELSE 0 END) as resolved,
   SUM(CASE WHEN o.outcome_type = 'recurred' THEN 1 ELSE 0 END) as recurred,
   SUM(CASE WHEN o.outcome_type = 'false_positive' THEN 1 ELSE 0 END) as false_pos,
   COUNT(h.id) - COUNT(o.id) as unresolved
 FROM rule_ledger.rules r
 LEFT JOIN rule_ledger.rule_hits h ON h.rule_key = r.rule_key
 LEFT JOIN rule_ledger.outcomes o ON o.rule_hit_id = h.id
 WHERE r.enabled = true
 GROUP BY r.rule_key
 HAVING COUNT(h.id) > 0
 ORDER BY COUNT(h.id) - COUNT(o.id) DESC;
```

## Integration Points

### Work Ledger Sync (session end)
The `work-ledger-sync` skill's SESSION END phase should include a step:
> "Check for unresolved rule hits from this session and record outcomes before completing."

### Morning Pipeline
The morning pipeline should call `evaluator.run_outcome_detector()` to auto-detect recurrences for hits past their window.

### Rule Promotion
After recording outcomes, check if any rules now qualify for promotion:
```bash
cd /Users/nicholaspetros/scceo-1 && python3 -c "
from rules_ledger.evaluator import RuleEvaluator
e = RuleEvaluator()
candidates = e.get_promotion_candidates()
if candidates:
    for c in candidates:
        print(f'  → {c[\"rule_key\"]}: hits={c[\"hits_30d\"]}, success={c[\"success_pct\"]}%')
else:
    print('No rules ready for promotion yet.')
"
```

## Important Rules

- **Python audit at session end** — after recording outcomes, scan: could any intervention step be replaced by a Python script? Log with `python_candidate=true`. Rule: `ops-prefer-python-over-llm`
- **Always record outcomes** — even `unknown` is better than no outcome
- **Never fabricate outcomes** — if you don't know, use `unknown`
- **Batch at session end** — don't let hits accumulate without outcomes
- **Impact score is optional** — skip it if you can't meaningfully score it
- **False positives are valuable** — they help tune `conditions_json`
- **Run auto-detector daily** — it catches recurrences automatically


---

## Variants / Absorbed Modes

### --add
Add a single item to the work ledger without recording a full outcome. Use for quick ledger entries mid-session.
*(absorbed: add-to-ledger)*