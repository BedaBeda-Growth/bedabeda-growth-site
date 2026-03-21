---
name: review-work
description: "Compare completed work in a thread against the plan it's executing on. Use when an agent (Jules, Antigravity, or Kai) has finished a task and needs verification before marking done or handing to human QA. Checks — (1) rule compliance across all domains the work touches, (2) full AC coverage — every acceptance criterion explicitly met with no gaps, (3) self-verification quality — proof is measurable (test output, query result, API response, screenshot) not prose-only. Human QA is a final polishing layer — LLMs must get the work to functional and verified first. Triggers on — review this work, check against the plan, does this meet the AC, self-verify, QA check, verify before done, is this complete, review before merge."
---

# Review Work

Verify completed work against its backing plan. Produce a structured verdict. Human QA is polish — not primary validation.

## Step 0: Check Objectives

Before reviewing, confirm: does the work advance a North Star? If the work itself doesn't serve a North Star, flag it before checking if it was done correctly. Reviewing perfectly-executed irrelevant work is waste.

## Step 1: Load the Plan

Identify the backing plan from one of:
- File path the user provides
- `plans/*.md` referenced in the thread
- Jules task card or work ledger item with acceptance criteria
- Plan section embedded in the thread

**If no plan is identifiable: STOP.** Ask which plan this work supports. A review without a plan is just vibes.

## Step 2: Rule Compliance Check

Identify which domains the work touches: `ops`, `deploy`, `email`, `payments`, `engineering`, `identity`.

Call `check_rule_hits(domain=X)` for each domain, or read `AGENT-RULES.md` to enumerate applicable rules.

**Any rule violation = BLOCK. Work cannot pass review with active rule violations.**

Common rules to check for engineering/deploy work:
- `ops-ai-work-must-self-verify` — is this review itself completing that requirement?
- `deploy-structural-gates-required` — if deploy-touching, were gates run?
- `ops-agent-must-update-ledger` — is ledger update included in the work?
- `deploy-no-groq-in-prod` — if AI/model work touched

## Step 3: AC Coverage Map

List every acceptance criterion from the plan. For each:

```
AC: [criterion text]
MET: YES / NO / PARTIAL
PROOF: [specific output — file path + line, test output, query result, API response, screenshot]
```

**Gaps = incomplete work.** PARTIAL with no proof = NO.

If the plan has no AC section: check if `plan-structural-ac` rule was violated upstream. Flag it, then derive implicit AC from the plan's objective statement.

## Step 3.5: User-Facing Item Gate (MANDATORY for rocket/app/rv repos)

If the work item's repo is `rocket`, `app`, or `rv`, it is user-facing by default. User-facing items MUST have at least one **Gold-tier** proof (see Step 4 below). Code diffs alone → automatic **❌ FAIL**.

Before proceeding to Step 4, classify:
- `USER_FACING = true` → requires Gold-tier proof
- `USER_FACING = false` → standard proof is sufficient

Rule: `ops-live-functionality-required`

## Step 4: Self-Verification Quality

Score each proof against this standard:

| Proof Type | Verdict |
|---|---|
| Browser screenshot of live feature working in staging/prod | 🥇 Gold — Verified |
| HTTP response from deployed staging/prod endpoint | 🥇 Gold — Verified |
| Database query showing expected state in staging/prod | 🥇 Gold — Verified |
| Terminal output from a running instance (not just build) | 🥇 Gold — Verified |
| Test output / CI pass with specific assertion | ✅ Verified |
| API response with status + body (local) | ✅ Verified |
| SQL query result / Supabase row | ✅ Verified |
| Specific code diff with line reference | ✅ Verified |
| Code diff without runtime proof (for USER_FACING items) | ⚠️ Partial — requires Gold proof |
| "I updated the file" (prose only) | ❌ Unverified |
| "Should work" / "looks correct" / "I believe" | ❌ Unverified |
| "Tests pass" with no output shown | ❌ Unverified |

**Gold-tier rule:** If `USER_FACING = true` (from Step 3.5), the work MUST have at least one 🥇 Gold proof. Zero Gold proofs for a user-facing item → automatic **❌ FAIL** regardless of how many ✅ Verified proofs exist.

Flag every unverified claim. These represent work that requires a human to confirm — which is what we're eliminating.

## Step 5: Verdict

### ✅ PASS — Ready for Human Polish
- No rule violations
- All AC met with verified proof
- Zero unverified prose claims

### ⚠️ CONDITIONAL PASS — Minor Gaps
- No rule violations
- All *critical* AC met with verified proof
- Non-critical AC partial or prose-only
- List specific items for human reviewer to check

### ❌ FAIL — Return to Agent
Triggered by any of:
- Rule violation
- Critical AC not met
- 2+ unverified prose claims
- Missing ledger update
- **User-facing work item with zero Gold-tier proof** (rule: `ops-live-functionality-required`)
- Work marked "done" without evidence the feature works in a running environment

Include a structured list of **exactly what must be fixed** before re-review.

## Step 6: Update Work Ledger

After verdict:
- **PASS** → mark ledger item `verified`, set `verified_by: kai`
- **CONDITIONAL** → keep `in_progress`, add note with conditional items
- **FAIL** → keep `in_progress`, add sub-items for each required fix

## Output Format

```
## Work Review: [plan/task name]

**Verdict:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL

### Rule Compliance
- [domain]: PASS / VIOLATION: [rule_key] — [what was violated]

### AC Coverage
| # | Criterion | Met | Proof |
|---|-----------|-----|-------|
| 1 | ... | YES | [specific evidence] |
| 2 | ... | NO  | [no proof found / what's missing] |

### Verification Quality
- ✅ [criterion] — [proof type]
- ❌ [criterion] — prose only, needs: [what would verify it]

### Required Fixes (if FAIL or CONDITIONAL)
1. [Exact fix needed]
2. [Exact fix needed]
```
