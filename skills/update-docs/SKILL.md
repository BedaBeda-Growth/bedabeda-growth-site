---
name: update-docs
description: >
  Close the documentation drift gap after any work session by reconciling
  what was planned against what was actually done and updating all affected
  artifacts in place. Use this skill at the END of any thread where code
  was written, bugs were fixed, architecture changed, decisions were made,
  or the implementation diverged from the original plan. Triggers: "update
  docs", "sync docs", "capture what we did", "close out the session",
  "update the plan", "preserve what we built", "record what changed",
  "session wrap-up", or any time a work session is winding down and docs
  may be stale.
ruleDomains:
  - ops
---

# Update Docs — Close the Drift Gap

> **Prime directive:** What was built must be recorded as-built. Plans describe
> intent; docs describe reality. They must match after every session.

## Why This Exists

There is always drift between a plan and its execution. Decisions get made in
the moment, scope shifts, approaches change. If docs are not updated immediately
after the session, three things happen:
1. The next agent starts from stale context and re-discovers the same decisions
2. Nick loses the compounding memory that a clean record provides
3. Work items linger in ambiguous states instead of being closed cleanly

This skill forces the drift gap closed before the conversation ends.

## Step-by-Step Protocol

### Step 1 — Reconstruct What Actually Happened

Review the conversation thread and extract a factual summary of what was done:

- What was the original goal/plan going in?
- What was actually built or changed? (files, schemas, logic, configs)
- What decisions were made and *why*? (not what was planned — what was decided)
- What was explicitly NOT done, deferred, or de-scoped?
- What blockers, surprises, or pivots occurred?
- What is the current state (working / partial / needs follow-up)?

**Do not rely on memory. Re-read the thread if needed.**

### Step 2 — Identify All Stale Artifacts

Scan for every doc that could be out-of-date. Check:

| Location | What to look for |
|---|---|
| `~/scceo-1/plans/*.md` | Feature or SOS plans that were the work item's source |
| `~/scceo-1/jules-plans/*.md` | Jules-generated plans for the session work |
| `~/scceo-1/grok-personal/data/work_ledger.json` | The ledger item for this work |
| `~/scceo-1/.agents/skills/*/SKILL.md` | Skills created or modified this session |
| `~/scceo-1/.agents/workflows/*.md` | Workflows that were changed or referenced |
| `AGENT-RULES.md` in any affected repo | If rules changed as a result of this work |
| `README.md` or inline code comments | If public-facing behavior changed |
| Supabase `rule_ledger.rules` | If rules were added/modified (via MCP) |

**Read every candidate file before editing.** Never guess what's there.

### Step 3 — Update the Work Ledger First

Before touching any other doc, close the ledger item for this session:

```python
# ~/scceo-1/grok-personal/data/work_ledger.json
# Find the matching item by ID or title. Then update:
{
  "status": "built",  # or "done" if fully verified, "in_progress" if continuing
  "updated_at": "<ISO timestamp>",
  "notes": [
    ...,
    {
      "at": "<ISO timestamp>",
      "text": "[agent] Session complete — <1-2 sentence summary of what was built and current state>"
    }
  ]
}
```

If no ledger item exists, create one before proceeding (see `work-ledger-sync` skill).

### Step 4 — Update the Plan Document (if one exists)

For each plan file that governed this work:

1. **Add an `## As-Built` section** at the bottom if the plan was followed with deviations.
2. If the plan file is a stub or template, **fill it in** with the real implementation details.
3. **Preserve the original intent** — do not rewrite history. Append clarity, don't erase context.
4. **Strike through or annotate deferred items** — make it clear what did not happen.

Format for the as-built section:
```markdown
## As-Built — {DATE}

**What was done:** {Concise factual summary}

**Diverged from plan:** {What changed and why — be honest}

**Deferred:** {What was explicitly left for later}

**Current state:** {working / partial / needs-{X}}
```

### Step 5 — Update Modified Skills or Workflows

If a skill or workflow was created or changed this session:

- **Skills:** Verify the SKILL.md description still accurately reflects what the skill does. If the behavior drifted during implementation, update the description. Ensure triple publication (see Step 6).
- **Workflows:** If steps changed, update the markdown. Remove steps that no longer apply. Add new steps that were discovered.

### Step 6 — Triple-Publish Any New/Updated Skills

Every skill must exist in THREE locations:

```bash
# Antigravity Workspace
cp -r ~/scceo-1/.agents/skills/<skill-name>/ ~/scceo-1/skills/<skill-name>/

# Kai Agent Global
cp -r ~/scceo-1/.agents/skills/<skill-name>/ ~/.agents/skills/<skill-name>/
```

Then push to Supabase `rule_ledger.skills` via `supabase-mcp-server execute_sql`
(project: `cjgsgowvbynyoceuaona`) — see the `add-skill` skill Step 7 for the exact upsert SQL.

Verify all three paths exist after syncing.

### Step 7 — Write the Session Summary

Create or append to a session summary note for Nick. This is the human-readable close-out. Format:

```
## Session Summary — {DATE} {SHORT-TOPIC}

**What we set out to do:**
{1-3 sentences of original intent}

**What we actually did:**
{Bulleted list of concrete deliverables — files created, bugs fixed, decisions made}

**Key decisions / why:**
{The non-obvious reasoning that future-you needs to know}

**What's still open:**
{Anything deferred, blocked, or requiring follow-up}

**Docs updated:**
{List of files touched this step}
```

Write this to: `~/scceo-1/grok-personal/data/session_notes/{YYYYMMDD}-{slug}.md`

If that directory doesn't exist, create it.

### Step 8 — Verify & Report

Confirm to Nick:

1. ✅ Work ledger updated (ID + new status)
2. ✅ Plan doc(s) updated (list each file)
3. ✅ Skills/workflows updated (list each)
4. ✅ Session summary written (path)
5. ⚠️ Any gaps that couldn't be closed (and why)

Never say "done" without naming each artifact touched.

## What to Look for in Common Scenarios

| Session Type | Primary Docs to Update |
|---|---|
| Bug fix | SOS plan file, work ledger, any affected skill docs |
| Feature build | Feature plan, work ledger, README if behavior changed |
| Rule creation/edit | `rule_ledger.rules` (Supabase), AGENT-RULES.md, work ledger |
| Skill creation | SKILL.md in both publish locations, work ledger |
| Architecture decision | Plan doc as-built section, work ledger, any affected READMEs |
| Data migration | Migration record, work ledger, any schema reference docs |
| Dispatch / planning | Jules plan files, work ledger, dispatch log |

## Important Rules

- **Never rewrite history.** Append as-built sections; do not delete original intent.
- **Never skip the ledger.** Every session must close with a ledger touch, even if docs are perfect.
- **Drift is expected, shame is not.** Plans change; the failure is leaving it unrecorded.
- **If a doc is missing, create it.** A stub with as-built notes is better than silence.
- **Update once, clearly.** One well-written as-built section beats three partial updates.
