---
name: plan-qa
description: "Feedback-driven QA loop for the Renovio (rv) site. Ingests a feedback document, triages every item into content fixes vs QA rules vs both, executes fixes with hard proof for each, and produces a line-by-line coverage report against the feedback file before anything is called done. Use when Nick gives feedback (verbally or via a feedback/YYYY-MM-DD.md file), when running a QA loop after feedback, when verifying that previous feedback was fully addressed, or when asked to 'run QA', 'ingest feedback', 'check if feedback is done', or 'plan-qa'."
---

# plan-qa

Three-gate feedback loop. Nothing is done until the feedback file itself reaches 100% [x].

## Gate 1 — Triage (before any execution)

Read the feedback file (feedback/YYYY-MM-DD.md or user-pasted content).

For every item, produce a triage row:

| Item | Type | File | Selector / Line | Rule ID |

Types:
- content-fix — a specific string/element/structure needs to change in an HTML file. Must include exact file + line or grep pattern.
- qa-rule — a pattern that should never appear on any page. Must include the exact DOM selector or regex that will test it.
- both — needs a content fix AND a rule to prevent regression.

Stop before executing anything if an item has no identifiable selector or file, or if an item is ambiguous.

## Gate 2 — Execute + Verify (one item at a time)

For each content-fix or both item:
1. Make the change
2. Produce terminal proof — grep output or DOM query showing old content gone, new content present
3. Mark the item [x] in the feedback file only after that proof is captured

For each qa-rule or both item:
1. Write the rule expression
2. Before adding to qa-rules.json, test it: run against a page WITH the violation (must return false), run against a clean page (must return true)
3. Only add to qa-rules.json after both tests pass

## Gate 3 — Coverage Report (before calling anything done)

Run python3 qa/ac_validator.py and npm run qa:visual.

Then produce a feedback coverage report listing every item with Status and Proof columns.

Only call the work done when every item has Done with a proof column entry.

## Key Rules

- Never mark an item done without terminal proof.
- Rules are only valid if they fire on a real violation.
- The feedback file is the contract — unchecked boxes = not complete.
- One item at a time for content fixes.