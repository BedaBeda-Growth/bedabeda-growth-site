---
name: "Update Rule"
description: "Propose and apply modifications to an existing rule in the Company Rule Ledger (Supabase Postgres). Works from ANY repo via MCP or direct SQL."
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Update Rule — Company Rule Ledger

Use this skill whenever Nick says:
- "update rule X"
- "tighten rule X"
- "change the condition / action / severity on rule X"
- "relax rule X"
- "rename rule X"
- "disable rule X"
- "the rule for X is wrong, fix it"

This is **not** for adding new rules → use `add-rule` skill.
This is **not** for broad rule system review → use `improve-rules` skill.

## CRITICAL: This skill can be used from ANY repo, ANY workspace

Rules are stored in **Supabase Postgres** (schema: `rule_ledger`, project: SOS `cjgsgowvbynyoceuaona`).

### Method 1: Supabase MCP (preferred — works from any Antigravity workspace)
```sql
-- Use the supabase-mcp-server execute_sql tool with project_id: cjgsgowvbynyoceuaona
UPDATE rule_ledger.rules SET field = value, updated_at = NOW() WHERE rule_key = 'KEY';
```

### Method 2: Direct psql (works from any terminal)
```bash
psql "$RULES_DATABASE_URL" -c "UPDATE rule_ledger.rules SET field = value, updated_at = NOW() WHERE rule_key = 'KEY';"
```

**NEVER update a rule by only editing AGENT-RULES.md or CLAUDE.md locally.**
**Enforced by:** Rule `ops-rule-creation-must-distribute` (critical, auto_guarded, action: block)

---

## Workflow

### Step 0 — Rule Zero Check (MANDATORY)
Before doing anything, confirm there is a work ledger entry for this change.

If one exists, note it. If not, create a temporary entry:
```
AUTO-{YYYYMMDD}-update-rule-{rule-key}
```
Tell Nick which ledger entry this work maps to.

### Step 1 — Fetch Current State

Pull the full current record via MCP:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT rule_key, name, description, domain, trigger_type, trigger_name,
       priority, severity, autonomy_level, action_type,
       action_config_json, conditions_json, owner,
       cooldown_seconds, enabled, auto_resolve_if_no_recurrence,
       created_at, updated_at
FROM rule_ledger.rules WHERE rule_key = 'KEY';
```

Display the current state clearly before proposing any changes.

### Step 2 — Blast Impact Evaluation

Before proposing any modification, score the change:

| Dimension | Question | Answer |
|---|---|---|
| **Scope** | How many workflows / users / agents does this rule touch? | narrow / broad / global |
| **Direction** | Does this make the rule stricter or more permissive? | stricter / permissive / neutral |
| **Autonomy risk** | Does this proposal touch `autonomy_level`? | yes / no |
| **Friction delta** | Does this add steps, delays, or human reviews? | more / less / same |
| **Speed benefit** | Does the change make the system faster or more reliable? | yes / no / unknown |
| **Rollback path** | Can this be undone in < 2 minutes if wrong? | yes / no |

**Gate:** Only propose the change if:
- Speed benefit ≥ friction cost, OR
- The change prevents a known recurrence / incident, OR
- Nick explicitly acknowledges and accepts the tradeoff.

If the blast is HIGH and rollback is NO — pause and surface to Nick before proceeding.

### Step 3 — Binary Outcome Definition

Every modified rule MUST have clearly stated binary pass/fail acceptance criteria.

Format:
```
PASS: [Exactly what must be true for this rule to be considered working]
FAIL: [Exactly what constitutes a failure — no grey area]
```

Example:
```
PASS: Every email.send_attempt with email containing "@mailinator.com" is blocked before send.
FAIL: Any email sent to a @mailinator.com address after the rule is enabled.
```

**Do not proceed** if acceptance criteria cannot be stated in binary terms.
If the criteria are fuzzy, the rule scope is too broad — split or narrow it first.

### Step 4 — Propose the Diff

Show a clear before/after diff for every field being changed. Do not show unchanged fields.

Format:
```
RULE: {rule_key}
CHANGE REASON: {why this modification is needed}

FIELD           BEFORE                          AFTER
─────────────────────────────────────────────────────────────
severity        medium                          high
conditions_json [{old}]                         [{new}]
action_config   {old}                           {new}
```

**Do not execute the UPDATE until Nick approves or says "do it".**

### Step 5 — Autonomy Level Protection

**HARD CONSTRAINT: Never promote autonomy_level in a single update.**

Autonomy promotion follows a separate, deliberate path:
- `simulate` → `human_review` → `auto_safe` → `auto_guarded`
- Each step requires Nick's explicit approval + evidence (50+ hits, 0 recurrences, 95% success rate)

If the proposed change includes an autonomy_level increase, **separate it** from other field changes.
Tell Nick: "Autonomy promotion is a deliberate step. I'll apply the other changes now and surface the promotion as a separate action."

The only allowed direction in a single update is **downgrade** (stricter observation), never upgrade.

### Step 6 — Execute the UPDATE

Run via Supabase MCP:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
UPDATE rule_ledger.rules SET
  field1 = 'new_value1',
  field2 = 'new_value2',
  updated_at = NOW()
WHERE rule_key = 'TARGET_KEY';
```

### Step 7 — Verify

Confirm the change landed correctly via MCP:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT rule_key, name, severity, autonomy_level, updated_at FROM rule_ledger.rules WHERE rule_key = 'KEY';
```

Fail loudly if the row doesn't reflect the expected new values.

### Step 8 — MANDATORY: Distribute

**Always run distribution after any rule change.** No exceptions.

```bash
cd ~/scceo-1/grok-personal && python3 distribute_rules.py
```

This pushes updated rules to:
- `AGENT-RULES.md` in all 5 repos (rocket, app, spark-kanban, rv, scceo)
- `AGENTS.md` in scceo-1 (active rule list)
- `~/.gemini/GEMINI.md` (global Antigravity instructions)
- `CLAUDE.md` and `.cursorrules` in all 5 repos

**If you skip this, the change is invisible to all other agents.** The Supabase change is NOT the finish line.

### Step 9 — MANDATORY: Verify Distribution (Rule: ops-done-means-verified-everywhere)

Before saying the rule update is done:
1. Verify it exists in Supabase with updated values
2. Verify distribute_rules.py completed without errors
3. Spot-check at least 2 repo files to confirm they're updated

### Step 10 — MEMORY.md (if burned lesson)

If this update was triggered by an incident or a recurrence, add a short entry to the HARD RULES section of the relevant `MEMORY.md`:

```
- [DATE] Updated rule {rule_key}: {one sentence on what changed and why}
```

---

## Modifiable Fields Reference

| Field | Notes |
|---|---|
| `name` | Short display name — keep concise |
| `description` | One sentence. Add incident date if applicable. |
| `domain` | `email` / `payments` / `deploy` / `analytics` / `community` / `ops` / `identity` / `growth` |
| `trigger_type` | `ci` / `deploy` / `webhook` / `cron` / `app_event` / `manual` |
| `trigger_name` | See `add-rule` skill for known patterns |
| `priority` | `1` = highest |
| `severity` | `critical` / `high` / `medium` / `low` |
| `autonomy_level` | See autonomy protection rule above — never auto-promote |
| `action_type` | `block` / `retry` / `queue` / `notify` / `rollback` / `archive` / `patch` / `escalate` |
| `action_config_json` | JSON object — see action config examples in `add-rule` skill |
| `conditions_json` | JSON array — AND logic. For OR logic → split into sub-rules. |
| `enabled` | `true` = active, `false` = disabled (use to pause a rule without deleting it) |
| `cooldown_seconds` | Time between repeated actions |
| `max_hits_per_hour` | Rate cap |
| `recurrence_window_hours` | Default 24 |
| `auto_resolve_if_no_recurrence` | `1` = auto-resolve if no repeat |

**Never change:** `rule_key`, `id`, `created_at`
→ If `rule_key` needs to change, deprecate and create a new rule instead.

---

## Quick Reference: Conditions Operators

| Operator | Use case |
|---|---|
| `eq` | Exact match |
| `neq` | Not equal |
| `gt` / `gte` | Greater than (numeric) |
| `lt` / `lte` | Less than (numeric) |
| `contains` | Substring in string |
| `not_contains` | Substring NOT in string |
| `starts_with` | Prefix match |
| `ends_with` | Suffix match |
| `is_null` | Field is null/missing |

All conditions are AND logic. For OR logic → use sub-rules (see `add-rule` for naming pattern).
