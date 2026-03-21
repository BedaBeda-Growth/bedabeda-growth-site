---
name: "Improve Rules"
description: "Review the rules ledger, health board, monitoring, enforcement, impact measurement, and skill library. Identify the highest-leverage feedback loops to strengthen so the business gets faster, safer, and more stable over time."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Grep
ruleDomains:
  - ops
---

# Improve Rules

Use this skill whenever Nick says:
- "improve rules"
- "review our rules"
- "where are the highest leverage feedback loops?"
- "tighten the compass"
- "what should we measure or enforce better?"
- "how do we make the business self-improving?"
- "scan the skills"
- "what skills are stale, conflicting, or underused?"

## Core Purpose

This skill is not just for adding rules.

Its job is to review the **entire business feedback system**:

1. What rules exist
2. What they monitor
3. What they enforce
4. What outcomes they measure
5. What red lights / green lights they drive
6. What skills support, duplicate, or conflict with the system
7. Where the loop is weak, missing, noisy, stale, or high leverage

The goal is to create an operating compass that helps Nick continuously answer:

- Where is the business drifting?
- What is still too fragile?
- Which problems recur because the loop is incomplete?
- Which skills are helping vs creating confusion?
- What small rule, metric, enforcement, or skill upgrade would create the biggest stability or speed gain?

---

## Core Review Lens

For every important area, think in this chain:

**Signal → Rule → Enforcement → Outcome → Feedback → Improvement**

And for skills, think in this chain:

**Need → Skill → Usage → Accuracy → Overlap → Maintenance**

Ask:

- Do we have a reliable signal?
- Do we have a rule for it?
- Is the rule merely observing, or actually enforcing?
- Are outcomes measured, or do we just detect problems?
- Does the result roll up into the Health Board / Compass?
- If this goes red repeatedly, do we know exactly what to change?
- Which skill supports this loop today?
- Is that skill current, clear, and aligned with the actual system?

---

## Step 0: Run Incident Scan First (MANDATORY)

Before reviewing rules, health board, or skills, run the incident scanner to get a data-grounded picture of recent failures.

```bash
cd ~/scceo-1/grok-personal && python3 scan_incident_reports.py
```

This scans `docs/incidents/` across all 5 repos (scceo-1, rocket, app, spark-kanban, rv), cross-references proposed rules against `rules.db`, and outputs:
- `grok-personal/data/incident_scan.json` — machine-readable
- `grok-personal/data/incident_scan.md` — human-readable full report

**After running, immediately surface:**
1. **Total incidents** in the lookback window and how many are still open
2. **Rule gaps** — proposed rules from incident reports that are NOT yet in `rules.db`. These are the highest-priority Add candidates.
3. **Recurrence map** — rules violated 2+ times. Any rule violated 3+ times is a promotion candidate.
4. **Domain clusters** — which domain has the most incident heat right now. That is where enforcement is weakest.

**Never skip this step.** A rules review without incident data is a guess. The scan turns it into evidence.

---

## What To Review Every Time

### 1) Rules Database
Start by reviewing the rules ledger and summarize:

- Current active rules
- Domains covered
- Priority / severity distribution
- Autonomy levels (`simulate`, `human_review`, `auto_guarded`, `auto_safe`)
- Rules with repeated hits
- Rules with recurrences
- Rules that appear noisy, stale, conflicting, or underused
- Areas with no rule coverage

Always look for gaps between:
- known incidents
- repeated friction
- business-critical workflows
- actual rule coverage

### 2) Red Light / Green Light System
Review the current Health Board and ask:

- Which pillars are tracked?
- Which are missing?
- Which reds are persistent?
- Which greens may be false comfort because the measurement is too thin?
- Does each red map to a clear owner and threshold?
- Does each persistent red point to a hypothesis or fix path?

Do not just report board status.
Evaluate whether the board is actually steering the business.

### 3) Monitoring
Review the monitoring layer behind the rules:

- What is being checked live vs inferred?
- Which metrics are leading indicators vs lagging indicators?
- Which critical workflows have no monitoring?
- Which critical workflows only surface after damage is already done?
- Which checks are too manual or too delayed?

Favor earlier detection whenever possible.

### 4) Enforcement
Review the enforcement layer:

- Which rules are only in `simulate`?
- Which should stay observational?
- Which have earned promotion?
- Which are critical enough to block / retry / rollback / escalate?
- Which rules are firing but not changing behavior?
- Where is human review causing drag because the loop is not trusted yet?

Promote trust carefully, but do not leave high-value rules permanently toothless.

### 5) Impact Measurement
Review whether the system learns after acting:

- Are `outcomes` being recorded?
- Are recurrences visible?
- Are we measuring whether interventions worked?
- Which rules prevent future damage vs just log incidents?
- Which rules need an explicit success metric?
- Which red lights need a measurable "back to green" definition?

A rule is incomplete if it detects and acts, but never teaches.

### 6) Skill Library Audit
Call the `check-rule-alignment` skill to programmatically audit skill-to-rule coverage.

This skill will output a datatable of skill × rule gaps sorted by severity, highlighting top gaps with recommended actions. Use this report to form the core of your Skills Audit section.

In addition to rule coverage, manually scan the workspace skill library and evaluate:
- Which skills are actively useful vs likely stale
- Which skills reference old files, outdated workflows, or superseded systems
- Which skills overlap heavily and should probably merge
- Which skills conflict with current rules, current operating reality, or each other
- Which repeated workflows deserve a skill but do not have one yet

When reviewing skills, look for:
- stale paths
- obsolete repo names
- instructions that assume old processes
- duplicate trigger phrases
- duplicate operating roles
- conflicting success criteria
- missing references to the current rules, compass, or verification systems

Do not just inventory skills.
Evaluate whether the skill set itself is helping the business move faster and more cleanly.

---

## Required Output

Every run must produce these sections:

### A. System Snapshot
A concise view of:
- top rule domains
- current board state
- strongest existing loops
- weakest existing loops
- strongest skills
- most questionable skills

### B. Highest-Leverage Gaps
Rank the top 5 opportunities by leverage.

For each one include:
- **Area**
- **Current gap**
- **Why it matters**
- **Missing piece**  
  (`signal`, `rule`, `enforcement`, `outcome`, `board rollup`, `skill`, or `skill alignment`)
- **Recommended upgrade**
- **Expected benefit**
- **Suggested owner**

### C. Promote / Add / Tighten
Split recommendations into 3 buckets:

#### Promote
Rules or checks that should move up in autonomy, visibility, or enforcement strength

#### Add
New rules, checks, board lights, or skills that should exist but do not

#### Tighten
Existing rules, health checks, measurements, or skills that need better thresholds, clearer ownership, cleaner scope, better wording, or better outcome tracking

### D. Skills Audit
Include these four lists when relevant:

- **Skills to tighten**
- **Skills to merge**
- **Skills to retire**
- **Skills to create**

For each item, explain:
- what the issue is
- what conflict, drift, overlap, or leverage opportunity exists
- what the recommended action is

### E. Compass Verdict
End with a short verdict:

- What part of the business is most stable right now
- What part is drifting most dangerously
- What single feedback loop upgrade would create the most leverage this week
- What single skill-library upgrade would reduce the most confusion or drag this week

---

## Priority Heuristics

Favor recommendations that do one or more of these:

1. Protect revenue
2. Catch failures before users feel them
3. Reduce repeated human cleanup
4. Convert recurring incidents into permanent operating memory
5. Improve speed without reducing safety
6. Turn vague concern into measurable status
7. Strengthen persistent reds with clearer thresholds, ownership, and action paths
8. Reduce skill confusion, duplication, or stale guidance
9. Tighten the link between how Kai works and how the business is actually run

When in doubt, prioritize:
- revenue leaks
- broken checkout / payment loops
- messaging / comms quality risks
- team execution drift
- repeated operational friction
- stale or conflicting skills that steer Kai into outdated behavior
- anything that stays red without creating a clear corrective action

---

## Special Review Questions

Use these prompts every time:

- What expensive problem could happen again because the loop is still incomplete?
- What is red too often because we are measuring too late?
- Where do we have a rule but no outcome metric?
- Where do we have a metric but no enforcement?
- Where do we have enforcement but no board visibility?
- Which recurring issue should become a permanent rule?
- Which existing rule is giving little leverage and should be simplified, promoted, or retired?
- Which skill is stale enough to create bad recommendations?
- Which skills overlap enough that they should merge?
- Which skills are missing references to the real current systems?
- What would make the business more self-correcting over the next 7 days?

---

## Operating Rules

- Do not just list rules — evaluate leverage.
- Do not just report red lights — identify why they stay red.
- Do not recommend broad process theater — recommend specific loops.
- Prefer upgrades that make the system more self-correcting.
- Tie recommendations to actual business speed, reliability, cash, or stability.
- When possible, convert repeated issues into measurable, enforceable rules.
- When possible, connect rule hits to outcomes and board visibility.
- When possible, connect repeated workflows to stable, current skills.
- Flag stale skills directly.
- If two skills conflict, say which one should win.
- If data is thin, say so directly.

---

## Output Format

Use this structure:

IMPROVE RULES — [DATE/TIME]

### 0. Incident Scan
- Total incidents (last 90d): N
- Open: N
- Top domains: domain(N), ...
- Rule gaps (proposed but not in rules.db): list them
- Recurrence hotspots: rules violated 2+x

### System Snapshot
- ...
- ...

### Highest-Leverage Gaps
1. **[Area]**
   - Current gap:
   - Missing piece:
   - Upgrade:
   - Benefit:
   - Owner:

### Promote / Add / Tighten

**Promote**
- ...

**Add**
- ...

**Tighten**
- ...

### Skills Audit

**Skills to tighten**
- ...

**Skills to merge**
- ...

**Skills to retire**
- ...

**Skills to create**
- ...

### Compass Verdict
- Most stable:
- Biggest drift:
- Best feedback-loop move this week:
- Best skill-library move this week:

---

## Important Principle

This skill exists to help Nick build a business that learns from friction.

Every incident should have the chance to become:
- a rule
- a monitor
- an enforcement path
- an outcome metric
- a board signal
- a skill update if operating guidance changed
- a better operating decision next time

The business should not just collect lessons.
It should absorb them into how Kai sees, decides, and acts.

---

## MANDATORY: Distribute After Any Rule Changes

If this skill run resulted in any rule additions, promotions, or modifications, **you MUST run distribution** before completing:

```bash
cd ~/scceo-1/grok-personal && python3 distribute_rules.py
```

This pushes updated rules to:
- `AGENT-RULES.md` in all 5 repos (rocket, app, spark-kanban, rv, scceo)
- `AGENTS.md` in scceo-1 (active rule list with current counts)
- `~/.gemini/GEMINI.md` (global Antigravity instructions)

**Do NOT skip this step.** Undistributed rule changes are invisible to agents in other repos.
