---
name: "Read The Rules"
description: "Run the incident close-the-loop workflow whenever Nick says 'read the rules', asks what rule was violated, wants a root cause analysis, says something should not happen again, or wants to patch the system after a failure. Read the relevant rules, identify violated/missing/ambiguous rules and skill gaps, then propose the smallest durable prevention patch and how recurrence will be prevented or detected next time."
ruleDomains:
  - ops
---

# Read The Rules

Use this skill whenever Nick says:
- "read the rules"
- "what rule did we break"
- "what went wrong"
- "do an RCA"
- "root cause analysis"
- "this should never happen again"
- "patch the system"
- "how do we prevent this next time"

## Core Purpose

This skill turns an incident, miss, recurrence, or preventable failure into a **single close-the-loop pass**.

Do not stop at diagnosis.
Do not stop at listing rules.
Do not stop at suggesting a fix to the immediate problem.

The job is to convert the failure into durable operating memory.

**Every single time this skill is called, create a NEW incident report document. Do not overwrite, update in place, or silently reuse a prior incident report file.**

This is mandatory because recurrence frequency matters. Separate incident documents create an auditable trail showing how often the same class of mistake keeps happening.

The loop is:

**Incident → New incident report document → Relevant rules → Violated / missing / ambiguous rules → Skill gaps → Prevention patch → Recurrence control**

## Mandatory Workflow

Follow these steps in order.

### Step 0 — Ledger Mapping

Before doing anything else:
1. Check whether the work already maps to an existing work ledger item.
2. If not, create or note a temporary ledger ID using this pattern:
   - `AUTO-{YYYYMMDD}-read-the-rules-{short-slug}`
3. Tell Nick which ledger item or temporary ID this review maps to.

If this skill is used inside broader work that already has a ledger item, reuse it instead of creating a second competing item.

### Step 1 — Summarize the Incident

Write a concise incident summary:
- what happened
- what was expected
- what impact or risk was created
- whether this is a first-time failure or a recurrence

If context is thin, say so explicitly instead of pretending certainty.

### Step 1.5 — Write the Incident Report Document

Before moving into rule analysis, write the incident report as a markdown document to the **closest durable review folder**.

Use this location priority:

1. **Repo-local default** — if a specific repo is clearly affected, write to:
   - `docs/incidents/{YYYYMMDD}-{short-slug}.md`
2. **Central fallback** — if multiple repos are involved, no repo is clearly primary, or you are working from a meta-ops context, write to:
   - `/Users/nicholaspetros/scceo-1/grok-personal/data/session_notes/{YYYYMMDD}-incident-{short-slug}.md`

If the repo-local `docs/incidents/` folder does not exist, create it before writing the report. Do not skip the report because the folder is missing.

Create a **fresh file on every invocation** of this skill. Even if the issue looks identical to a prior incident, write a new report for this occurrence. Do not append a new incident into an older report and do not reuse the previous file path.

This is mandatory. The report must exist as a durable review artifact so future rule-optimization and system-improvement passes can scan real incidents instead of relying on memory. Repeated mistakes must leave repeated artifacts so recurrence frequency is visible.

At minimum include:
- incident title
- date/time
- ledger item or temporary ID
- incident summary
- affected repo/system/workflow
- current status (`open`, `partial`, `patched`, or `monitoring`)

After writing it, reference the exact document path in the response.

### Step 2 — Read the Relevant Rules

Read the smallest relevant rule set first.
Do **not** dump every rule unless Nick explicitly asks for the full rule ledger.

Always include:
- the specific rules that appear directly relevant to the incident
- any nearby meta-rules governing tracking, verification, rule distribution, or prevention if they clearly apply

When useful, group rules into:
- directly applicable rules
- adjacent rules
- missing coverage areas

### Step 2.5 — Rule Memory: Prior Hits and Resolutions

After loading the relevant rules, check OpenViking rule memory for historical patterns:

```bash
# Top rules by hit frequency
cat /Users/nicholaspetros/scceo-1/exports/openviking/rules/heatmap.json 2>/dev/null | \
  python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for r in data[:5]:
        print(f\"  {r['rule_key']}: {r.get('hit_count',0)} hits\")
except: print('  (no heatmap data)')
" 2>/dev/null || echo "  (heatmap not available)"

# Prior resolutions for this domain
ls /Users/nicholaspetros/scceo-1/exports/openviking/rules/resolutions/ 2>/dev/null | head -10 || echo "  (no resolutions yet)"
```

Use this to surface:
- **High-frequency rules** — rules that fire most often are structural root causes, not one-off misses
- **Prior resolutions** — if the same rule was resolved before, don't re-debate the fix
- **Recurrence signal** — if this incident matches a prior resolution, it is a recurrence, not a first instance

If memory is unavailable (export dir missing), skip this step and note it — do not block.

### Step 3 — Classify the Failure Mechanism

Every run must classify the issue into one or more of these buckets:
- **existing rule violated**
- **missing rule**
- **ambiguous rule**
- **weak enforcement**
- **stale skill**
- **missing skill**
- **monitoring gap**
- **outcome tracking gap**
- **llm-over-python** — an LLM skill was used for work a Python script could handle (rule: `ops-prefer-python-over-llm`)

Do not force everything into "missing rule". Sometimes the rule exists but the skill, enforcement path, or monitoring loop is the real problem.

### Step 4 — Identify Rule and Skill Deltas

For each relevant gap, state clearly:
- which existing rule was violated or insufficient
- what wording, trigger, enforcement, or scope failed
- which skill(s) contributed to the miss, if any
- whether the best patch is a new rule, a tightened rule, a new skill, a skill update, a monitoring addition, or an outcome-tracking addition

Prefer the **smallest durable patch** that would have changed future behavior.

### Step 5 — Propose the Prevention Patch

For each recommended patch, include:
- **type**: `add rule` | `tighten rule` | `add skill` | `tighten skill` | `monitoring` | `outcome tracking`
- **change**: the proposed update
- **why this is the smallest durable fix**
- **expected effect**: how this reduces recurrence
- **owner**: who should own the follow-through

If multiple patches are possible, rank them and call out the best immediate move.

### Step 6 — Define Recurrence Control

End by stating exactly how the system should behave next time.

Use one of these forms:
- **Prevented next time because:** ...
- **Detected earlier next time because:** ...
- **Escalated faster next time because:** ...

If recurrence still remains possible, say what residual risk remains.

## Output Format

Use this structure every time:

# READ THE RULES — [DATE/TIME]

## Incident Summary
- What happened:
- Expected behavior:
- Impact / risk:
- Recurrence status:

## Incident Report Document
- Path:
- Status:
- New file created for this invocation: yes

## Relevant Rules
- **Directly applicable:**
- **Adjacent / governing:**
- **Coverage gaps noticed:**

## Failure Classification
- existing rule violated:
- missing rule:
- ambiguous rule:
- weak enforcement:
- stale skill:
- missing skill:
- monitoring gap:
- outcome tracking gap:

## Violated / Missing / Ambiguous Rules
- Rule:
  - Status: violated | missing | ambiguous | insufficient
  - Why:
  - What would need to change:

## Skill Gaps
- Skill:
  - Issue:
  - Recommended change:

## Prevention Patch
1. **[Patch title]**
   - Type:
   - Change:
   - Why this is the smallest durable fix:
   - Expected effect:
   - Owner:

## Recurrence Control
- Prevented / detected next time because:
- Residual risk:

## Important Rules

- Do not just list rules — connect them to the incident.
- Do not automatically assume a new rule is needed.
- Prefer tightening an existing rule or skill when that is enough.
- The run is incomplete until a new incident report markdown file is written for this specific invocation.
- If the issue is really stale guidance, say that directly.
- If the issue is really weak enforcement or missing outcome tracking, say that directly.
- If the same issue has happened before, treat recurrence as evidence that the current loop is incomplete.
- If a patch is recommended, make it concrete enough that another skill can implement it.
- If asked to implement the patch, route to the appropriate skill:
  - `add-rule`
  - `update-rule`
  - `add-skill`
  - `outcome-record`
  - `improve-rules`

## Success Criteria

This skill has done its job when the output makes all of these clear:
1. What happened
2. Which rules actually mattered
3. Whether the failure was rule, skill, enforcement, monitoring, or outcome related
4. What the smallest durable prevention patch is
5. How the system becomes more self-correcting next time


---

## Variants / Absorbed Modes

### --list
Raw dump of all active rules: rule_key, name, domain, severity. No analysis, just the full list.
*(absorbed: list-rules)*