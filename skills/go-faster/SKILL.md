---
name: "Go Faster"
description: "Audit the full operating system for bottlenecks, duplication, drift, and missed leverage. Use when Nick asks how to make the system faster, cheaper, lighter, or higher-output across rules, skills, docs, tasks, ledger, and verification loops."
ruleDomains:
  - ops
---

# Go Faster

Use this skill to identify the **smallest structural changes** that make future work:
- faster
- cheaper
- clearer
- more reliable
- more likely to reach verified completion

## Core mission

Audit the operating system and answer:
1. **What is slowing us down?**
2. **What is wasting tokens, time, or coordination?**
3. **What should become a rule, skill, doc, automation, checklist, or removal?**
4. **What 1–3 changes would make tomorrow materially better than today?**

## Optimization target

Prefer the smallest structural change that makes future work faster, cheaper, and more reliable.

Reject:
- process theater
- complexity for elegance
- giant audits with no prioritization
- duplicate rules/skills/docs
- recommendations that add maintenance without throughput gain

## Audit layers

Review only the layers relevant to the user’s question, but think across this stack:
1. Objectives / priorities
2. Rules
3. Skills
4. Central docs / system memory
5. Tasks / dispatch quality
6. Work ledger / status visibility
7. Verification / outcome loops

## Required lens

For each issue, ask:
- Is this a **throughput** problem, **cost** problem, **clarity** problem, **reliability** problem, or **verification** problem?
- Is this repeated enough to codify?
- Is the best fix a **rule**, **skill**, **doc**, **automation**, **task template**, **ledger/status change**, or **removal/merge**?
- Does the recommendation reduce future thinking, future handoffs, or future rework?

## Conversion logic

When a pattern repeats, recommend the right container:

- **Repeated judgment call** → rule
- **Repeated multi-step workflow** → skill
- **Repeated context lookup** → doc
- **Repeated low-variance manual action** → automation
- **Repeated false-done / quality miss** → verification gate or checklist
- **Repeated stale / invisible work** → ledger or status-system change
- **Repeated overlap / confusion** → merge, simplify, or retire artifacts

## Output format

Every Go Faster run should produce five sections.

### 1. System Health Snapshot
Short summary of:
- what is working
- what is drifting
- what is wasting energy
- biggest leverage opportunity now

### 2. Friction Map
List the main bottlenecks by category, such as:
- rules friction
- skill overlap or staleness
- docs gaps
- task / dispatch quality issues
- ledger visibility problems
- verification failures

### 3. High-Leverage Recommendations
Only include the highest-value recommendations.

For each one, output:
- **Title**
- **Problem**
- **Root cause**
- **Proposed change**
- **System type:** rule | skill | doc | automation | ledger | task-template | remove/merge
- **Expected impact**
- **time_delta**
- **cost_delta**
- **cycle_delta**
- **capacity_delta**
- **quality_risk**
- **decision:** keep | park | reject

### 4. Conversion Opportunities
Bucket findings into:
- make this a rule
- make this a skill
- make this a doc
- automate this
- merge / remove this

### 5. Today’s Fastest Wins
End with only **1–3 moves** that have:
- highest leverage
- low coordination cost
- near-term compounding value

## Prioritization rules

Favor recommendations that:
1. increase verified output
2. protect revenue or core execution quality
3. reduce repeated human cleanup
4. reduce context loss or selection cost
5. convert recurring friction into reusable operating memory
6. improve speed without reducing safety

If two issues share one root cause, recommend one structural fix.

## Daily cadence

When used as a daily loop:
- compare today’s friction to recent known patterns
- highlight what is newly worse, newly better, or still unresolved
- avoid re-listing the entire system unless needed
- focus on what should change **today**

## Guardrails

- Keep audits tight.
- Prioritize decisions over description.
- Prefer a short sharp report over a long “comprehensive” one.
- If data is weak, say so directly.
- If the best move is to leave something alone, say that.
- If a recommendation increases system weight more than it increases throughput, reject it.

## Success criteria

A good Go Faster run leaves Nick with:
- a clear view of what is slowing the system down
- the top leverage moves worth doing now
- concrete candidates for rule / skill / doc / automation conversion
- fewer decisions to re-make tomorrow
