---
name: "Setup Workstation"
description: "Organize and verify that all core Pinchforth repositories exist centrally in the user's home directory. Enforces an identical folder relationship across machines."
alwaysAllow:
  - Read
  - RunCommand
ruleDomains:
  - ops
---

# Setup Workstation

Use this skill when:
- Setting up a new machine or environment
- The user asks to "run setup", "organize my repos", or "align the workstation paths"
- You detect a missing core repository that should be present for cross-repo scripts to function

This skill uses a deterministic Python script to check for the presence of the 8 core Pinchforth repos in `~/`:
- scceo
- scceo-1
- rocket
- rv
- spark-kanban
- SOS
- app
- web

## Step 1 — Run the setup script

Run the script to verify and automatically clone any missing repos:

```bash
python3 /Users/nicholaspetros/scceo-1/.agents/skills/setup/scripts/organize.py
```

If the user just wants to see what's missing without cloning, use the `--dry-run` flag:
```bash
python3 /Users/nicholaspetros/scceo-1/.agents/skills/setup/scripts/organize.py --dry-run
```

## Step 2 — Report Status
Report the results back to the user based on the script output.

## Anti-Patterns
❌ **Using LLM logic to check directories** → rely strictly on the python script.
❌ **Moving external folders manually** → the script guarantees consistency.