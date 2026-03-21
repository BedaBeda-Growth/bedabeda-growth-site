---
name: "Show Ledger"
description: "Show the work ledger with nag list and status breakdown."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# `show-ledger` — Work Ledger Dashboard

**Triggers:** "show ledger", "work ledger", "what's pending"

## Behavior

1. **Call `check_work_ledger()` MCP tool**.
2. **Transform output** to match the `work-ledger` template data shape.
3. **Render `work-ledger` template** using `render_template(source="kai-brain", template="work-ledger", data={...})`.
4. **Return rendered HTML** + nag items as datatable.

## MCP Tool Calls

- `check_work_ledger()`
- `render_template(source="kai-brain", template="work-ledger", data=json_data)`

## Data Transformation

Map `check_work_ledger()` output fields to template context:
```json
{
  "stats": {
    "total": 10,
    "nag_count": 2,
    "stale_count": 1
  },
  "nag_list": [...],
  "status_breakdown": [...]
}
```
