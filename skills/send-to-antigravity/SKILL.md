---
name: "Send to Antigravity"
description: "Route implementation work to Antigravity (legacy kai orchestrator dispatch_agent path)."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
ruleDomains:
  - ops
---

# Send to Antigravity

Use this skill only when Nick explicitly asks to send work to **Antigravity**.

## Purpose

This is the renamed label for the legacy orchestrator flow that uses `dispatch_agent`.

## Rules

1. Confirm target repo and task prompt.
2. Call `dispatch_agent(repo, prompt, background=true)`.
3. Report where to monitor status (`check_message_bus(repo)`).
4. Do not use this skill for planning. Planning belongs to `[skill:plan-and-prioritize]`.
5. Do not call this skill from deep planning flow unless Nick explicitly says to send to Antigravity.
