---
name: "SOS Priority Pulse"
description: "Check SOS product board and bug priority sync health — verifies the full pipeline from SOS intake through work ledger to sprint execution"
requiredSources:
  - kai-brain
alwaysAllow:
  - "Bash"
  - "Read"
  - "Grep"
ruleDomains:
  - ops
---

# SOS Priority Pulse Check

Run a comprehensive health check on the SOS → Work Ledger → Sprint pipeline. This skill verifies that product board priorities and bug reports are flowing correctly from the team's SOS boards into the engineering work ledger.

## Objective Alignment (Mandatory)
In addition to pipeline health, verify objective coverage:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Flag SOS or bug clusters that are high priority but not mapped to an objective
- Ask **"What's the objective here?"** for any major unmapped cluster
- If a recurring unmapped pattern appears, add a proposed entry to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`
- Include objective-coverage notes in the final summary

## What to Check (in order)

### 1. Pipeline Health (System Pulse)

Run the pipeline health check from system_pulse.py:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from system_pulse import check_sos_ledger_sync
import json
result = check_sos_ledger_sync()
print(json.dumps(result, indent=2))
"
```

Report the status (green/yellow/red) and detail. If red, flag immediately.

### 2. Ledger State

Check the current work ledger for SOS-linked items and verification queues:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from work_ledger import WorkLedger
l = WorkLedger()
items = l.data.get('items', [])
sos = [i for i in items if i.get('sos_task_id')]
bugs = [i for i in items if i.get('id','').startswith('BUG-')]
print(f'Total items: {len(items)}')
print(f'SOS-linked: {len(sos)}')
print(f'Bug items: {len(bugs)}')
print(f'Internal (private): {len(items) - len(sos)}')
print()
# Verify queues
for reviewer in ('kai', 'ember', 'nick'):
    queue = [i for i in items if i.get('status') == 'built' and not i.get('verified') and i.get('verifier') == reviewer]
    if queue:
        print(f'Verify queue [{reviewer}]: {len(queue)} items')
        for q in queue[:3]:
            print(f'  - {q[\"id\"]}: {q.get(\"title\",\"\")[:60]}')
# Stale items
from datetime import datetime, timezone, timedelta
stale_cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
stale = [i for i in items if i.get('status') == 'built' and not i.get('verified') and (i.get('completed_at','') < stale_cutoff if i.get('completed_at') else False)]
if stale:
    print(f'\nSTALE (built >24h, unverified): {len(stale)} items')
    for s in stale[:5]:
        print(f'  - {s[\"id\"]}: {s.get(\"title\",\"\")[:60]}')
"
```

### 3. SOS Connection Test

Verify we can pull live data from SOS Supabase:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from op_env import load_op_env
load_op_env()
from pm_bridge import get_open_priorities
tasks = get_open_priorities()
print(f'SOS tasks accessible: {len(tasks)}')
# Show top 5 by priority
high = [t for t in tasks if t.get('priority') == 'high']
med = [t for t in tasks if t.get('priority') == 'medium']
print(f'  High priority: {len(high)}')
print(f'  Medium priority: {len(med)}')
print(f'  Other: {len(tasks) - len(high) - len(med)}')
"
```

If this fails with 401, the op session may have expired. Run `source grok-personal/op_dev_session.sh` to refresh.

### 4. Daily Loop Log Check

Check when the sync last ran:

```bash
ls -lt /Users/nicholaspetros/scceo-1/grok-personal/logs/pm-loop-*.log | head -3
```

Then read the latest log and grep for the sync steps:

```bash
grep -E "Step 4\.[67]|SOS→Ledger|Bug→Ledger|Verify queue|STALE" /Users/nicholaspetros/scceo-1/grok-personal/logs/pm-loop-$(date +%Y-%m-%d).log
```

### 5. Revenue Gates (if applicable)

Use the MCP tool to check if any revenue gates are open:

```
run_revenue_gate_checks()
```

## How to Report Results

Present a summary table:

| Check | Status | Detail |
|-------|--------|--------|
| Pipeline Health | green/yellow/red | From system_pulse |
| SOS Connection | OK/FAIL | Task count |
| Ledger Items | N total, N SOS-linked | Item counts |
| Verify Queue | N items | Per reviewer |
| Last Sync | timestamp | From log |
| Revenue Gates | PASS/OPEN | Gate status |

If anything is yellow or red, recommend action:
- **Red pipeline**: Run `python3 daily_loop.py` to force a sync
- **SOS 401**: Refresh op session (`source op_dev_session.sh`)
- **Stale verify items**: Surface the list and recommend verification
- **Open gates**: Escalate immediately to Nick

## Architecture Reference

Full pipeline docs: `memory/sos-ledger-pipeline.md`

### Privacy Boundary
- Items with `sos_task_id` = syncs to SOS (team visible)
- Items with `sos_task_id = None` = private to Kai/Nick
- `sync_to_sos()` only touches SOS-linked items

### Key Files
- `grok-personal/pm_bridge.py` — SOS Supabase RPC client
- `grok-personal/work_ledger.py` — Ledger CRUD (line 1286: sync_from_sos, line 1349: sync_to_sos)
- `grok-personal/daily_loop.py` — Orchestrator (Step 4.6: SOS sync, Step 4.7: bug sync)
- `grok-personal/bug_tracker.py` — Bug pull + create_ledger_items()
- `grok-personal/system_pulse.py` — check_sos_ledger_sync() health check
- `grok-personal/web_chat.py` — /work-ledger/alerts endpoint
