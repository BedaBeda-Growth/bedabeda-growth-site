---
name: "Update Plan"
description: "Incorporate reviewer feedback from the current thread into an existing plan file, apply every improvement, then verify all feedback was addressed before re-presenting. Use when: a plan received a ''B — address the feedback'' verdict from review-plan; Nick says ''update the plan with this feedback'', ''apply the feedback'', ''incorporate their notes'', ''revise the plan''; or when review comments from any source need to be systematically integrated into a plan document."
ruleDomains:
  - ops
---

# Update Plan

Use this skill when a plan has received feedback (from `review-plan`, Nick, or another agent) and the plan needs to be revised and re-verified before execution.

**This skill is the feedback → plan → verified loop.** It ensures every piece of feedback is tracked, applied, and checked before the plan is re-presented.

---

## Step 0 — Ledger Entry (Rule Zero)

Confirm a work ledger entry maps to this plan update. If none exists:
```
AUTO-{YYYYMMDD}-update-plan-{slug}
```
Announce which ledger entry this update maps to.

---

## Step 1 — Locate the Plan and Feedback

### 1a. Find the plan file

Check:
```bash
ls ~/scceo-1/plans/ | grep "{slug}"
```

If the plan doesn't exist as a file → stop. Ask Nick to point to the plan location. Plans must exist as files — chat is ephemeral and can't be referenced.

### 1b. Extract all feedback from the thread

Scan the current conversation for all feedback. Sources include:
- `review-plan` B-verdict pointed feedback list
- Nick's direct comments or corrections
- Another agent's review output
- Inline comments from a PR or doc review

**Enumerate every piece of feedback into a numbered list:**

```
FEEDBACK EXTRACTED:
  [1] {exact feedback item — verbatim if source is review-plan}
  [2] {exact feedback item}
  [3] {exact feedback item}
  ...
```

Do not paraphrase unless the source was prose. Verbatim extraction prevents feedback drift.

**Never proceed if fewer than 1 feedback item is found.** If zero feedback items are found, tell Nick the thread doesn't contain actionable feedback — ask them to paste it.

---

## Step 2 — Categorize Each Feedback Item

For each extracted feedback item, classify:

| # | Feedback | Category | Priority |
|---|---|---|---|
| 1 | {item} | MISSING / WRONG / WEAK / REDUNDANT / UNCLEAR | HIGH / MEDIUM / LOW |

**Categories:**
- `MISSING` — required section or step doesn't exist in the plan
- `WRONG` — plan has incorrect information, target, or logic
- `WEAK` — exists but is too vague, hand-wavy, or skips a verification step
- `REDUNDANT` — duplicate work, old work already done, unnecessary complexity
- `UNCLEAR` — correct intent but needs rewording or concrete spec

**Priority:**
- `HIGH` — plan cannot proceed correctly without this fix (e.g. missing verification, wrong system targeted)
- `MEDIUM` — plan will likely succeed but with risk or drift (e.g. weak sequencing)
- `LOW` — quality improvement, not blocking (e.g. wording clarity)

---

## Step 3 — Read the Current Plan

Read the full plan file now.

For each feedback item, identify the exact section(s) in the plan that the feedback addresses. If a feedback item maps to NO section → it is a MISSING item that requires a new section.

Build a mapping:

```
FEEDBACK → PLAN MAP:
  [1] {feedback} → Section: {section name or "NOT FOUND — must add"}
  [2] {feedback} → Section: {section name or "NOT FOUND — must add"}
```

---

## Step 4 — Apply Changes

Apply each change to the plan file, HIGH priority first.

For each item, write:

```
APPLYING [1]: {feedback summary}
  Action: {what you changed / added / removed}
  Location: {section and line if relevant}
  Done: YES
```

**Guardrails while editing:**
- Do NOT remove sections that were not flagged in feedback — only touch what the feedback addresses
- If a feedback item conflicts with another section of the plan that was not flagged, note the conflict and surface it instead of silently resolving it
- Preserve the verbatim section from `NICK SAID` if it exists — context anchors must not be changed
- If adding a new section to satisfy `MISSING` feedback, place it in the correct order relative to the `make-a-plan` structure

---

## Step 5 — Verify Coverage

After all changes are applied, run the verification pass:

```
FEEDBACK COVERAGE CHECK:
  [1] {feedback verbatim} → ADDRESSED: {yes/no} — {evidence: quote from plan or section added}
  [2] {feedback verbatim} → ADDRESSED: {yes/no} — {evidence}
  ...

  UNADDRESSED ITEMS: {count}
  If count > 0: STOP. List unaddressed items. Attempt to resolve before presenting to Nick.
```

**Do not present the updated plan if any HIGH-priority item is unaddressed.**

---

## Step 6 — Run the Plan Linter (if available)

```bash
python3 ~/scceo-1/skills/make-a-plan/scripts/vet_plan.py ~/scceo-1/plans/{slug}-plan.md
```

If `❌ PLAN REJECTED` — fix the rejection before presenting. If the script is not available, skip and note it.

---

## Step 7 — Present the Updated Plan

Show Nick:

1. **Feedback applied** — the numbered list with ADDRESSED/UNADDRESSED status
2. **What changed** — brief summary of each modification
3. **What did NOT change** — one-line confirmation that untouched sections were preserved
4. **Unresolved items** — any feedback that couldn't be fully addressed, with a specific question
5. **Plan status** — `READY FOR APPROVAL` or `NEEDS INPUT: [questions]`

Do not dump the entire plan unless Nick asks. Lead with the coverage report, then offer to show the full plan.

---

## Anti-Patterns

❌ **Paraphrasing feedback** — always work from verbatim; paraphrased feedback drifts from the source intent
❌ **Applying feedback without tracking it** — every item gets a ADDRESSED/UNADDRESSED entry
❌ **Silently merging conflicts** — flag conflicts instead of picking a winner without telling Nick
❌ **Removing untouched sections** — only change what feedback explicitly targeted
❌ **Presenting with unresolved HIGH items** — block until HIGH items are resolved
❌ **Using chat instead of a file** — the plan must live in a file

---

## Variants / Absorbed Modes

### --recheck
Re-run Steps 5–7 only (coverage check + present), without re-applying feedback. Use when changes were made manually and you want to confirm coverage.
*(absorbed: verify-feedback-coverage)*