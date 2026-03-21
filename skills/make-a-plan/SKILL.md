---
name: "Make an Objective Document"
description: "Create an outcome-anchored Objective Document for any work item. Defines what DONE looks like via 3 outcome gates and 5 essential questions — agents choose how to get there. Use when Nick says 'make a plan', 'plan this out', 'how should we approach X', or when a new work item, scope change, or replan is needed."
alwaysAllow:
  - Read
ruleDomains:
  - ops
---

# Make an Objective Document

Use this skill when:
* Nick says "make a plan", "plan this out", "how should we approach X"
* New work item or scope change
* Replanning needed

---

## How This Skill Works

This skill defines **what the plan must achieve**, not how to build it. You have full freedom to research, structure, and present the plan however best fits the problem — as long as the plan passes all 3 outcome gates.

**Two non-negotiable requirements** (before you do anything else):
1. **Ledger entry** — create or reference `AUTO-{YYYYMMDD}-{short-desc}` and state which one this maps to (Rule Zero)
2. **NSO alignment** — read `~/scceo-1/objectives/OBJECTIVES.md` and map this work to at least one North Star. If it maps to none, stop and ask Nick.

---

## The 3 Outcome Gates

Your plan is ready to present when — and only when — all 3 gates are TRUE. How you get there is up to you.

### Gate 1 — Intent Is Clear

**What must be true:** Anyone reading the plan can answer: *What does Nick want, why does it matter, and does it conflict with anything?*

**Falsification test:** If another agent reads the plan and can't identify (a) Nick's request in plain language, (b) which NSO this advances, and (c) whether it conflicts with existing work — the gate FAILS.

### Gate 2 — Current State Is Known

**What must be true:** The plan is grounded in the real system, not assumptions. The agent has looked at actual code, configs, docs, or infrastructure before designing the solution.

**Falsification test:** If the plan references components that don't exist, targets interfaces that are dead/deprecated, or proposes building something that already exists — the gate FAILS.

### Gate 3 — The Plan Is Executable

**What must be true:** A different agent (or Nick) could pick up this plan and execute it without asking clarifying questions. The plan includes what to build, how to verify it worked, and what proof looks like.

**Falsification test:** If someone reading the plan would need to ask "but what exactly should I do?" or "how would I know this worked?" — the gate FAILS.

---

## The 5 Essential Questions

The plan document must answer these 5 questions. **Format, depth, and ordering are your call** — adapt to the problem. A bug fix plan looks different from an architecture plan.

### 1. What are we trying to achieve?
Nick's words (paraphrased or verbatim) + NSO mapping + any conflicts or tensions with existing work.

### 2. What does the system look like right now?
Current state of whatever this plan touches. Gaps between documented and actual. What's live, what's dead, what's relevant.

### 3. What does DONE look like?
**One clear outcome test.** Not three overlapping sections — one. The format is:
> [Who] does [action] and sees [result].

This is the only definition of done. Everything else flows from it.

### 4. What's the plan?
The actual work to do. You decide the right level of detail:
- Simple fix? A few bullets.
- Complex architecture? Full component breakdown with dependencies.
- Uncertain problem? Investigation steps with decision points.

**Include relevant rules.** Scan `rule_ledger.rules` for anything that constrains or guides this work. Don't audit for compliance theater — just know the rules that actually matter and build around them.

### 5. How do we know it worked?
Proof mechanisms — exact commands, DB queries, test runs, screenshots, or browser checks that verify delivery. Every claim of "done" must point to specific evidence.

---

## Write the Plan Document

Create or update exactly one file: `~/scceo-1/objectives/{kebab-slug}.md`

Use whatever structure best answers the 5 questions for this specific problem. The only hard requirement is that reading the document satisfies all 3 outcome gates.

---

## Present to Nick

Show:
1. Which ledger entry this maps to
2. Which NSO it advances
3. Link to the Objective Document
4. Any rules that materially affect the plan
5. "Approve to execute?"

**Do NOT start execution until Nick says go.**

---

## After Execution

Archive the outcome. Record what worked, what didn't, and one lesson for next time. This feeds future plans.

---

## Skill Chains

| Skill | When |
|-------|------|
| `review-plan` | After drafting — for 4-lens executive review before presenting to Nick |
| `update-plan` | When review returns feedback that needs incorporation |
| `work-ledger-sync` | To track status throughout |
| `objectives-check` | Quick NSO alignment validation |