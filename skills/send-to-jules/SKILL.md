---
name: "Send to Jules"
description: "Use Google Jules CLI (only) to launch remote coding sessions from approved deep plans, then track session IDs and pull results. Marks ledger items as with_jules immediately upon dispatch."
ruleDomains:
  - ops
  - deploy
---

## Pre-Dispatch Memory Check (MANDATORY)

Before dispatching ANY Jules session, pull memory context and include it in the prompt:

```bash
python3 ~/scceo-1/openviking/scripts/pre_plan_memory.py \
  --domain "{relevant domain}" \
  --title "{plan title or task description}" \
  --format markdown
```

If the output contains:
- **Similar Resolved Work** — include in the dispatch prompt so Jules starts from prior fixes, not zero
- **Do Not Retry items** — include as explicit constraints: "DO NOT attempt: {list}"
- **Rule patterns** — include as guardrails

Append the memory brief to the Jules prompt under a `## Prior Context (from memory)` section.
If memory returns "No prior memory found" — no constraint, proceed normally.

**Rule:** `ops-memory-before-plan` (simulate)

---

After dispatching a Jules session, ALWAYS update the work ledger:
1. Call `update_ledger_item(item_id, "update_status", "with_jules")`
2. Call `update_ledger_item(item_id, "add_note", "Session ID: <session_id> | URL: <job_url>")`

The Jules poller (cloud/jules_poller.py) will then autonomously monitor the session status, log decisions, and surface stall alerts to chat.

**Reporting Poller:** Ensure `persistent_reporting_poller.py` is running in the background so that `data/persistent_report.json` is updated every 5 minutes with live counts of active Jules sessions, open PRs, and outstanding ledger items. Start it if not already running:
```bash
pgrep -f persistent_reporting_poller.py || python3 ~/scceo-1/grok-personal/persistent_reporting_poller.py &
```