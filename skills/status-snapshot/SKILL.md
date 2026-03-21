---
name: "Status Snapshot"
description: "30-second current status from the day plan — for Nick, team, or comms. Read-only, never mutates state."
requiredSources:
  - kai-brain
alwaysAllow:
  - Read
  - Bash
ruleDomains:
  - ops
---

# Status Snapshot — The Reporter

## Trigger Phrases
- "status", "snapshot", "where are we", "update", "sitrep", "what's done"

## Core Rule
**Read-only. Never mutate state.** This skill produces a status digest. It doesn't advance anything.

## Step 1: Read State

Read in parallel:
1. `~/Desktop/Rocket/day-plan.json` — priorities and their current status
2. `~/Desktop/Rocket/Todos/YYYY-MM-DD.md` — strike list checkbox state
3. `check_work_ledger()` — nag list (unverified, failed, gate items)
4. `GET /runs` (when run bus available) — active AG executions with state, repo, model, elapsed time

If no `day-plan.json` exists: report from strike list and ledger only.

## Step 2: Build Snapshot

### For Nick (default)

Compact card format:

```
STATUS — HH:MM ET

DONE: 3/5
  [x] P1: Subscription gating — verified 08:15 ET
  [x] P2: Rocket staging merge — verified 08:30 ET
  [x] P4: PKCE fix — verified 09:00 ET

IN PROGRESS:
  [~] P3: Ember sales training — knowledge doc written, testing next

WAITING ON YOU:
  [ ] P5: Post 3 AI reply tweets (~20 min)

ACTIVE RUNS: (when run bus available)
  [~] rk-auth-qa — rocket / gemini-3.1 / 4m12s / healthy
  [!] rk-notes-fix — rocket / opus-4.6 / 8m03s / STALLED (no file writes 6m)

TEAM: 4 new SOS items since plan (acknowledged, queued for next wave)
GATES: 2 open (subscription, GA hygiene)
```

### For Team (when Nick says "team status" or "for the team")

More narrative, less technical:

```
## Status Update — Mar 6

### Completed Today
- Subscription gating fix — live and verified
- Rocket staging deployed to production (4 commits)
- Password reset PKCE error resolved

### In Progress
- Ember knowledge base upgrade (coaching + sales context)
- Sprint Wave 1: 15 team-submitted priorities dispatched

### Coming Up
- Sprint Wave 2: Error fixes + technical debt (15 items)
- Notes voice experience launch

### Team Submissions
- 4 new items received and queued for current wave
- All submissions tracked in work ledger
```

### For Comms (when Nick says "for social" or "for investors")

Headline + key metric:

```
Day 10 of 30 | $X of $30K target

Today: Fixed 3 production issues, deployed notes experience,
dispatched 45 team priorities to build queue.

4,400+ members | 26 cities | shipping daily
```

## Step 3: Surface Risks

Always append if any exist:

```
RISKS:
- Revenue gate still open: [gate name] — needs [action]
- [X] items built > 24h without verification
- Resend emails: [count] sent in 24h (red if 0)
```

## Rules
- **Never mutate state.** No writes to day-plan.json, ledger, or todos.
- **Always current.** Read fresh data every time — don't cache.
- **Match the audience.** Nick gets compact cards. Team gets narrative. Comms gets headlines.
- **Surface risks even when everything looks good.** Open gates and stale verifications always show.
- **Keep it scannable.** Nick should get the picture in 10 seconds.
