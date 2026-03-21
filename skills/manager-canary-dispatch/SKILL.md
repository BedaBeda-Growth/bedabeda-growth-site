---
name: "Manager Canary Dispatch"
description: "Run, verify, and triage Anti-Gravity Manager-native canary dispatches with fail-closed checks and run-bus evidence. Use when validating Manager automation, repo targeting, and live cascade tracking."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
---

# Manager Canary Dispatch

> **Looking to dispatch real work?** Use `conveyor-dispatch` for batch dispatch or `cto-heartbeat` for single tasks. This skill is only for **AG Manager canary testing**.

Use this skill when asked to:

- run a live canary through Anti-Gravity `Agent Manager`
- confirm prompt execution happened in the intended repo lane
- verify run bus events and completion evidence
- diagnose `repo_select_failed` or `manager_no_new_cascade_after_submit`

## Non-Negotiables

1. Announce `RUN START` before launch and `RUN END` after capture.
2. Require hands-off Manager during active run.
3. Run with explicit `--workspace` and `--manager-native-submit`.
4. Treat missing cascade discovery as blocked even if UI appears to respond.
5. Verify artifact content in target repo before declaring pass.

## Objective Alignment (Mandatory)
Before starting canary validation:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Confirm the canary validates at least one objective-critical capability (e.g., dispatch trust, repo targeting, verification loop)
- If the canary has no objective tie, ask: **"What's the objective here?"**
- Log recurring objective gaps discovered during canary failures in `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`

## Canonical Canary Command

```bash
python3 grok-personal/gemini_bridge/dispatch_v3.py task \
  grok-personal/gemini_bridge/live_dummy_task_scceo_gui.md \
  --model pro-low \
  --timeout 180 \
  --progress-timeout 60 \
  --task-id live-dummy-manager-native-<stamp> \
  --workspace /Users/nicholaspetros/scceo-1 \
  --conversation-name scceo-manager-native-smoke \
  --manager-native-submit
```

## Pass Criteria

All must be true:

1. CLI result status is done (`CORTEX_STEP_STATUS_DONE`).
2. `run.cascade_discovered` was emitted.
3. Artifact exists:
   - `.runtime/gemini-dispatch/live_dummy_run_scceo_gui.txt`
4. Artifact content equals:

```txt
live_dummy_run_scceo_gui_ok
workspace_target=scceo-1
```

## Evidence Commands

Latest events by task id:

```bash
python3 -c "import json, pathlib; p=pathlib.Path.home()/'gemini-dispatch'/'run_events.jsonl'; tid='live-dummy-manager-native-v8'; rows=[json.loads(x) for x in p.read_text().splitlines() if x.strip()]; print([{'event':r.get('event_type'),'status':r.get('status'),'payload':r.get('payload')} for r in rows if r.get('task_id')==tid])"
```

Latest completion by task id:

```bash
python3 -c "import json, pathlib; p=pathlib.Path.home()/'gemini-dispatch'/'completions.jsonl'; tid='live-dummy-manager-native-v8'; rows=[json.loads(x) for x in p.read_text().splitlines() if x.strip()]; hits=[r for r in rows if r.get('task_id')==tid]; print(hits[-1] if hits else 'none')"
```

Artifact verification:

```bash
ls -la .runtime/gemini-dispatch/live_dummy_run_scceo_gui.txt
cat .runtime/gemini-dispatch/live_dummy_run_scceo_gui.txt
```

## Failure Triage

### `repo_select_failed`

- Manager window unavailable or repo selection gate failed.
- Check accessibility permissions and Manager visibility.
- Re-run once after ensuring left sidebar is visible.

### `manager_no_new_cascade_after_submit`

- Prompt submit occurred but dispatch could not attach a cascade.
- Inspect `run.blocked.payload.manager_screenshot_path`.
- If screenshot shows response in wrong repo lane, classify as repo drift.

### Repo drift guardrail

- Prefer repo-scoped conversation creation; do not use global header `Start conversation` for manager-native dispatch.

## Source of Truth

Keep this skill aligned with:

- [/Users/nicholaspetros/scceo-1/docs/anti-gravity-manager-dispatch.md](/Users/nicholaspetros/scceo-1/docs/anti-gravity-manager-dispatch.md)
