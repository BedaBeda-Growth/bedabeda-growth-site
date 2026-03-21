---
name: "Incident Governance Review"
description: "Review a specific incident report plus any proposed remediations, then scan the full active rule ledger and all local/global skills to draft comprehensive governance hardening updates. Use when an incident, postmortem, or near miss should be turned into prioritized rule and skill changes, exact draft edits, and an approval-ready batch remediation plan without auto-applying changes."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Incident Governance Review

Use this skill when Nick wants to turn a concrete failure into a comprehensive governance upgrade rather than accepting narrow incident proposals at face value.

## Purpose

Convert a specific incident into a rules-and-skills hardening pass.

The job is to:
1. Understand what happened
2. Evaluate the incident report's proposed corrections
3. Scan the full governance corpus in scope for v1
4. Identify direct, adjacent, and systemic prevention opportunities
5. Draft exact changes and a validation plan
6. Stop at approval; do not auto-apply

## Scope for v1

Review only these governance artifacts unless Nick explicitly expands scope:
- All active rules from the Company Rule Ledger
- All workspace skills in `/Users/nicholaspetros/scceo-1/skills/`
- All global skills in `~/.agents/skills/`

Optional supporting inputs when available:
- incident report
- postmortem
- logs
- transcripts
- proposed remediations
- linked artifacts referenced by the report

Do **not** expand into automations, statuses, labels, or unrelated systems in v1 unless Nick asks.

## Required Workflow

Follow this sequence every time.

### 1. Read the incident package

Read the incident report first.

Then read any attached or referenced supporting artifacts that materially affect interpretation:
- proposed corrections
- logs
- timeline
- operator transcript
- linked evidence

If key artifacts are missing, continue with the available evidence and state what is missing.

### 2. Extract the failure shape

Summarize:
- triggering event
- visible failure
- root cause if known
- contributing factors
- detection gap
- enforcement gap
- procedural gap
- skill gap
- ambiguity or instruction gap

Treat omission failures as seriously as explicit bad actions.

### 3. Evaluate the proposed remediations

Do not assume the incident report's proposals are sufficient.

For each proposal, assess:
- what exact failure mode it covers
- what nearby variants it misses
- whether it creates operator friction or false positives
- whether it conflicts with any rule or skill
- whether it relies on memory instead of enforcement
- whether it solves detection only, action only, or full prevention

Explicitly look for under-correction and over-correction.

### 4. Scan all active rules

Review the full active rule corpus in the Company Rule Ledger.

When available, use the authoritative active rules source rather than a stale copy. At minimum, account for:
- rule key
- domain
- trigger
- severity
- autonomy level
- action type
- wording/description
- coverage gaps relative to the incident

Check whether the incident should lead to:
- a new rule
- tighter conditions on an existing rule
- a different trigger
- stronger action behavior
- clearer scope or ownership
- better outcome tracking
- explicit exception handling

### 5. Scan all local and global skills

Review the full skill corpus in scope.

Look for:
- stale instructions
- conflicting instructions
- duplicated responsibilities
- missing governance references
- missing verification steps
- outdated paths or systems
- workflows that assume facts not guaranteed by the rules
- skills that should mention incident-derived guardrails but do not

Treat skill drift as a first-class governance issue.

### 6. Synthesize governance gaps

Map the incident against the corpus and identify:
- direct prevention gaps
- adjacent prevention gaps
- systemic governance gaps
- cross-artifact drift between rules and skills
- ambiguity gaps
- enforcement feasibility issues
- approval-boundary issues
- edge cases that would still slip through

Use this thinking model:

**Incident → Failure Mode → Rule Coverage → Skill Coverage → Drift / Gap → Exact Remediation**

### 7. Draft a batch remediation package

Produce exact proposed updates that are ready for approval.

Prefer concrete changes such as:
- exact rule wording updates
- exact `conditions_json` changes
- exact trigger/action/autonomy changes
- exact skill instruction additions, removals, or rewrites
- exact new skill proposals when a repeated workflow lacks durable guidance

If uncertainty remains, draft the smallest safe change set that closes the core gap and call out follow-up questions separately.

### 8. Stop at approval

Do not auto-apply changes.
Do not claim that a recommendation is implemented unless it was explicitly executed in a separate approved step.
Operate in proposal mode.

## Mandatory Review Lenses

Apply all of these lenses before finalizing recommendations:

### Direct prevention
What would have prevented this exact incident?

### Adjacent prevention
What closely related incident variants are still possible?

### Systemic governance
What does this reveal about the operating system, not just the local failure?

### Cross-artifact drift
Where do rules, skills, and expectations disagree or leave gaps between them?

### Ambiguity
What wording or workflow ambiguity made failure more likely under pressure?

### Enforcement feasibility
Would the recommendation actually work in practice, or does it depend on perfect human memory?

### Operator burden
Would the fix create excessive friction, alert fatigue, or false positives?

### Edge cases
What happens if inputs are partial, stale, conflicting, missing context, or split across multiple artifacts?

## Required Output

Every run must produce these sections in order.

### 1. Incident Summary
- concise summary of what happened
- available evidence reviewed
- confidence level and major unknowns

### 2. Failure Mode Analysis
Break out:
- direct cause
- contributing causes
- detection failure
- enforcement failure
- procedural failure
- skill/instruction failure
- governance-level failure

### 3. Assessment of Proposed Remediations
For each proposal include:
- what it fixes
- what it misses
- risks introduced
- keep / revise / reject recommendation

### 4. Coverage Gaps and Edge Cases
List the most important gaps the current proposals and current governance still leave open.

### 5. Rules Update Set
For each rule recommendation include:
- rule key or `NEW RULE`
- why change is needed
- exact draft edit
- priority
- expected prevention effect

### 6. Skills Update Set
For each skill recommendation include:
- skill slug or `NEW SKILL`
- why change is needed
- exact draft edit or workflow change
- priority
- expected prevention effect

### 7. Prioritized Remediation Plan
Group into:
- must fix now
- should fix next
- optional hardening

Include a short roadmap for batching the work.

### 8. Exact Draft Edits
Make drafts as implementation-ready as possible.

Examples:
- exact replacement wording
- specific SKILL.md section additions
- precise `conditions_json` updates
- exact trigger/action/autonomy changes

### 9. Validation and Regression Checklist
Include concrete checks such as:
- verify the exact incident path is covered
- test adjacent variants
- verify no rule/skill conflict introduced
- verify operator flow is still workable
- verify no silent approval-boundary bypass
- verify no duplicate or contradictory guidance remains
- verify the change would have prevented or surfaced the incident earlier

### 10. Approval Boundary
End with a clear statement that the package is proposed, not applied.

## Prioritization Heuristics

Prefer recommendations that do one or more of the following:
1. Prevent recurrence of the exact incident
2. Close a broader nearby class of failures
3. Reduce dependence on operator memory
4. Resolve conflict or drift between rules and skills
5. Improve detection earlier in the chain
6. Strengthen enforcement without excessive friction
7. Create durable learning from a one-time incident
8. Reduce repeated cleanup work

When forced to choose, prioritize correctness and prevention leverage over cosmetic cleanup.

## Drafting Rules

- Be specific; avoid vague advice
- Name the exact affected rule or skill
- Explain the prevention logic briefly
- Separate must-fix from nice-to-have
- Prefer small, durable edits over broad process theater
- If evidence is thin, say so directly
- If a recommendation depends on an assumption, label it
- Never present hypothetical edits as already approved

## Edge-Case Prompts

Use these prompts before finalizing:
- What version of this incident would still get through after these fixes?
- What if the incident report itself is incomplete or biased toward one team?
- What if the proposal fixes the symptom but not the trigger?
- What if the rule catches it but the skill still teaches the wrong behavior?
- What if the skill says the right thing but no rule enforces it?
- What if multiple rules partially cover the space but ownership is unclear?
- What if the recommended change creates false positives in adjacent workflows?

## Output Format

Use this structure:

INCIDENT GOVERNANCE REVIEW — [DATE/TIME]

### 1. Incident Summary
- ...

### 2. Failure Mode Analysis
- ...

### 3. Assessment of Proposed Remediations
1. **[Proposal]**
   - Fixes:
   - Misses:
   - Risks introduced:
   - Recommendation:

### 4. Coverage Gaps and Edge Cases
- ...

### 5. Rules Update Set
1. **[Rule Key or NEW RULE]**
   - Why:
   - Draft edit:
   - Priority:
   - Prevention effect:

### 6. Skills Update Set
1. **[Skill Slug or NEW SKILL]**
   - Why:
   - Draft edit:
   - Priority:
   - Prevention effect:

### 7. Prioritized Remediation Plan
**Must fix now**
- ...

**Should fix next**
- ...

**Optional hardening**
- ...

### 8. Exact Draft Edits
- ...

### 9. Validation and Regression Checklist
- [ ] ...

### 10. Approval Boundary
- Proposed only. No changes applied.

## Important Principle

Every serious incident should become durable operating memory.

That means the review must not stop at the incident narrative or its first proposed fix. The skill should search for the smallest governance change set that meaningfully reduces recurrence across the wider system while keeping the operator surface tight.
