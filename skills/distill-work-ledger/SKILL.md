---
name: "Distill Work Ledger"
description: >
  Daily work ledger consolidation: deduplicates (exact + fuzzy), urgency-scores,
  and suggests merges/archival across the backlog. Python does 90-95% deterministically.
  Run before plan-and-prioritize to ensure dispatch jobs only hit unique, high-value,
  well-prepared items.
ruleDomains:
  - ops
---

# Distill Work Ledger — Daily Backlog Consolidation

Run `python3 ~/scceo-1/grok-personal/scripts/distill_work_ledger.py` before plan-and-prioritize.

## Quick Start
- Dry-run: `python3 distill_work_ledger.py`
- Apply exact dupes: `python3 distill_work_ledger.py --apply`
- Top 50 ranked: `python3 distill_work_ledger.py --top 50`
- JSON report: `python3 distill_work_ledger.py --report out.json`

Pure Python, stdlib only. See full SKILL.md in filesystem for complete workflow.