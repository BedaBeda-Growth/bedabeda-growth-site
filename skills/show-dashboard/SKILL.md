---
name: "Show Dashboard"
description: "Show the combined command center dashboard with morning briefing, top priorities, and system pulse."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# `show-dashboard` — Combined Command Center Dashboard

**Triggers:** "show dashboard", "show me everything", "status", "what's going on"

## Behavior

1. **Call `kai_warm_start()` MCP tool** to extract revenue pulse, warnings, priorities, ships, and team chat.
2. **Transform data** for `morning-briefing` template.
3. **Render `morning-briefing` template** using `render_template(source="kai-brain", template="morning-briefing", data={...})`.
4. **Call `check_work_ledger()` MCP tool** to get the latest task status.
5. **Extract top 5 items** and render as a datatable.
6. **Gather health indicator data** from MCP tools (warm start, work ledger, heartbeat).
7. **Render `system-pulse` template** with health indicator data.
8. **Return rendered HTML blocks inline.**

## MCP Tool Calls

- `kai_warm_start()`
- `check_work_ledger()`
- `check_heartbeat()`
- `render_template(source="kai-brain", template="morning-briefing", data=json_data)`
- `render_template(source="kai-brain", template="system-pulse", data=json_data)`

## Data Transformation

### Morning Briefing Data Shape
```json
{
  "revenue_pulse": "...",
  "critical_warnings": [...],
  "top_priorities": [...],
  "team_chat": [...]
}
```

### System Pulse Data Shape
```json
{
  "indicators": [
    {
      "name": "Revenue Gate",
      "status": "green",
      "value": "Locked",
      "icon": "shield-check",
      "is_green": true
    },
    ...
  ]
}
```
