# QA Rules Schema Reference

## `qa-rules.md` — Location

Check in order:
1. `{repo}/qa/qa-rules.md` ← preferred (used by Renovio QA scanner)
2. `{repo}/qa-rules.md` ← fallback root
3. Create at `{repo}/qa/qa-rules.md` if neither exists

---

## `qa-rules.md` Format

```markdown
# QA Rules

| ID | Rule | Repo | Source | Date Added | Status |
|----|------|------|--------|------------|--------|
| QR-001 | [ERROR] Phone number must be (973) 555-0100 on all pages | rv | client-review-r1 | 2026-03-16 | active |
| QR-002 | [WARNING] No lorem ipsum text anywhere | rv | client-review-r1 | 2026-03-16 | active |
| QR-003 | CTA button text must be "Get Emergency Help" or "Call Now" | rv | nick-review | 2026-03-18 | active |
```

### Columns

| Column | Values | Notes |
|--------|--------|-------|
| `ID` | `QR-NNN` | Sequential, never reused |
| `Rule` | Plain English, testable | Prefix `[ERROR]` or `[WARNING]` for severity |
| `Repo` | repo folder name | `rv`, `rocket`, `app`, etc. |
| `Source` | slug label | `client-review-r1`, `nick-qa`, `post-launch` |
| `Date Added` | `YYYY-MM-DD` | When rule was ingested |
| `Status` | `active` / `retired` | Retired = no longer checked |

### Rule Writing Guidelines

- Write in testable, imperative form: "X must be Y" or "No X anywhere"
- One rule per discrete issue — don't combine multiple issues into one rule
- Avoid vague rules: ~~"Make it look better"~~ → "H1 font size must be 56px on hero sections"
- Include the exact expected value when possible: phone numbers, colors, copy text

---

## `feedback/YYYY-MM-DD.md` Format

```markdown
# Feedback — 2026-03-16

**Source:** client-review-round-1

| # | Raw Feedback | Extracted Rule ID | Status |
|---|--------------|-------------------|--------|
| 1 | "The phone number on the about page shows (973) 555-9999 — should be (973) 555-0100" | QR-001 | ⏳ pending |
| 2 | "There's still placeholder text in the footer on the commercial page" | QR-002 | ⏳ pending |
| 3 | "The emergency button says 'Click Here' — can it say 'Get Emergency Help'?" | QR-003 | ⏳ pending |
```

### Status Values

| Symbol | Meaning |
|--------|---------|
| `⏳ pending` | Rule exists, not yet verified as fixed |
| `✅ addressed` | QA loop confirmed fix is in place |
| `❌ wont-fix` | Acknowledged, intentionally not addressed (add note in same cell) |
| `🔄 partial` | Partially addressed, follow-up needed |

---

## QA Loop Integration

When `run-qa-loop` executes for a repo:

1. **Read `qa/qa-rules.md`** at the start — rules become part of scan criteria
2. **After scan** — for each `⏳ pending` item in the latest `feedback/YYYY-MM-DD.md`:
   - If the associated rule ID now passes → update status to `✅ addressed`
   - If still failing → leave as `⏳ pending`, include in scan report
3. **Report format addition** — append a "Feedback Closure" section to the QA report:

```markdown
## Feedback Closure — 2026-03-16

| Rule ID | Raw Feedback | Status |
|---------|--------------|--------|
| QR-001 | Phone number on about page | ✅ addressed |
| QR-002 | Lorem ipsum in footer | ⏳ still failing |
```

---

## Rule ID Allocation

- IDs are global per repo, not per feedback session
- `save_feedback.py` reads the current `qa-rules.md` to determine the next available ID
- Never manually reuse or renumber IDs — gaps are fine

---

## Deduplication Logic

`save_feedback.py` skips a rule if a rule with the same text (case-insensitive, trimmed) already exists in `qa-rules.md`. When rules from different feedback sessions overlap:
- First ingestion wins the ID
- Later duplicate is silently skipped (reported in summary output)
- To update an existing rule, manually edit `qa-rules.md` — don't re-ingest
