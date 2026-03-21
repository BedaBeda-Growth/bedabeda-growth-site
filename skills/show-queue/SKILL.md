---
name: "Show Queue"
description: "Show the director queue with task statuses."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# `show-queue` — Director Queue Status

**Triggers:** "show queue", "director queue", "what's dispatched"

## Behavior

1. **Call `read_director_queue()` MCP tool**.
2. **Transform output** to the `director-queue` template data shape.
3. **Render `director-queue` template** using `render_template(source="kai-brain", template="director-queue", data={...})`.
4. **Return rendered HTML.**

## MCP Tool Calls

- `read_director_queue()`
- `render_template(source="kai-brain", template="director-queue", data=json_data)`

## Data Transformation

```json
{
  "tasks": [
    {
      "id": "t001",
      "status": "running",
      "label": "Fix auth redirect",
      "repo": "app"
    }
  ],
  "count": 1
}
```
