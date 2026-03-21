---
name: "Show Priorities"
description: "Show the priority board as a kanban view."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# `show-priorities` — Kanban Priority Board

**Triggers:** "show priorities", "what are our priorities", "priority board"

## Behavior

1. **Read `grok-personal/data/unified_priorities.json`**.
2. **Transform data** to add boolean flags per item based on the `channel` field:
   - `is_client`: `channel` contains 'client'
   - `is_business`: `channel` contains 'business'
   - `is_engineering`: `channel` contains 'engineering'
   - `is_sos`: `channel` contains 'sos'
3. **Render `priority-board` template** using `render_template(source="kai-brain", template="priority-board", data={...})`.
4. **Return rendered HTML** + sortable datatable.

## MCP Tool Calls

- `read_file(filepath="grok-personal/data/unified_priorities.json")`
- `render_template(source="kai-brain", template="priority-board", data=json_data)`

## Data Transformation

Iterate through priorities and append boolean flags:
```json
{
  "priorities": [
    {
      "id": "...",
      "title": "...",
      "channel": "business",
      "is_business": true,
      "is_client": false,
      "is_engineering": false,
      "is_sos": false
    }
  ]
}
```
