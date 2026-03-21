---
name: "Wave Dispatch"
description: "Companion to daily-plan v2 — execute dispatches, track Jules session completions, collect metrics, run EOD rollup, and prompt rule generation from resolved reds."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
  - deploy
---

# Wave Dispatch — Execution + Metrics Companion

> **daily-plan builds the waves. This skill runs them.** Use this for mid-day dispatch, checking completion status, collecting metrics, and running the EOD rollup.

## Trigger Phrases
- "dispatch", "dispatch all", "dispatch A", "dispatch B", "dispatch C"
- "wave status", "what's running", "check dispatches"
- "EOD metrics", "run metrics", "daily rollup"
- "what's the resolution rate", "how's Jules doing"

## Prerequisites

- `~/Desktop/Rocket/day-plan.json` must exist (written by `daily-plan` skill)
- Jules CLI authenticated (`jules remote list --repo` succeeds)
- Work ledger accessible via `check_work_ledger()`

---

## Mode 1: Dispatch Waves

When Nick says "dispatch all" / "dispatch A" / "dispatch B" / "dispatch C":

### Step 1: Read Today's Plan

```bash
cat ~/Desktop/Rocket/day-plan.json
```

Parse the waves and identify items with `plan_status: "dispatch_ready"` that haven't been dispatched yet (`dispatched: false`).

### Step 2: Pre-Dispatch Gate

Before any dispatch:

```
check_rule_hits(domain="deploy", last_n=5)
```

If any `high` or `critical` severity hits → surface to Nick before proceeding.

### Step 3: Execute Dispatch (Wave-Ordered)

For each `dispatch_ready` item in the requested wave(s):

1. **Verify plan exists in repo:**
   ```bash
   test -f {REPO_PATH}/plans/{item_id}.md && echo "plan exists"
   ```
   If missing, copy from `scceo-1/plans/`:
   ```bash
   cp /Users/nicholaspetros/scceo-1/plans/{slug}.md {REPO_PATH}/plans/{item_id}.md
   ```

2. **Send to Jules:**
   ```bash
   jules remote new \
     --repo <owner/repo> \
     --session "Implement item <item-id> using plans/<item-id>.md as source of truth. Follow acceptance criteria + verification commands exactly. Commit in small steps and open PR with verification evidence."
   ```

3. **Capture session ID** and update day-plan.json:
   ```json
   { "dispatched": true, "jules_session_id": "...", "dispatched_at": "ISO-8601" }
   ```

4. **Update work ledger:**
   ```
   update_work_ledger(item_id, "update_status", "dispatched")
   update_work_ledger(item_id, "add_note", "[wave-dispatch] Jules session {session_id}. Wave {A|B|C}.")
   ```

5. **Debit budget.** Alert at 250 (soft warning), hard stop at 280.

### Step 4: Dispatch Summary

After all dispatches complete:

```
## Dispatch Complete — [time]

| Wave | Sent | Skipped | Budget Used |
|------|------|---------|-------------|
| A    | {N}  | {N}     | {N} tokens  |
| B    | {N}  | {N}     | {N} tokens  |
| C    | {N}  | {N}     | {N} tokens  |

Jules budget: {used}/{300} ({remaining} remaining)

Skipped items: {list with reasons}
```

---

## Mode 2: Check Status

When Nick asks "what's running" / "wave status" / "check dispatches":

### Step 1: Read Current Plan + Jules Status

```bash
cat ~/Desktop/Rocket/day-plan.json
```

For each dispatched item, check Jules session status:
```bash
jules remote status --session {session_id}
```

### Step 2: Present Status

```
## Wave Status — [time]

### Wave A
| Item | Jules Status | PR | Notes |
|------|-------------|-----|-------|
| {title} | running | — | Started {time} ago |
| {title} | completed | PR #{N} | Ready for review |
| {title} | failed | — | {error summary} |

### Wave B
{same format}

### Wave C
{same format}

Completed: {N}/{total} | Running: {N} | Failed: {N}
```

### Step 3: Handle Failures

For failed items:
1. Read the Jules session log: `jules remote log --session {session_id}`
2. Assess: Is the plan bad, or did the agent hit an edge case?
3. If plan quality issue → note for waste rate metric, suggest plan revision
4. If transient failure → offer to re-dispatch

---

## Mode 3: EOD Metrics Rollup

When Nick says "EOD metrics" / "run metrics" / at end of day:

### Step 1: Collect Completion Data

For each dispatched item in today's plan:
1. Check Jules session final status
2. Check if PR was merged / rejected / no output
3. Check work ledger status (did it reach `verified`?)

### Step 2: Compute Metrics

**Metric 1 — Same-Day Red Resolution Rate:**
```
dispatched_from_reds = count(Wave A items where source = health_red)
resolved_same_day = count(those items where status in [verified, resolved] today)
rate = resolved_same_day / dispatched_from_reds
```

**Metric 2 — Wave A Health-Source Ratio:**
```
from_health_board = count(Wave A items where source = health_red)
from_revenue_gates = count(Wave A items where source = revenue_gate)
from_nick_manual = count(Wave A items where source in [nick_manual, strike_list])
health_pct = (from_health_board + from_revenue_gates) / total_wave_a
```

**Metric 3 — Plan Reuse Ratio:**
```
matched_existing = count(all dispatched where plan_source = matched_existing)
new_plan_created = count(all dispatched where plan_source = new_plan)
reuse_rate = matched_existing / total_dispatched
```

**Metric 4 — Jules Utilization & Waste:**
```
utilization_pct = tokens_used / 300
failed_merges = count(sessions with merge conflict or rejected PR)
no_output = count(sessions with no commits or empty diff)
waste_rate = (failed_merges + no_output) / total_dispatched
```

**Metric 5 — Rule Candidates:**
```
Read from rule_ledger: count rules created today with source note referencing a wave item
```

### Step 3: Write Metrics File

```bash
mkdir -p ~/Desktop/Rocket/wave-metrics
```

Write to `~/Desktop/Rocket/wave-metrics/YYYY-MM-DD.json`:

```json
{
  "date": "YYYY-MM-DD",
  "generated_at": "ISO-8601",
  "metrics": {
    "wave_a_red_resolution": {
      "dispatched_from_reds": 0,
      "resolved_same_day": 0,
      "rate": 0.00,
      "target": 0.40
    },
    "wave_a_health_source_ratio": {
      "from_health_board": 0,
      "from_nick_manual": 0,
      "from_revenue_gates": 0,
      "total_wave_a": 0,
      "health_pct": 0.00,
      "target": 0.40
    },
    "plan_reuse": {
      "matched_existing": 0,
      "new_plan_created": 0,
      "total_dispatched": 0,
      "reuse_rate": 0.00,
      "target": 0.70
    },
    "jules_utilization": {
      "budget_limit": 300,
      "tokens_used": 0,
      "utilization_pct": 0.00,
      "target_utilization": 0.70,
      "failed_merges": 0,
      "rejected_prs": 0,
      "no_output": 0,
      "waste_rate": 0.00,
      "target_waste": 0.15
    },
    "rule_generation": {
      "week_start": "YYYY-MM-DD",
      "rules_created_from_fixes": 0,
      "rules_promoted_this_week": 0,
      "target_new_per_week": 3,
      "source_items": []
    }
  },
  "waves": {
    "A": { "dispatched": 0, "completed": 0, "failed": 0, "pending": 0 },
    "B": { "dispatched": 0, "completed": 0, "failed": 0, "pending": 0 },
    "C": { "dispatched": 0, "completed": 0, "failed": 0, "pending": 0 }
  }
}
```

### Step 4: Update day-plan.json

Write the computed metrics back into today's `day-plan.json` so morning-boot can read them tomorrow.

### Step 5: Present EOD Summary

```
## EOD Metrics — [date]

### KPI Dashboard
| Metric | Today | Target | Status |
|--------|-------|--------|--------|
| Red resolution | {rate}% | {target}% | {on/off track} |
| Health-source ratio | {pct}% | >40% | {on/off track} |
| Plan reuse | {rate}% | {target}% | {on/off track} |
| Jules utilization | {pct}% | >70% | {on/off track} |
| Jules waste | {pct}% | <{target}% | {on/off track} |
| Rules this week | {N} | {target}/week | {on/off track} |

### Wave Summary
| Wave | Dispatched | Completed | Failed | Pending |
|------|-----------|-----------|--------|---------|
| A    | {N}       | {N}       | {N}    | {N}     |
| B    | {N}       | {N}       | {N}    | {N}     |
| C    | {N}       | {N}       | {N}    | {N}     |

### Insights
- {1-2 sentences on what went well}
- {1-2 sentences on what to improve tomorrow}
```

---

## Mode 4: Rule Generation Loop

After a Wave A health-red item resolves successfully:

1. **Identify the fix class:** What category of failure was this? (email, auth, payment, deploy, etc.)
2. **Prompt Nick:** "This fix resolved {red_item}. Should we create a rule that detects this class of failure automatically?"
3. **If yes:** Draft the rule via `add-rule` skill:
   - `domain`: derived from fix category
   - `status`: `simulate` (always start in simulate)
   - `trigger`: derived from the detection mechanism
   - `action_type`: derived from the fix pattern
   - Note: link back to the source Wave A item ID
4. **Update Metric 5** in day-plan.json

---

## Monday Weekly Rollup

Every Monday, when this skill runs (or when morning-boot detects it's Monday):

1. Read all 7 daily metrics files from the past week
2. Compute 7-day averages for all 5 KPIs
3. Compute week-over-week trend (up/down/flat arrows)
4. Alert if any metric is below target for 3+ consecutive days

Present in morning briefing:

```
### Weekly Wave Metrics (Mon rollup)
| Metric | This Week Avg | Last Week Avg | Trend |
|--------|--------------|---------------|-------|
| Red resolution | {avg}% | {avg}% | {arrow} |
| Health-source | {avg}% | {avg}% | {arrow} |
| Plan reuse | {avg}% | {avg}% | {arrow} |
| Jules util | {avg}% | {avg}% | {arrow} |
| Jules waste | {avg}% | {avg}% | {arrow} |
| Rules created | {N} | {N} | {arrow} |
```

---

## Rules

- **day-plan.json is the source of truth.** This skill reads and writes it.
- **Never dispatch without a pre-dispatch rule gate.** `check_rule_hits()` before every batch.
- **Budget hard stop at 280.** Reserve 20 for ad-hoc. No exceptions.
- **Failed dispatches count as waste.** Track them honestly.
- **Rule generation is not optional.** Every resolved red gets the prompt.
- **Metrics files are append-only per day.** Don't overwrite — update the same file.
- **Weekly rollup runs Monday only.** Don't re-run mid-week.
