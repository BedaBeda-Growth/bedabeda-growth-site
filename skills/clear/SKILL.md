---
name: "Clear"
description: "Wipe stale Antigravity session caches — conversation .pb files, brain artifacts, browser recordings, and old gemini-tasks conveyor files. Reclaims RAM and disk from old sessions."
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Clear — Antigravity Cache Flush

## Trigger Phrases

- "clear", "clear cache", "flush ag", "clean ag", "ag cleanup", "clear ram", "flush ram", "brain flush", "clear antigravity", "clean up sessions", "kill old windows", "clear processes", "flush processes"

---

## What This Skill Does

Runs the `ag_session_cleaner.py` daemon against three Antigravity layers, then prunes stale conveyor task files:

| Layer | Path | Notes |
|-------|------|-------|
| Conversation state | `~/.gemini/antigravity/conversations/*.pb` | Protobuf session blobs |
| Brain artifacts | `~/.gemini/antigravity/brain/<uuid>/` | Markdown, images, generated files |
| Browser recordings | `~/.gemini/antigravity/browser_recordings/<uuid>/` | WebP frame caches — biggest hog |
| Conveyor task files | `~/scceo-1/gemini-tasks/**/*.md` | Per-item task files from past dispatches |

**Safety guarantees:**
- Never touches `knowledge/` (curated, long-lived data)
- Never deletes the **current active conversation** (auto-protected via `CRAFT_SESSION_ID`)
- Active sessions (modified within threshold) are preserved as 🟢 active
- Task files are only pruned if older than 24h (safe: heartbeat has already consumed them)
- Dry-run by default — shows what WOULD be removed before touching anything

---

## Step 0: Stale Process Audit (Always Run First)

Before touching files, check for zombie Antigravity windows and duplicate MCP servers eating RAM:

```bash
# Renderer processes — sorted by memory
ps aux | grep "Antigravity Helper (Renderer)" | grep -v grep | awk '{printf "PID %-7s  RSS: %5.0f MB  Started: %s\n", $2, $6/1024, $9}' | sort -k4 -rn

# Plugin helper count
ps aux | grep "Antigravity Helper (Plugin)" | grep -v grep | wc -l

# MCP server instances (should be exactly 1)
ps aux | grep kai_mcp_server | grep -v grep | awk '{printf "PID %-7s  RSS: %5.0f MB  Started: %s\n", $2, $6/1024, $9}'
```

Report to Nick:
- Any renderer started >6h ago (stale window, user likely forgot to close it)
- Any renderer using >500 MB (bloated session)
- Plugin helper count — expected ~10 per open window; if >30 and Nick has <3 windows open, something is stale
- MCP server count — should be exactly 1. If >1, kill all but the newest.

**If stale renderers are found**, ask Nick: "PID {X} has been running since {time} and is using {N} MB. Kill it? (yes/no)"

Kill confirmed PIDs:
```bash
kill <pid>
```

**If duplicate MCP servers are found**, kill all but the newest (highest PID):
```bash
kill <older_pids>
echo "<newest_pid>" > /tmp/kai_mcp_server.pid
```

**Never kill renderers without explicit confirmation** — an open window is active work.

---

## Step 1: Dry Run (Always Run First)

Show what would be freed without deleting anything:

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --hours 6
```

Read the dashboard output. Report to Nick:
- Total size across all layers
- How much would be freed
- How many stale vs. active conversations
- Any unusually large single conversations (flag if >100 MB)

---

## Step 2: Confirm and Execute

After showing the dry-run report, ask Nick to confirm:

> "Ready to free **{freed_mb} MB** across **{stale_count}** stale conversations. Execute? (yes/no)"

If Nick confirms, run:

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --hours 6 --execute
```

Report the final freed amount.

---

## Step 3: Prune Old Conveyor Task Files

Task files in `gemini-tasks/` accumulate with every morning dispatch. Once the heartbeat has consumed them, they're dead weight. Prune any task file older than 24 hours across all sub-folders:

```bash
find /Users/nicholaspetros/scceo-1/gemini-tasks -name "*.md" -mtime +1 -print
```

Report what would be deleted (count + total size), then confirm with Nick before removing:

```bash
find /Users/nicholaspetros/scceo-1/gemini-tasks -name "*.md" -mtime +1 -delete
```

Also remove any empty sub-directories left behind:

```bash
find /Users/nicholaspetros/scceo-1/gemini-tasks -mindepth 1 -type d -empty -delete
```

Report: "Pruned {N} task files from gemini-tasks/ ({size} freed)."

---

## Optional Modes

### Recordings Only (fastest, biggest impact)

If Nick says "just clear recordings" or "recordings only":

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --hours 6 --recordings-only --execute
```

### Tighter Window (nuke more aggressively)

If Nick says "clear everything" or "3 hour window":

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --hours 3 --execute
```

### Protect a Specific Conversation

If Nick wants to keep a specific session:

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --hours 6 --protect <uuid> --execute
```

### Shell Wrapper (equivalent shorthand)

```bash
bash /Users/nicholaspetros/scceo-1/.runtime/ag_clean_on_session.sh
```

---

## Output Summary Format

After execution, present a clean summary:

```
🧹 AG Cache Cleared

  Processes:     2 stale renderers killed (1.6 GB reclaimed)
                 MCP server: 1 running ✓
  AG Sessions:   729.5 MB freed across 53 conversations
  Task Files:    12 pruned from gemini-tasks/ (840 KB)
  Remaining:     116.1 MB (12 active sessions kept)
  Layers:        .pb + brain + recordings + gemini-tasks

  Biggest wins:
    ✕ PID 9261   1,368 MB (stale renderer, 11h old)
    ✕ 9fe8e73f    338 MB (1.0d stale session)
    ✕ 7e55f5d8    137 MB (1.2d stale session)

  Report: .runtime/ag_clean_report.json
```

---

## Quick Reference

| Command | Effect |
|---------|--------|
| `--hours 6` | Default: stale after 6h of inactivity |
| `--hours 3` | Aggressive: stale after 3h |
| `--execute` | Actually delete (omit for dry-run) |
| `--recordings-only` | Only wipe browser recording caches |
| `--protect <uuid>` | Keep a specific conversation |
| `--json` | Output machine-readable JSON instead of dashboard |

---

## Non-Negotiable Rules

1. **Always dry-run first** and show Nick the report before executing.
2. **Never skip the confirmation** before `--execute`.
3. **Never touch `knowledge/`** — that data is curated and long-lived.
4. **Current session is always protected** — the cleaner handles this automatically via `CRAFT_SESSION_ID`.
5. **Only prune task files older than 24h** — anything newer may still be queued or in-flight.
6. **Never kill a renderer without confirmation** — an open window is active work. Always ask first.
7. **MCP server must be exactly 1** — if dupes found, kill oldest PIDs, keep newest. PID file lives at `/tmp/kai_mcp_server.pid`.

---

## Variants / Absorbed Modes

### --free-up
Deep system prune of all unused processes and lingering caches.
*(absorbed: free-up)*

### --trim
Specific trim operation for Antigravity memory limits.
*(absorbed: trim-ag)*
