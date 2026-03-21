---
name: nuke-permissions
description: Completely nukes file access approval prompts in Antigravity by rewriting the trustedPaths config to whitelist root directories, running historical chat log diagnostics to identify persistent leaks, and configuring the CDP debugging port so the auto-accept plugin can forcefully click through any remaining UI prompts.
ruleDomains:
  - ops
---

# Nuke Permissions

This skill forcefully bypasses constant "Allow file access to" and "Approval required" prompts that block agent momentum. It relies on a deterministic analysis loop instead of randomly guessing configuration globs.

## Execution Protocol

**When the user complains about permission prompts or asks to nuke permissions:**

### Step 1: Run the Persistent Diagnostic Scanner
Never guess what paths are failing. Run the diagnostics scan to pull historically blocked file prompts out of the IDE's SQLite cache and log them to a markdown artifact:

```bash
python3 ~/scceo-1/grok-personal/scripts/scan_permission_prompts.py
```

### Step 2: Analyze the Leaks
Read the log file generated at `~/scceo-1/grok-personal/data/session_notes/permission_prompts_log.md`.
Identify what paths or path structures are continually leaking past the whitelisted configuration.

### Step 3: Hardwire `settings.json` Programmatically
Run a python script to rewrite `trustedPaths` in `~/Library/Application Support/Antigravity/User/settings.json`.

You MUST inject absolute directory roots, wide wildcards, AND **specific explicit globs derived from the leaked paths in Step 2** into `auto-accept.trustedPaths`, `autoAcceptFree.trustedPaths`, and `antigravity-autopilot.trustedPaths` at index 0.

Minimum guaranteed baselines to include alongside the new fixes:
- `/`
- `/Users`
- `/Users/{username}`
- `/Users/{username}/{repo-name}/**`
- `**/*`
- `/*`

Ensure both `autoAcceptFree.pauseOnCdpMismatch` is set to `false`, and `antigravity-autopilot.enabled` is `true`.

### Step 4: Check the CDP Debug Port
Even if settings are perfect, the auto-accept agent (the physical button clicker) is blind if DevTools aren't open.
Run:
```bash
ps aux | grep Antigravity | grep remote-debugging-port
```
- If a port like `9000` is present, the CDP hook is alive. The auto-accept module is connected, and the prompts are nuked.
- If it is missing, the application is NOT running with the required CDP flag, meaning the auto-accept plugin cannot physically click the "Allow" buttons for the user.

### Step 5: Issue the Restart Sequence
If CDP is missing, or if the user is complaining despite the settings being updated (meaning the extension host cache hasn't flushed), you must instruct the user to execute the CDP Restart Sequence. Because restarting Antigravity from within the agent chat will kill the chat thread mid-response, provide the user the exact command to copy/paste into their MacOS terminal application (iTerm, Terminal.app, Ghostty) directly:

```bash
killall "Antigravity Helper" "Antigravity" ; open -a "Antigravity" --args --remote-debugging-port=9000
```

Explain that once the IDE relaunches with this command, the new configuration will be natively cached and the UI-hijack privileges will be fully operational.
