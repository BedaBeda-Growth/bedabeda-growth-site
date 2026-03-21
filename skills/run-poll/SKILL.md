---
name: "run-poll"
description: "Run a persistent polling loop to keep an Antigravity thread alive. Use this when Nick asks you to 'run a poll' or 'stay awake' while waiting for background tasks, Jules sessions, or CI checks to finish, so you hold the session open until everything is fully complete without bothering him."
ruleDomains:
  - ops
---

# Run Persistent Poll

> **Purpose:** To keep an Antigravity thread alive indefinitely without Nick having to manually return to the thread to check status. This ensures that background jobs (like Jules, CI verification, or Playwright tests) don't get abandoned and the agent eventually handles the next step.

> **When to Use:** When Nick says "run poll", "@run-poll", or asks you to keep the thread alive and poll until things are done.

## The Problem This Solves

If you launch a 30-minute test suite and then end your turn asking Nick "Let me know when this finishes," the thread is essentially dead until Nick remembers to come back. The work stops. This skill provides a safe, CPU-friendly way for you to stay awake and check for yourself.

## How to Execute the Poll Loop

When executing this skill, run the included `persistent_poll.py` script. It will sleep for 10 minutes (600 seconds), printing a status every 60 seconds so the logs don't look frozen, and then gracefully exit to wake you up.

### Step 1: Start the Poller

Run the following command in the background (using your `run_command` tool):

```bash
python3 ~/.agents/skills/run-poll/scripts/persistent_poll.py
```

### Step 2: Yield the Thread using command_status

Do **not** end your turn or ask Nick for permission. 
Immediately use your `command_status` tool to wait on the background command ID from Step 1 with a high `WaitDurationSeconds` (e.g., 300 or 600).
If your tool returns before the script finishes (it typically times out after 300s), simply call `command_status` again until it returns `DONE`.

### Step 3: Check Status

Once the poller finishes (10 minutes have elapsed), wake up and DO THE WORK:
- Re-read `work_ledger.json` to check for status changes.
- Check any relevant external tools (e.g., `check-jules-status`, `get-status`, or whatever background system you were waiting for).
- Advance the pipeline if something completed.

### Step 4: Loop or Halt

- **If work is still pending/running:** Say "Still waiting, going back to sleep..." and loop back to **Step 1**. 
- **If work is finished or needs Nick's manual input:** Halt the loop and present the final results to Nick.

## Important Constraints

- **DO NOT stop polling** just because one check didn't show progress. ONLY stop when the overarching pipeline is complete or requires hard manual intervention.
- **NEVER use busy-wait loops in python** (like `while True: pass`). Always use `sleep` so you don't burn CPU cycles. 
- **Log your reason for sleeping.** Always state what you are waiting on (e.g., "Waiting for Jules session `abc` to finish building.") before entering the loop.
