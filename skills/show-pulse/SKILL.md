---
name: "Show Pulse"
description: "Show system health indicators."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# `show-pulse` — System Health Pulse

**Triggers:** "show pulse", "system health", "how are we doing"

## Behavior

1. **Gather health data** from available MCP tools:
   - `kai_warm_start()` (revenue, warnings)
   - `check_work_ledger()` (unverified items, stale items)
   - `check_heartbeat()` (active run, queue depth)
2. **Build `indicators` array** with `name`, `status` (green/yellow/red), `value`, and `icon`.
3. **Add boolean flags** `is_green`, `is_yellow`, `is_red` to each indicator.
4. **Render `system-pulse` template** using `render_template(source="kai-brain", template="system-pulse", data={...})`.
5. **Return rendered HTML.**

## MCP Tool Calls

- `kai_warm_start()`
- `check_work_ledger()`
- `check_heartbeat()`
- `render_template(source="kai-brain", template="system-pulse", data=json_data)`

## Data Transformation

### Indicators Example
```json
{
  "indicators": [
    {
      "name": "Heartbeat",
      "status": "green",
      "value": "Active",
      "icon": "activity",
      "is_green": true
    },
    {
      "name": "Work Ledger",
      "status": "yellow",
      "value": "3 stale",
      "icon": "clipboard-list",
      "is_yellow": true
    }
  ]
}
```
