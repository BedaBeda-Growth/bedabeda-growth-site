---
name: ingest-feedback
description: >
  Ingest a pasted feedback document into a repo's QA system. Extracts discrete, testable rules from
  unstructured feedback (client notes, review comments, QA observations), appends them to the repo's
  qa-rules.md file, and saves the full feedback with rule mappings to a dated markdown log
  (feedback/YYYY-MM-DD.md). Use when someone pastes feedback, review notes, or client comments into
  chat and wants to: (1) convert feedback into QA rules, (2) detect repeated issues by scanning prior
  feedback logs, (3) trigger a QA-loop regression audit when repeats occur, (4) build a traceable
  record of what was flagged, (5) verify during the next QA loop that all items were addressed.
metadata:
  ruleDomains:
    - ops
    - qa
---

# Ingest Feedback

## Step 0 — Objectives Check

Before doing anything:
- Does this feedback apply to a specific repo? If not clear, ask: "Which repo is this feedback for?"
- Is there an active QA scan system (e.g. `rv_qa_scan.py`)? If so, note it — extracted rules should be compatible with how that scanner reads `qa-rules.md`.
- Read `references/qa-rules-schema.md` to confirm file format expectations before writing anything.

---

## Step 1 — Read Existing State

```bash
# Check if qa-rules.md already exists
ls {repo}/qa/qa-rules.md 2>/dev/null || ls {repo}/qa-rules.md 2>/dev/null
```

If it exists, read it to:
- Know the highest current QR-NNN ID (to assign next IDs correctly)
- Avoid proposing rules that already exist

---

## Step 2 — Repeat Detection (Mandatory)

Before creating new rules, check whether each feedback item is a repeat.

1. Scan historical feedback logs:

```bash
ls -1 {repo}/feedback/*.md 2>/dev/null | tail -n 50
```

2. For each new feedback line, search historical logs and `qa-rules.md` for semantic matches
   (same issue phrased differently still counts as a repeat):

```bash
rg -n -i "keyword1|keyword2|exact phrase" {repo}/feedback {repo}/qa/qa-rules.md
```

3. Classify each item:
- `new` — no prior match
- `repeat-open` — matched prior item still unresolved/partial
- `repeat-regression` — matched prior item was marked addressed/green but reoccurred

4. Store this classification in your working mapping for each feedback item.

Rule:
- If item is `new`, create/append rule as normal.
- If item is `repeat-open` or `repeat-regression`, do **not** blindly add a duplicate rule. Audit the QA loop first.

---

## Step 3 — Extract Rules from Feedback

For each discrete issue in the feedback document:

1. Write **one testable rule** per issue in imperative form: `"X must be Y"` or `"No X anywhere"`
2. Assign severity: `error` (must fix before review) or `warning` (should fix)
3. Include exact expected values where possible (phone numbers, colors, copy text, URLs)
4. Map each raw feedback item → the rule it generates

**Good rules:**
- `Phone number must be (973) 555-0100 on all pages`
- `CTA button text must be "Get Emergency Help" or "Call Now"`
- `No lorem ipsum text anywhere`

**Bad rules (too vague to test):**
- ~~`Make it look better`~~
- ~~`Fix the phone issue`~~

Build two JSON arrays:
- `rules`: `[{"rule": "...", "severity": "error|warning"}, ...]`
- `feedback_items`: `[{"raw": "original feedback text", "rule_id": "QR-NNN", "repeat_status": "new|repeat-open|repeat-regression"}, ...]`

> Rule IDs in `feedback_items` should match what `save_feedback.py` will assign. If you're unsure, use placeholder IDs — the script assigns real IDs sequentially.

---

## Step 4 — Repeat Audit Gate (Mandatory For Repeats)

If any item is `repeat-open` or `repeat-regression`, run a QA-system audit before finalizing rule additions.

Minimum audit checklist:
1. Confirm the expected rule exists in `qa-rules.md` and is testable/measurable.
2. Confirm the rule is wired into active QA execution (`qa-rules.json`/scanner path and `npm run qa:gate` path).
3. Run the unified QA gate and capture the outcome:
   - `npm run qa:gate`
4. Determine root cause:
   - rule missing
   - rule too vague/non-deterministic
   - rule exists but not executed by active gate
   - auto-remediation masked detection
   - false pass / threshold misconfiguration
5. Patch the system first (rule wiring, scanner logic, gate thresholds, fixer behavior), then continue ingestion.

Non-negotiable policy:
- A repeat after a previously "green" state is a **system failure**, not just a content miss. Treat it as QA loop hardening work.

---

## Step 5 — Run save_feedback.py

```bash
python3 {skill_dir}/scripts/save_feedback.py \
  --repo-path /path/to/repo \
  --rules '<rules JSON>' \
  --raw-feedback '<full original feedback text>' \
  --source '<slug label, e.g. client-review-r1>' \
  --feedback-items '<feedback_items JSON>'
```

The script:
- Appends new rules to `qa-rules.md` (creates file + `qa/` dir if needed)
- Skips exact duplicates (case-insensitive, severity-prefix-agnostic)
- Writes `feedback/YYYY-MM-DD.md` with the raw feedback table

`{skill_dir}` resolves to:
- `~/.agents/skills/ingest-feedback/` (global)
- `~/scceo-1/skills/ingest-feedback/` (workspace)

Script outputs JSON summary:
```json
{
  "status": "ok",
  "rules_file": "/path/to/qa/qa-rules.md",
  "rules_added": 3,
  "rules_skipped_duplicate": 1,
  "feedback_file": "/path/to/feedback/2026-03-16.md",
  "feedback_items": 3
}
```

---

## Step 6 — Confirm Output

Show the user:
1. The new rules added to `qa-rules.md` (rule ID + text for each)
2. Path to the dated feedback file
3. Count of duplicates skipped (if any)
4. Repeat audit summary (if repeats found): repeated items, root cause, and what QA-system patch was applied
5. Reminder: `"Run the QA loop to verify these rules pass. Use [skill:run-qa-loop] or python3 qa/rv_qa_scan.py"`

---

## QA Loop Integration

When `run-qa-loop` runs for the same repo after feedback was ingested:

1. Read `qa/qa-rules.md` — rules become part of scan criteria
2. After scan completes — check the latest `feedback/YYYY-MM-DD.md` for `⏳ pending` items
3. For each pending item: evaluate if the associated rule now passes
4. Update statuses: `⏳ pending` → `✅ addressed` (or `🔄 partial` / `❌ wont-fix`)
5. Append a **Feedback Closure** section to the QA report

If any `repeat-regression` item exists:
6. Include a **Regression Audit** subsection:
   - previous occurrence date(s)
   - why QA passed before despite issue
   - exact system-level fix added to prevent recurrence

See `references/qa-rules-schema.md` for file formats, status values, and the Feedback Closure section format.

---

## File Format Reference

See `references/qa-rules-schema.md` for:
- `qa-rules.md` column definitions and location logic
- `feedback/YYYY-MM-DD.md` format and status values
- QA loop integration details and Feedback Closure section format
- Rule ID allocation and deduplication logic
