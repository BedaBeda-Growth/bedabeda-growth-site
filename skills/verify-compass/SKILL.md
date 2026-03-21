---
name: "Verify Compass"
description: "Go directly to raw sources — Stripe, Supabase, work ledger, master plan — and confirm that the Compass metrics (revenue pace, signups, build ratio) are showing true, current data."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Grep
ruleDomains:
  - ops
---

# Verify Compass

## Trigger Phrases
- "verify compass", "check compass", "is compass accurate", "compass true", "compass check", "compass data"

## Purpose

Compass is the strategic direction layer — the 4 metrics that tell Nick whether we are on track for $30K by Mar 27:

1. **Revenue pace** — $ collected today/this week vs $1,000/day target
2. **Signup trend** — new registrations (daily, 7-day avg)
3. **Build ratio** — % of time on revenue-driving work vs maintenance (target ≥ 70%)
4. **Plan trajectory** — cumulative vs expected pacing on Master Plan

This skill goes to the **raw sources**, not the cached briefing file, and reports whether what the morning compass shows is accurate.

---

## Core Rule

**Never trust the briefing file alone.** Always cross-reference against at least one live source per metric. If a number can't be verified live, say "unverified" — never guess or carry forward a stale value.

---

## Step 1: Read the Compass Baseline

Read the current morning briefing to know what Compass *claims*:

```bash
cat ~/Desktop/Rocket/Kai\ Morning\ Briefing.md | grep -A 20 "Compass\|Revenue\|Signup\|Build ratio\|Trajectory\|pace"
```

Also read the Master Plan target:

```bash
cat ~/Desktop/Rocket/Master\ Plan.md | head -60
```

---

## Step 2: Pull Live Revenue (Stripe)

Get today's actual Stripe revenue directly from the morning pipeline data or live API:

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/kai_morning.py --pull-only 2>/dev/null | grep -i "revenue\|stripe\|total\|collected"
```

Fallback — read the most recent digest file for Stripe totals:

```bash
ls -t ~/Desktop/Rocket/Morning\ Digest\ -\ *.md 2>/dev/null | head -1 | xargs grep -i "stripe\|revenue\|collected\|today"
```

**Target to check against:** $1,000/day ($30K ÷ 30 days). Report:
- Actual $ today (or MTD if intraday not available)
- On pace? YES / NO / BEHIND
- Days remaining on the $30K clock (deadline: Mar 27, 2026)

---

## Step 3: Pull Live Signups (Supabase)

Get fresh signup count from Rocket Supabase (`bagzchmynxxyhnkifzwe`):

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/kai_morning.py --pull-only 2>/dev/null | grep -i "signup\|registr\|new user\|members"
```

Fallback — read the latest Morning Digest:

```bash
ls -t ~/Desktop/Rocket/Morning\ Digest\ -\ *.md 2>/dev/null | head -1 | xargs grep -i "signup\|registr\|new user"
```

Report:
- Signups today / 7-day avg
- vs prior week same day (if available)
- Trend: ↑ / ↓ / flat

---

## Step 4: Check Work Ledger Build Ratio

Pull the work ledger to compute the build ratio:

```
check_work_ledger()
```

Count items:
- **Revenue-driving:** status = `built` or `verified` in last 7 days, category NOT `maintenance`/`debt`/`cleanup`
- **Maintenance:** all other recent items

Report:
- Revenue-driving / total = X%
- Target: ≥ 70%
- GREEN if ≥ 70%, YELLOW if 55–69%, RED if < 55%

Also surface: number of open gates from `run_revenue_gate_checks()`.

---

## Step 5: Compute Plan Trajectory

Using the Master Plan target ($30K by Mar 27, 2026):

```
Days elapsed since Feb 25 = N
Expected cumulative revenue = N × $1,000/day
Actual cumulative = [from Step 2]
Variance = Actual - Expected
```

Report:
- Expected by today: $X
- Actual: $Y
- Variance: +$Z ahead / -$Z behind
- Projected final (at current pace): $P
- Scenario mapping: LOW (29-35k) / MEDIUM (48-62k) / HIGH (80-110k+)

---

## Step 6: Cross-Reference Report

After all 4 checks, produce the Verify Compass verdict:

```
VERIFY COMPASS — HH:MM ET — [DATE]

REVENUE PACE
  Briefing claimed:  $X/day
  Live source shows: $Y/day
  Match: ✅ / ⚠️ STALE / ❌ WRONG

SIGNUPS
  Briefing claimed:  X today / Y avg
  Live source shows: A today / B avg
  Match: ✅ / ⚠️ STALE / ❌ WRONG

BUILD RATIO
  Ledger shows: X% revenue-driving (target ≥ 70%)
  Status: 🟢 ON TARGET / 🟡 WATCH / 🔴 BELOW TARGET
  Open gates: N

PLAN TRAJECTORY
  Expected: $X cumulative by today
  Actual:   $Y cumulative
  Variance: [+/-]$Z
  Pace:     ON TRACK / BEHIND / AHEAD
  Projected: $P by Mar 27

COMPASS VERDICT
  🟢 ACCURATE — all sources match, data is fresh
  🟡 STALE — [N] metrics pulled from cache > 12h old
  🔴 WRONG — live sources contradict briefing (details above)
```

---

## Step 7: Surface Discrepancies

If any metric shows ⚠️ STALE or ❌ WRONG:

1. State exactly which file or source has stale/wrong data
2. State the last-updated timestamp if visible
3. Recommend the fix:
   - Stale → "run `kai_morning.py` to refresh"
   - Wrong → "escalate: [specific pipeline or source causing the discrepancy]"

---

## Rules

- **Read Master Plan EVERY run** — it's the source of truth for targets and scenarios.
- **Never declare compass accurate without checking at least 3 of 4 metrics live.**
- **If `kai_morning.py --pull-only` fails or hangs >15s**, fall back to the most recent Morning Digest file + work ledger. Note the fallback in the report.
- **Build ratio uses the work ledger**, not agent output or gut feel.
- **Report timestamps.** Always state when each data point was last updated.
- **Don't fix things.** This skill is read-only. If something is wrong, surface it and recommend — don't mutate state.
