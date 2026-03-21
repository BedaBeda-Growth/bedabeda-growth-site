---
name: "Check Jules Status"
description: "Check Google Jules CLI session progress, summarize statuses, flag blocked/stalled work items, and ensure all completed/awaiting-feedback sessions have PRs open and ready for jules-merge-verify. Use when Nick asks for Jules progress OR when preparing to run /jules-merge-verify."
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
---

# Check Jules Status

Two-phase skill: (1) pull live session status, (2) ensure all done work is in PRs and ready for merge-verify.

## Phase 1: Status Check

### Required Commands

```bash
jules version
jules remote list --session
```

If these fail, stop and report auth/setup issue.

### Workflow

1. Run `jules remote list --session` and parse each row:
   - `session_id`, `description` (contains item ID if present), `repo`, `last_active`, `status`

2. **Filter to today's batch** — exclude sessions older than 24h unless Nick asks for full history.

3. Group by status:
   - `Planning` / `In Progress` — still running
   - `Completed` — Jules finished but may not have opened PR yet
   - `Awaiting User Feedback` — Jules opened a PR and is waiting
   - `Failed` — needs attention

4. Highlight exceptions:
   - `Failed` sessions
   - Sessions stalled in `Planning` > 20 min
   - Sessions `Completed` with no associated PR

5. Return a concise report:

```
## Jules Status — [TIMESTAMP]
Planning: 0 | In Progress: 0 | Completed: N | Awaiting Feedback: N | Failed: 0

✅ Completed (N):          — [item_id or session_id] • [repo]
📬 Awaiting Feedback (N):  — [item_id or session_id] • [repo] • PR #XXX
❌ Failed (N):             — [item_id or session_id] • [repo]
```

## Phase 2: PR Finalization

**Goal:** Every `Completed` or `Awaiting Feedback` session must have an open PR before we can run `/jules-merge-verify`. Run this phase after Phase 1.

### Step 2a: Map Sessions → PRs

For each repo that had Jules work, list open PRs sorted by creation date:

```bash
# Rocket
cd ~/SOS/Rocket/fractional-ignite && gh pr list --state open \
  --json number,title,headRefName,url,createdAt \
  --jq 'sort_by(.createdAt) | reverse | .[] | "\(.number) | \(.headRefName) | \(.url)"'

# Spark-Kanban  
cd ~/SOS/MIni\ SOS/spark-kanban && gh pr list --state open \
  --json number,title,headRefName,url,createdAt \
  --jq 'sort_by(.createdAt) | reverse | .[] | "\(.number) | \(.headRefName) | \(.url)"'

# SCCEO
cd ~/scceo-1 && gh pr list --state open \
  --json number,title,headRefName,url,createdAt \
  --jq 'sort_by(.createdAt) | reverse | .[] | "\(.number) | \(.headRefName) | \(.url)"'
```

Match each recent PR branch (e.g. `jules/jules-XXXXXXXXXX`) to the session ID from Phase 1.

### Step 2b: Identify Sessions with No PR

For each `Completed` session with no matching PR:

```bash
jules remote pull --session <session_id> 2>&1 | head -5
```

- If `No diff found in the remote VM` → Jules committed but no PR. Respond to session:

```bash
jules remote respond --session <session_id> \
  "Please open a GitHub Pull Request for the changes you made. Target the main branch and title the PR with the item ID from the plan you implemented."
```

- If there IS a diff → Jules has local changes; same respond command to push + open PR.

### Step 2c: PR Readiness Table

Present to Nick:

```
## PR Readiness for Jules Merge-Verify

| Item | Repo | PR # | URL | Status |
|------|------|-------|-----|--------|
| NT-w1-02 | fractional-ignite | #1005 | github.com/.../1005 | ✅ Ready |
| pri-051  | fractional-ignite | —     | —                   | ⚠️ No PR yet |
```

- **✅ Ready** — PR open, has commits, not draft
- **⚠️ No PR yet** — completed but no PR; trigger Step 2b
- **❌ Failed** — flag for re-dispatch

### Step 2d: Confirm Handoff & Auto-Sync

Once Jules statuses are checked, immediately sync any completed sessions to the ledger:

```bash
python3 ~/scceo-1/grok-personal/status_reconcile.py --apply True
```

Only when all items are ✅ Ready or explicitly skipped by Nick:

> "All Jules work is in PRs. Ready to run `/jules-merge-verify`."

## Naming / Scope

- Status + PR readiness. Sending new work → `[skill:send-to-jules]`. Executing merge + tests → `/jules-merge-verify`.
- Update work ledger status to `pr_open` for confirmed PRs.
