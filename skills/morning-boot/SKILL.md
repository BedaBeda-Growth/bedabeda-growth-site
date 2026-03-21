---
name: "Morning Boot"
description: "Full morning startup — health checks, pipeline, compass review, and planning prep. One command to boot the day."
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
---

# Morning Boot — The Super Skill

## Trigger Phrases
- "morning", "boot", "start the day", "let's go", "wake up", "good morning"

## Core Rule
**Improve first, fix second.** Green things compound. Red things get noted and queued — but the top 3 slots belong to growth, not maintenance.

## Objective Alignment (Mandatory)
Before surfacing top recommendations:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Tie each top recommendation to at least one objective ID
- If any major recommendation is unmapped, ask: **"What's the objective here?"**
- If a repeated unmapped need appears, log a candidate in `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`
- Include objective risk in red/yellow notes

**Efficiency-first filter:** top recommendations must improve execution efficiency/capacity (time, cost, cycle count, or quality throughput). Avoid activity-heavy ideas that add coordination drag without leverage.

Full verbose details must be written to the Obsidian morning briefing file: `Kai Morning Briefing.md` (including objective audit details and counts). You may also keep the dated Operations file for convenience, but **Obsidian is required source-of-truth for verbose output**.

The session report is a 10-second glance: red/green + summary + a link to today's verbose file in Obsidian.

---

## Phase 0: 1Password Dev Session (automatic)

The morning pipeline (`kai_morning.py`) now auto-checks for an active OP session as its very first step. If `~/.op-session/meta` is missing or expired, it runs `op_dev_session.sh` — Nick gets ONE biometric prompt, then all secrets are cached for 8 hours.

If you're in an interactive session and need credentials (SOS sync, Stripe, Sentry, etc.), check first:
```bash
bash ~/scceo-1/grok-personal/op_dev_session.sh status
```
If not active, run:
```bash
bash ~/scceo-1/grok-personal/op_dev_session.sh
```

**Do NOT make multiple sequential `op read` calls.** The dev session cache is the only path.

---

## Phase 0.5: Memory Bootstrap (5 seconds, silent)

Run silently, do not block or surface output to Nick:
```bash
python3 /Users/nicholaspetros/scceo-1/openviking/scripts/memory_health.py 2>/dev/null
```

- Exit 0 (healthy): memory layer active — use `[skill:startup-memory]` to pull the startup brief before Phase 1 context load
- Exit 1 (stopped/degraded): note silently, fall back to direct file reads — do NOT block startup
- Capture the status for Phase 5 (GREEN / YELLOW / stopped)

**This step never delays the boot.** If the script takes >3s, skip and mark as stopped.

---

## Phase 1: Warm Start (30 seconds)

Run in parallel:
1. `kai_warm_start()` — ledger digest, priorities, team chat, warnings
2. `check_team_chat(unread_only=True)` — anything from Nick/Ember overnight
3. `kai_overnight_summary()` — buses, queue, what moved while we slept

**Output:** Internal context only. Don't surface yet.

---

## Phase 2: Health Checks (10-20 seconds)

```bash
curl -s http://localhost:5005/pulse?force=1
```

Pulse now includes **Objectives Alignment** health (via objective-mapping audit).

Also run (explicit objective loop, every day):
```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/objectives_audit.py --json
```

And:
```
run_revenue_gate_checks()
read_obsidian_file("Kai Morning Briefing.md")
```

**Revenue gate is check #1.** If any gate is OPEN, it goes in 🔴 immediately.

**Objective loop rule (daily):**
- If `built_unmapped > 0` or `high_pri_unmapped > 0` → 🔴
- If only `unmapped_total > 0` → 🟡
- If all objective checks are clean → 🟢

---

## Phase 3: Morning Pipeline (2-5 minutes)

Only run if `~/Desktop/Rocket/Morning Digest - YYYY-MM-DD.md` doesn't exist yet:
```
run_morning_pipeline(skip_content=False)
```

Output goes to `~/Desktop/Rocket/Kai Morning Briefing.md` — do NOT repeat it in the session.

---

## Phase 4: Compass Review (internal)

Read briefing, extract:
- Revenue pace vs $1K/day target
- Signup trend
- Build ratio vs 70% goal
- Overnight agent completions

Do NOT surface raw numbers in the session report. Use them to inform the traffic lights and top 3.

---

## Phase 5: Surface Report ← THE ONLY THING NICK SEES

**Format: traffic lights + top 3. Nothing else.**

```
## Morning Brief — [Day, Mon DD · HH:MM ET]

🟢 [System]: [one phrase]
🟡 [System]: [one phrase — what's attention-worthy]
🔴 [System]: [one phrase — what needs action]
🎯 Objectives: [GREEN|YELLOW|RED] — unmapped=[N], built_unmapped=[N], high_pri_unmapped=[N]

---
## Top 3 to Grow This Week
1. **[Opportunity]** — [why it compounds, what the lever is]
2. **[Opportunity]** — [why it compounds, what the lever is]
3. **[Opportunity]** — [why it compounds, what the lever is]

→ Verbose details: [Kai Morning Briefing.md](file:///Users/nicholaspetros/Desktop/Rocket/Kai%20Morning%20Briefing.md)
```

### Blog jam (append if outline is ready)

If `blog_outline` in the briefing has status `ready`, append ONE line after the Top 3:

```
📝 **Blog jam ready:** "[theme in 8 words or less]" ([signal]) — say "let's jam" to draft it.
```

Do NOT show this line if no outline exists. Keep it short — it's an invitation, not a report.

### Traffic light rules

| Color | Meaning | Nick's action |
|-------|---------|---------------|
| 🟢 | Working as expected — no attention needed | None |
| 🟡 | Worth watching or recently changed — awareness only | Mental note |
| 🔴 | Blocking revenue, broken, or actively losing ground | Decide today |

**Objectives line mapping:**
- `🎯 Objectives: RED` if `built_unmapped > 0` OR `high_pri_unmapped > 0`
- `🎯 Objectives: YELLOW` if only `unmapped_total > 0`
- `🎯 Objectives: GREEN` if all objective counts are clean

**Systems to always cover (in this order):**
1. Revenue gates (🔴 if any open)
2. Live site / auth
3. X reach / content
4. Compass (build ratio, momentum)
5. Objectives alignment (mapping hygiene + built/high-priority unmapped)
6. Team / EOD
7. Pipeline health
8. Memory layer (🧠) — GREEN if corpus fresh <8h, YELLOW if <24h, stopped if service down (stopped = 🟡 only, not 🔴)

**What makes a 🟡 vs 🔴:**
- 🔴 = money is leaking, users are broken, or we're losing ground TODAY
- 🟡 = recently fixed (watching), slightly off-target, or needs a decision this week
- If in doubt: 🟡. Reserve 🔴 for things that cost money or users right now.

### Top 3 rules

**These are not the 3 biggest problems. They are the 3 highest-leverage moves.**

Each Top 3 item must be efficiency-positive:
- Faster cycle OR same effort with materially higher throughput/quality
- Lower cost per outcome
- Lower coordination burden

Ask: "If we did this one thing consistently this week, what would compound the most?"

Framing:
- ✅ "Auto-schedule content — queue is ready daily but nothing ships; fixing this = consistent reach with zero extra effort"
- ✅ "Trial→paid conversion — 46 trials/day at $0 conversion; one email sequence = direct revenue"
- ❌ "Fix the Resend API key" — that's maintenance, not growth (put it in 🔴 instead)

One sentence each. What it is, why it compounds. No bullet nesting.

**Rotate the lens each day:** Mon = content/reach, Tue = conversion/revenue, Wed = product, Thu = team leverage, Fri = ops/systems. Don't always surface the same 3.

---

## Phase 6.5: Engineering Plan Card

After the surface report, surface the engineering plan + Jules budget.

**Read it from:** `step_results["engineering_plan"]` (already in briefing) — do NOT re-run it.
**Budget from:** `python3 /Users/nicholaspetros/scceo-1/grok-personal/jules_budget.py`

**Format:**

```
---
## 🔧 Engineering Plan — Kai Drives Today

{ranked list from engineering_plan["plan_md"]}

📊 Jules budget: {used}/{300} used today ({remaining} remaining)
**30-min pulse active** — status posts to team chat as items complete.

Say **"dispatch plan"** to generate task cards + send all {N} items to Jules.
```

**When Nick says "dispatch plan":**

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 jules_batch_dispatch.py
```

This will:
1. Generate a task card for each item (from work ledger metadata)
2. Write task card to `{repo}/plans/{item-id}.md` + `scceo-1/plans/{item-id}.md`
3. Dispatch to Jules (`jules remote new --repo {github-repo} --session ...`)
4. Update work ledger: status → dispatched, record session_id
5. Debit Jules budget

Budget rules:
- Hard stop at 280/300 — reserves 20 for ad-hoc/Nick dispatches
- Soft warning at 250 — surface in pulse but keep dispatching
- 300/day resets at midnight UTC

**After dispatch:** Heartbeat pulse will monitor every 30min and post to team chat when:
- A Jules session completes (PR URL available)
- Budget hits warning/hard stop
- Escalations need attention

**Rules:**
- Only show this block if `engineering_plan["status"] == "success"` and there are items
- If engineering_plan is missing or failed: skip this block silently
- Do NOT add commentary or re-rank items — show them exactly as generated
- The goal: Nick reads it in 10 seconds, says "dispatch plan", then focuses on growth
- Nick saying "dispatch plan" IS the explicit override for plan approval (no Grok review cycle needed)

---

## Phase 6: Hand Off

After the surface report:
- If 🔴 items exist → "Want me to queue a fix for X?" (don't fix automatically unless obvious)
- If top 3 resonate → "Want me to dispatch on any of these?"
- If Nick says "let it rip", "dispatch", or "start the conveyor" → run the `conveyor-dispatch` skill (full morning dispatch: sync → select → generate task files → enqueue to heartbeat)
- If Nick says "let's jam", "jam on the blog", or "blog draft" → read the blog-outline.md file and run the morning-content-jam skill Phase 3 jam flow: prompt Nick section by section using the speak-to prompts, collect his answers, then draft the article inline using his voice profile. After the draft is approved/published, run: `python3 /Users/nicholaspetros/scceo-1/grok-personal/blog_published.py` to reset the streak nag.
- Always end with: "What do you want to start on? Say **let it rip** to run the full conveyor dispatch."

---

## Phase 7: Skills Menu

After the hand-off line, always append a compact skills block. Two parts: **suggested picks** for today + a **standing reference card**.

### Suggested picks (rotate by day)

Always anchor to `morning-content-jam` if queue is ready. Add 1-2 others by day:

| Day | Suggest |
|-----|---------|
| Mon | `morning-content-jam` · `sos-pulse` · `repo-planning` |
| Tue | `morning-content-jam` · `codedoc-scan-check` · `cto-heartbeat` |
| Wed | `morning-content-jam` · `run-testing-suite` · `status-reconcile` |
| Thu | `morning-content-jam` · `sos-pulse` · `daily-plan` |
| Fri | `morning-content-jam` · `codedoc-scan-check` · `rocket-ci-gates` |
| Sat/Sun | `morning-content-jam` · `daily-plan` · `grok-plan-loop` |

**Context overrides** (add these regardless of day):
- Heartbeat queue has pending items → suggest `cto-heartbeat`
- Work ledger has failed/unverified gates → suggest `status-reconcile`
- Blog outline ready → say "say 'let's jam'" not a skill name
- No test run noted recently → add `run-testing-suite`

### Output format

Append this block at the very end, after the hand-off line:

```
---
**Skills to run this morning:**
→ `morning-content-jam` — punch up today's reply queue
→ `codedoc-scan-check` — dead code + doc hygiene
→ `cto-heartbeat` — dispatch queue + completions

**All skills:**
Content    morning-content-jam
Dispatch   conveyor-dispatch · cto-heartbeat · plan-advance
Planning   daily-plan · repo-planning · grok-plan-loop
Health     sos-pulse · codedoc-scan-check · run-testing-suite · status-snapshot · status-reconcile
CI/Deploy  rocket-ci-gates · app-ci-gates · scceo-ci-gates
```

The reference card stays the same every day. Only the "Skills to run this morning" picks change.

---

## Rules

- **Obsidian `Kai Morning Briefing.md` gets everything. The session gets the summary.** Never repeat the full briefing in chat.
- **Top 3 are growth moves, not the 3 worst problems.** Green things compound; broken things get queued.
- **Revenue gates are check #1.** If a gate is open it goes in 🔴 and leads the report.
- **Run objective audit daily from Morning Boot.** Do not rely on Kai Morning usage.
- **If built/high-priority items are objective-unmapped, surface as 🔴.**
- **Don't wait for the pipeline to finish.** Show health lights first (fast), pipeline output second (slow).
- **$30K plan trajectory belongs in the compass line.** Every morning: are we on pace?
- **"Needs Nick's attention" ≠ "broken."** 🟡 is for things worth knowing, not just things that failed.
- **Zero emails in 24h = 🔴.** Always. Even if expected — surface it so Nick decides.
- **Keep it to one screen.** If it doesn't fit without scrolling, it's too long.

---

## Python Automation Audit

After boot: were any morning check steps deterministic (gate query, health ping, file parse, metric pull)?

- Quick check: `python3 ~/.agents/skills/prefer-python-over-llm/scripts/classify_task.py "step description"`
- If scriptable → log `rule_ledger.skill_usage` with `python_candidate=true` and flag for cron replacement
- Rule: `ops-prefer-python-over-llm`

---

## Variants / Absorbed Modes

### --check
Daily status check only — gates, nag items, pulse. Skip content generation.
*(absorbed: daily-check)*

### --plan
Generate today's day plan from priorities and work ledger.
*(absorbed: daily-plan)*

### --status
Quick current status across all systems.
*(absorbed: get-status)*

### --next
Show what to work on next based on unblocked priority items.
*(absorbed: whats-next)*

### --dashboard
Check dashboard health indicators only.
*(absorbed: check-dashboard-status)*