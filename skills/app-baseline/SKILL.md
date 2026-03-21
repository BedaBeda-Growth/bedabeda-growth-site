---
name: app-baseline
description: >
  Unified signed baseline workflow for larger apps. Use when verifying Spark
  Kanban, Freely, Rocket, or any app repo that needs a frozen code baseline,
  deterministic diff table, targeted review of risky drift, and an explicit
  human signature before promoting a new baseline. Use during ci-verify,
  release verification, QA closeout, or whenever an agent should compare the
  current app state to an approved baseline, fix or review drift, and only
  update the baseline after approval.
---

# App Baseline

## Primary Commands

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .
```

This is the hard compare against the repo's approved baseline at
`.app-baseline/baseline.json`. It must emit a diff table and fail if unresolved
drift remains.

After the current state is corrected and the drift is intentional, promote the
new baseline only with an explicit approval signature:

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py review --repo-root . --scope-file <scope-file> --label <label>
```

This writes a review ledger under `.app-baseline/reviews/` with Python triage:
- rows Python marked `auto_ok`
- rows Python marked `needs_model_review`
- a paper trail for the model decisions

After the model reviews the flagged rows, record decisions into that ledger:

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py record-review --repo-root . --ledger-file <ledger.json> --path <changed-path> --model-status acceptable --scope-assessment in_scope --notes "<notes>"
```

When all flagged rows are reviewed, finalize the ledger:

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py finalize-review --repo-root . --ledger-file <ledger.json>
```

Only then promote the new baseline with an explicit approval signature:

```bash
APP_BASELINE_SIGNATURE="<approval phrase>" python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py update --repo-root .
```

Then confirm the updated baseline matches:

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .
```

## Baseline Flow

1. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .`
2. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py review --repo-root . --scope-file <scope-file> --label <label>`
3. Let Python auto-clear the low-risk, in-scope rows
4. Review only the rows Python marked `needs_model_review`
5. Record each model decision with `record-review`
6. Run `finalize-review` on the ledger
7. When the result is correct and approved, run `APP_BASELINE_SIGNATURE="<approval phrase>" python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py update --repo-root .`
8. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .` one more time to confirm the new baseline matches

Any compare failure is a drift signal, not a reason to edit the baseline by
hand.

## Diff Review Standard

The Python compare must produce a compact table. The agent reads the table and
only escalates flagged rows; it should not do a full manual repo diff unless the
table points there.

Minimum table columns:

| Column | Meaning |
|---|---|
| `path` | Changed file or surfaced area |
| `change` | added / modified / deleted / renamed |
| `risk` | low / medium / high / critical |
| `tests` | matching test coverage changed: yes / no |
| `verified_by` | current verification coverage that touched this area |
| `review` | yes / no |
| `reason` | short deterministic reason for the flag |

The agent should focus review on rows where any of the following are true:
- `risk` is `high` or `critical`
- `tests` is `no`
- `review` is `yes`
- `verified_by` is empty or obviously incomplete

## CI-Verify Integration

When this skill is used inside `ci-verify`, keep the same simple shape:

1. Run normal verification gates
2. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py review --repo-root . --scope-file <scope-file> --label <label>`
3. Read the review ledger and inspect only the rows Python flagged
4. Record model decisions with `record-review`
5. Run `finalize-review`
6. Ask for the approval signature
7. Run `APP_BASELINE_SIGNATURE="<approval phrase>" python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py update --repo-root .`
8. Re-run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .`

Do not introduce a separate parallel workflow. The baseline check is just one
more signed verification gate.

## Fix Loop

When asked to run or fix baseline verification:

1. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .`
2. Run `review` with the original scope of the PR, fix, or merge batch
3. Read only the rows Python marked `needs_model_review`
4. Fix the code, tests, or verification gaps. Never edit the baseline file by hand
5. Record every model decision with `record-review`
6. Run `finalize-review`
7. When the corrected state is approved, update with the approval signature
8. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .` one more time to confirm the new baseline matches

Completion = baseline compare passes against the approved baseline. Advisory
notes alone are not done.

## Verification Pass

Before calling the work complete:

1. Run `python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/app_baseline.py check --repo-root .` and it must pass
2. Show the review ledger path
3. If the baseline was intentionally updated, show the signed update command that was used
4. List which rows Python auto-cleared and which rows required model review
5. Show behavioral proof from tests or verification output for any high-risk row
6. "File changed" is not proof

## Guardrails

- Never update the baseline without an explicit human approval signature
- Never edit the baseline JSON by hand
- Prefer the deterministic Python compare over an LLM diff read
- Use the LLM only on the rows Python marked `needs_model_review`
- Keep the paper trail in the review ledger so merges and regressions are auditable later
- Keep the operator interface simple: compare, review, record, finalize, signed update, re-compare
