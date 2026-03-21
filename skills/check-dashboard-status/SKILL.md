---
name: "Check Dashboard Status"
description: "Verify that work ledger items are syncing correctly to the Spark Kanban product board in Supabase. Use when asked to 'check status', 'verify dashboard sync', or 'are tasks updating'."
ruleDomains:
  - ops
---

# Check Dashboard Status

Use this skill when the user says things like:
- "check status"
- "are tasks updating?"
- "verify the dashboard"
- "is the board syncing?"
- "check the product board"

## What This Checks

This skill audits the live connection between the **Work Ledger** (`work_ledger.json`) and the **Spark Kanban tasks table** in Supabase to confirm team priorities are visible and accurate.

---

## Step 1 — Load Environment

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal
```

All commands in this skill run from this directory. The `.env` file must be loaded for Supabase auth.

---

## Step 2 — Run the Health Check Script

Run the following Python script. It performs all checks in one pass:

```python
python3 -c "
import json, os
from pathlib import Path
from datetime import datetime, timezone, timedelta

try:
    from op_env import load_op_env
    load_op_env(Path('/Users/nicholaspetros/scceo-1/grok-personal/.env'))
except ImportError:
    pass

import pm_bridge

# ── 1. Load Work Ledger ──
data = json.load(open('/Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json'))
all_items = data.get('items', [])
sos_items = [i for i in all_items if i.get('sos_task_id')]

# ── 2. Load Supabase Tasks ──
resp = pm_bridge.supabase.table('tasks').select('id, title, status, labels, updated_at').execute()
tasks = {t['id']: t for t in (resp.data or [])}

# ── 3. Status Breakdown (Supabase) ──
sb_statuses = {}
for t in tasks.values():
    s = t.get('status', 'unknown')
    sb_statuses[s] = sb_statuses.get(s, 0) + 1

# ── 4. Ledger Status Breakdown ──
ledger_statuses = {}
for i in all_items:
    s = i.get('status', 'unknown')
    ledger_statuses[s] = ledger_statuses.get(s, 0) + 1

# ── 5. Cross-Reference: SOS items vs Supabase ──
linked = 0
orphaned_ledger = []  # SOS items not found in Supabase
status_mismatches = []
stale_items = []

STATUS_MAP = {
    'pending': 'todo', 'planned': 'todo',
    'dispatched': 'in-progress', 'in_progress': 'in-progress',
    'built': 'in-progress', 'verified': 'done', 'done': 'done',
}

for item in sos_items:
    uuid = item.get('sos_task_id')
    if uuid in tasks:
        linked += 1
        sb_status = tasks[uuid].get('status')
        expected = STATUS_MAP.get(item.get('status', 'pending'), 'todo')

        # Check for regressions (SB is behind ledger)
        if expected == 'in-progress' and sb_status == 'todo':
            status_mismatches.append({
                'id': item['id'], 'title': item.get('title', '')[:40],
                'ledger': item.get('status'), 'supabase': sb_status,
                'expected': expected
            })
        elif expected == 'done' and sb_status in ('todo', 'in-progress'):
            status_mismatches.append({
                'id': item['id'], 'title': item.get('title', '')[:40],
                'ledger': item.get('status'), 'supabase': sb_status,
                'expected': expected
            })

        # Check staleness (updated >48h ago)
        updated = tasks[uuid].get('updated_at')
        if updated:
            try:
                dt = datetime.fromisoformat(updated.replace('Z', '+00:00'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if (datetime.now(timezone.utc) - dt).total_seconds() > 48 * 3600:
                    stale_items.append({'id': item['id'], 'title': item.get('title', '')[:40], 'last_updated': updated})
            except:
                pass
    else:
        orphaned_ledger.append({'id': item['id'], 'title': item.get('title', '')[:40]})

# ── 6. Check for junk items (personal items that leaked) ──
junk_items = []
for t in tasks.values():
    labels = t.get('labels') or []
    if isinstance(labels, str):
        try:
            labels = json.loads(labels)
        except:
            labels = []
    for l in labels:
        if isinstance(l, str) and l.startswith('ledger:') and not l.startswith('ledger:SOS-'):
            junk_items.append({'id': t['id'], 'title': t.get('title', '')[:40]})
            break

# ── 7. Load Sync State ──
state_file = Path('/Users/nicholaspetros/scceo-1/grok-personal/data/dashboard_sync_state.json')
sync_state = {}
if state_file.exists():
    sync_state = json.loads(state_file.read_text())

# ── REPORT ──
print('=' * 60)
print('DASHBOARD STATUS CHECK')
print('=' * 60)
print()
print('📊 Supabase Product Board:')
for s, c in sorted(sb_statuses.items()):
    print(f'   {s}: {c}')
print(f'   Total: {len(tasks)}')
print()
print('📋 Work Ledger:')
for s, c in sorted(ledger_statuses.items()):
    print(f'   {s}: {c}')
print(f'   Total: {len(all_items)} ({len(sos_items)} SOS-linked)')
print()
print('🔗 Link Health:')
print(f'   SOS items linked to Supabase: {linked}/{len(sos_items)}')
print(f'   Orphaned (no Supabase match): {len(orphaned_ledger)}')
print()

if sync_state:
    print(f'⏱️  Last Sync: {sync_state.get(\"last_sync_at\", \"Never\")}')
    print(f'   Items in mapping: {len(sync_state.get(\"mapping\", {}))}')
    if sync_state.get('errors'):
        print(f'   ⚠️  Last sync errors: {len(sync_state[\"errors\"])}')
    print()

# ── ISSUES ──
issues = 0

if junk_items:
    issues += 1
    print('🚨 JUNK ITEMS FOUND (personal items leaked to board):')
    for j in junk_items[:5]:
        print(f'   - {j[\"id\"]}: {j[\"title\"]}')
    if len(junk_items) > 5:
        print(f'   ... and {len(junk_items) - 5} more')
    print()

if status_mismatches:
    issues += 1
    print('⚠️  STATUS MISMATCHES (board behind ledger):')
    for m in status_mismatches[:5]:
        print(f'   - {m[\"id\"]}: ledger={m[\"ledger\"]} → expected={m[\"expected\"]}, but board={m[\"supabase\"]}')
    if len(status_mismatches) > 5:
        print(f'   ... and {len(status_mismatches) - 5} more')
    print()

if stale_items:
    issues += 1
    print('⏰ STALE ITEMS (not updated in >48h):')
    for s in stale_items[:5]:
        print(f'   - {s[\"id\"]}: {s[\"title\"]} (last: {s[\"last_updated\"]})')
    if len(stale_items) > 5:
        print(f'   ... and {len(stale_items) - 5} more')
    print()

if orphaned_ledger:
    print(f'ℹ️  {len(orphaned_ledger)} SOS items not yet on board (normal if recently created)')
    print()

# ── VERDICT ──
print('=' * 60)
if issues == 0:
    print('✅ VERDICT: HEALTHY — Dashboard is syncing correctly')
else:
    print(f'⚠️  VERDICT: {issues} ISSUE(S) FOUND — Review above')
print('=' * 60)
"
```

---

## Step 3 — Interpret Results

### Healthy Output (no action needed)
```
✅ VERDICT: HEALTHY — Dashboard is syncing correctly
```

All SOS items are linked, statuses match, no personal items leaked.

### Issues Found

| Issue | Meaning | Fix |
|-------|---------|-----|
| 🚨 JUNK ITEMS | Personal `pri-`/`err-` items leaked to the board | Delete them: `pm_bridge.supabase.table('tasks').delete().eq('id', '<uuid>').execute()` |
| ⚠️ STATUS MISMATCHES | Board shows `todo` but ledger says `dispatched`/`built` | Re-run sync: `python3 ledger_to_dashboard.py --sync` |
| ⏰ STALE ITEMS | Items not updated in 48+ hours | Check if agent is stuck, or if item is completed but not marked |
| ℹ️ ORPHANED | SOS items exist in ledger but not on board | Normal for new items; they'll appear on next sync |

---

## Step 4 — Fix Actions (if needed)

### Re-sync the dashboard
```bash
cd /Users/nicholaspetros/scceo-1/grok-personal
python3 ledger_to_dashboard.py --sync
```

### Dry-run first (safe preview)
```bash
python3 ledger_to_dashboard.py --dry-run
```

### Force full resync (ignores cached state)
```bash
python3 ledger_to_dashboard.py --sync --force
```

### Delete a junk item manually
```python
pm_bridge.supabase.table('tasks').delete().eq('id', '<task-uuid>').execute()
```

---

## Step 5 — Run Tests

After any fix, always verify the sync logic is still correct:

```bash
APP_ENV=test python3 -m pytest tests/test_ledger_to_dashboard.py -v --tb=short
```

All 35 tests must pass. Key test classes:
- `TestRegressionProtection` — ensures we never downgrade board status
- `TestFiltering` — ensures personal items are never synced
- `TestStatusMapping` — all 7 ledger states map correctly

---

## Step 6 — Report to User

Present findings using this format:

```
Dashboard Status Check:
  Board: X todo / Y in-progress / Z done
  Ledger: A SOS-linked items
  Link Health: B/A matched
  Last Sync: <timestamp>
  Verdict: ✅ HEALTHY or ⚠️ N ISSUES
```

If issues were found, list them with recommended fixes.
