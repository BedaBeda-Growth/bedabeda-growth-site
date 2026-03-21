---
name: "Review Plan"
description: "Review a plan document from Nick or another agent before execution. Use when a plan needs an executive-quality go/no-go judgment after reading the relevant documentation first, comparing against prior plans, scanning applicable rules, and then grading the submitted plan for rule alignment, efficiency, reliability, and engineering quality."
alwaysAllow:
  - Read
  - Bash
requiredSources:
  - kai-brain
ruleDomains:
  - ops
---

# Review Plan

Use this skill when Nick shares a plan or asks for feedback on a plan from another agent.

The job is not to rewrite the plan from scratch.
The job is to **review it in the correct order**, judge whether it should proceed, and return an executive verdict.

A valid review must pass through four lenses:
1. **Rules lens** — does the plan align with current rules and operating constraints?
2. **Efficiency lens** — is this the fastest, lightest, most reliable path to the outcome?
3. **Public-information lens** — if useful, is there an external best practice, platform capability, or simpler pattern that improves the plan?
4. **Engineering lens** — is the plan technically sound, verifiable, appropriately scoped, and likely to succeed?

Never start with opinions about the submitted plan.
Always review the surrounding context first.

## Required Review Order

Follow this sequence every time:

### Step 0 — Ledger Mapping

Before reviewing, map the work to a ledger item if one exists.
If none is clear, note a temporary ID:

`AUTO-{YYYYMMDD}-review-plan-{short-slug}`

State which ledger item or temporary ID this review maps to.

### Step 1 — Read Documentation First

Read the smallest relevant documentation set before reading the submitted plan in detail.
Prioritize:
- `AGENTS.md`
- `CLAUDE.md`
- repo docs / README
- existing specs or runbooks
- related `SKILL.md`, `guide.md`, or config docs

Goal:
- understand current constraints
- understand intended architecture/workflow
- identify existing documented decisions

If documentation is missing, stale, or contradictory, say so explicitly.
A plan review without documentation context is incomplete.

### Step 2 — Read Previous Related Plans

Read prior plans before judging the new one.
Look for:
- same repo or system
- same workflow or feature area
- same failure mode or recurring request
- same objective with a newer or older version

Minimum expectation:
- inspect clearly related plans first
- use the plan archive as precedent, not as blind authority

Questions to answer:
- Has this already been planned?
- What failed before?
- What got approved before?
- Is the new plan repeating old weight, old mistakes, or already-solved work?

If no relevant prior plans are found, state that explicitly.

### Step 3 — Scan Applicable Rules

Read the relevant rules after docs and prior plans, before final judgment.
Always include:
- rules directly applicable to the plan’s domain
- nearby governance rules if they materially affect execution
- system rules about tracking, verification, and documentation when applicable

Create a shortlist:

`RELEVANT RULES:`
- `{rule}` — `{why it matters}`
- `{rule}` — `{why it matters}`

Do not just say “looks aligned.”
Call out the actual constraints that matter.

### Step 4 — Review the Submitted Plan

Only after Steps 1–3 are done, review the submitted plan itself.
Check for:
- unclear scope
- missing verification
- skipped current-state review
- duplicated work
- avoidable complexity
- weak sequencing
- missing rollback or safety thinking
- hand-wavy steps that are not actionable
- dependence on humans remembering things
- lack of efficiency gains where simplification was available

### Step 5 — Check Public Information When It Adds Leverage

Use public information only when it can materially improve the plan.
Examples:
- a platform has a native feature that avoids custom code
- a current best practice reduces risk or cycle time
- a service’s latest docs show a simpler or more reliable implementation path

Do **not** do shallow research for decoration.
Only use public information if it could change the recommendation.

### Step 6 — Apply the Four Review Lenses

#### 1. Rules Lens
Ask:
- Does the plan violate any active rule?
- Does it skip required ordering (docs first, rules first, verification, etc.)?
- Does it rely on human memory instead of enforceable steps?
- Does it leave required distribution or documentation updates ambiguous?

#### 2. Efficiency Lens
Ask:
- Is this the lightest path that solves the problem?
- Is there a simpler config/process/platform solution?
- Does the plan add coordination burden or maintenance weight?
- Does it improve capacity for quality at scale?

When possible, include:
- `time_delta`
- `cost_delta`
- `cycle_delta`
- `capacity_delta`
- `quality_risk`
- `decision: keep | park | reject`

#### 3. Public-Information Lens
Ask:
- Is there a newer, better, faster, or safer way supported by public docs or platform capabilities?
- Does the plan ignore an obvious native feature or standard pattern?

#### 4. Engineering Lens
Ask:
- Is the plan actionable?
- Is the plan verifiable?
- Is the sequencing correct?
- Is rollback/safety considered where needed?
- Is scope controlled?
- Is the plan likely to succeed without hidden assumptions?

## Verdict Rules

The output must end in one of two verdicts only:

### A — Approved
Use only when the plan fully clears the review.
Exact meaning:
**`A — 100% approved, go`**

Use this only if:
- the plan aligns with relevant rules
- the plan reflects documentation and current-state awareness
- the plan is not obviously duplicative of prior work
- the plan is efficient enough for the problem size
- the plan is technically sound and verifiable
- no meaningful revision is needed before execution

### B — Feedback
Use when the plan should **not** proceed as-is.
This verdict must include a pointed list of what to fix.

Feedback should be:
- executive in tone
- direct
- specific
- prioritized
- action-oriented

Do not give vague critique like “could be clearer.”
Say exactly what is missing, what is overweight, what violates precedent, or what should be simplified.

## Required Output Format

Use this structure:

# REVIEW PLAN — [DATE/TIME]

## Ledger Mapping
- Review maps to:

## Documentation Reviewed
- {doc path or source} — {why it mattered}

## Prior Plans Reviewed
- {plan path} — {relevance}

## Relevant Rules
- {rule} — {why it applies}

## Executive Summary
- 2–5 bullets max

## Review by Lens

### Rules Lens
- PASS / CONCERN / FAIL
- Evidence:

### Efficiency Lens
- PASS / CONCERN / FAIL
- Evidence:
- `time_delta:`
- `cost_delta:`
- `cycle_delta:`
- `capacity_delta:`
- `quality_risk:`
- `decision:` keep | park | reject

### Public-Information Lens
- PASS / CONCERN / FAIL
- Evidence:

### Engineering Lens
- PASS / CONCERN / FAIL
- Evidence:

## What the Plan Gets Right
- {short list}

## Pointed Feedback
- 1.
- 2.
- 3.

## Verdict
- `A — 100% approved, go`
  or
- `B — address the feedback before approval`

## Review Standards

### Approve sparingly
Approval means the plan is ready to execute, not merely promising.

### Prefer the smallest durable improvement
If the plan can be improved by removing weight, simplifying sequence, or using an existing mechanism, call that out.

### Do not confuse novelty with quality
A more elaborate plan is often worse.

### Compare against precedent, not just intuition
If prior plans already solved similar problems more cleanly, say so.

### Stay executive
Focus on whether the plan should move forward, what must change, and why that matters.

## Anti-Patterns

Reject or flag plans that:
- skip documentation review
- ignore prior plans
- reference rules vaguely without naming them
- add new infrastructure before checking simpler options
- lack verification steps
- confuse implementation ideas with a concrete execution plan
- create obvious maintenance burden without leverage
- repeat old failed patterns
- hide risk behind generic wording
- require humans to manually remember key safeguards

## Success Criteria

This skill has done its job when the review makes all of these clear:
1. What documentation was reviewed first
2. Which prior plans were considered
3. Which rules actually matter
4. Whether the submitted plan should proceed now
5. What exact improvements are required if it should not proceed
6. Whether a simpler, faster, or more reliable path exists
