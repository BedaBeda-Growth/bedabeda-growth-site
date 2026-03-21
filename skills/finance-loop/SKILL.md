---
name: Finance Improvement Loop
description: Iterative loop for building and verifying finance tooling. Kai builds Python tools, GPTOSS validates structure via binary-only API calls, no data ever crosses the boundary. Loop continues until all checks pass.
ruleDomains:
  - ops
---

# Finance Improvement Loop

## When to Use This Skill

Use this skill whenever working on `accounting-robot/` — adding tools, fixing handlers, updating the verify endpoint, or debugging reconciliation logic. The loop ensures no finance data leaks to any external model while still getting structural validation.

## The Loop

```
1. Kai reads current tool inventory
      ↓
2. Kai builds / modifies Python tools in accounting-robot/
      ↓
3. Start server: python3 accounting-robot/finance_chat.py
      ↓
4. GPTOSS calls tools via /api/verify — receives BALANCED / NOT_BALANCED only
      ↓
5. GPTOSS returns structural feedback (no values, no data)
      ↓
6. Kai adjusts tooling based on structural feedback
      ↓
7. Repeat from step 3 until GPTOSS confirms all checks pass
      ↓
8. Verify acceptance criteria → mark ledger item done
```

## Hard Rules — Never Violate

- `~/.finance/` is **OFF-LIMITS** — no reads, no writes, no path references from Kai
- GPTOSS **never receives**: raw balances, transaction amounts, merchant names, account numbers, dates paired with amounts
- GPTOSS **only receives**: function/tool names, schema shapes (field names only), BALANCED/NOT_BALANCED result codes, Python error messages (KeyError, TypeError, etc.)
- `/api/verify` response contains **only** `result` and `year` — `delta` is intentionally omitted
- All GPTOSS feedback must be **structural only**: logic gaps, missing edge cases, wrong field names

## What GPTOSS Can Say Back to Kai

- "BALANCED — structure looks correct"
- "NOT_BALANCED — income + expenses don't sum to net, likely a sign convention issue"
- "The reconcile_year tool is missing an edge case for months with no transactions"
- "tax_category_totals doesn't handle the 'Uncategorized' bucket correctly"
- "annual_income_statement returns expenses as negative — confirm sign convention is consistent"

## What GPTOSS Cannot Say Back to Kai

- Any dollar amount or numeric value
- Any merchant name or vendor
- Any account name or number
- Any date paired with a value
- Any content from `~/.finance/`

## Logging Boundary

| Log | Path | Kai Can Read? | Contents |
|-----|------|---------------|----------|
| GPTOSS full chat log | `~/.finance/gptoss_chat_log.json` | **NO** | GPTOSS reasoning, analysis, full responses |
| Activity log | `accounting-robot/logs/gptoss_activity.jsonl` | **YES** | `ts`, `tool`, `result`, `duration_ms` only |

Kai uses the activity log to confirm the loop ran. Nothing more.

## Key Files

| File | Role |
|------|------|
| `accounting-robot/finance_tools.py` | Tool definitions (TOOLS list) + handler functions + `_HANDLERS` dict |
| `accounting-robot/finance_chat.py` | Flask server, `/api/verify` endpoint, `_log_activity()` helper |
| `accounting-robot/src/analytics/engine.py` | `AnalyticsEngine` — `monthly_rollup(year, month)` is the core data method |
| `accounting-robot/src/analytics/queries.py` | Raw SQL query functions used by the engine |
| `accounting-robot/logs/gptoss_activity.jsonl` | Activity log (created on first verify call) |

## Current Tool Inventory (as of Mar 8 2026)

**Monthly / search (original 14):**
get_monthly_summary, search_transactions, compare_periods, get_spending_trend, get_burn_rate, get_top_merchants, get_recurring_charges, get_anomalies, check_budget, get_ar_summary, get_ap_summary, get_accounts, get_db_stats, prepare_payroll

**Annual / tax (added Mar 8 2026):**
annual_income_statement, tax_category_totals, reconcile_year

## Session Flow

**Start:**
1. Read `accounting-robot/finance_tools.py` to confirm current tool inventory
2. Read `accounting-robot/finance_chat.py` routes to understand current endpoints

**Build:**
3. Add/modify tools following existing `_tool_*` handler patterns
4. All new tools: add to `TOOLS` list AND add handler AND register in `_HANDLERS`

**Verify:**
5. Check `POST /api/verify {"income": 100, "expenses": 70, "net": 30}` → `{"result": "BALANCED"}`
6. Check `POST /api/verify {"income": 100, "expenses": 70, "net": 10}` → `{"result": "NOT_BALANCED"}`
7. Check `accounting-robot/logs/gptoss_activity.jsonl` has new entries

**Close:**
8. All acceptance criteria met → `update_work_ledger(item_id, "verify")` to close the ledger item
