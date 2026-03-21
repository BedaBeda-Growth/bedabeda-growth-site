---
name: "Add Rule"
description: "Add a new rule to the Company Rule Ledger (Supabase Postgres). Works from ANY repo via MCP or direct SQL."
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Add Rule — Company Rule Ledger

Use this skill whenever Nick says "add a rule", "enforce X", "make sure Y never happens again", or describes an incident that needs a permanent policy.

## CRITICAL: This skill can be used from ANY repo, ANY workspace

Rules are stored in **Supabase Postgres** (schema: `rule_ledger`, project: SOS).
You do NOT need to be in scceo-1 to create a rule. Use any of these methods:

### Method 1: Supabase MCP (preferred — works from any Antigravity workspace)
```sql
-- Use the supabase-mcp-server execute_sql tool with project_id: cjgsgowvbynyoceuaona
INSERT INTO rule_ledger.rules ( ... ) VALUES ( ... );
```

### Method 2: Direct psql (works from any terminal)
```bash
psql "$RULES_DATABASE_URL" -c "INSERT INTO rule_ledger.rules ( ... ) VALUES ( ... );"
```

### Method 3: Python (works from any repo)
```python
import psycopg2, os
conn = psycopg2.connect(os.environ["RULES_DATABASE_URL"], options="-c search_path=rule_ledger,public")
cur = conn.cursor()
cur.execute("INSERT INTO rules ( ... ) VALUES ( ... )")
conn.commit()
```

**NEVER create a rule by only editing AGENT-RULES.md or CLAUDE.md locally. That is a static clone. Rules MUST go into Supabase first.**

---

## Schema — `rules` table (all required fields)

| Field | Type | Notes |
|---|---|---|
| `rule_key` | TEXT UNIQUE | kebab-case, domain-prefixed. e.g. `email-no-test-domains-mailinator`, `deploy-no-groq-in-prod` |
| `name` | TEXT | Short display name. e.g. `"No Groq in Production"` |
| `description` | TEXT | One sentence + incident reference if applicable |
| `domain` | TEXT | See valid values below |
| `trigger_type` | TEXT | See valid values below |
| `trigger_name` | TEXT | See valid values below |
| `priority` | INTEGER | `1` = highest, `2`, `3` |
| `severity` | TEXT | `critical`, `high`, `medium`, `low` |
| `autonomy_level` | TEXT | **Default: `simulate`** — earn trust before promoting |
| `action_type` | TEXT | See valid values below |
| `action_config_json` | TEXT | JSON object, action-specific |
| `conditions_json` | TEXT | JSON array of condition objects (AND logic) |
| `owner` | TEXT | Almost always `'kai'` |
| `enabled` | BOOLEAN | Default `true` |

**Optional fields** (include if Nick specifies):
- `cooldown_seconds` (default 0)
- `max_hits_per_hour` (default NULL)
- `recurrence_window_hours` (default 24)
- `auto_resolve_if_no_recurrence` (default 0 — set to 1 if rule should self-resolve)

---

## Valid Values

### `domain`
`email` | `payments` | `deploy` | `analytics` | `community` | `ops` | `identity` | `growth`

### `trigger_type`
`ci` | `deploy` | `webhook` | `cron` | `app_event` | `manual`

### `trigger_name` (known patterns — add new ones as needed)
| Trigger Name | Used For |
|---|---|
| `email.send_attempt` | Before any email send |
| `cron.bounce_rate_check` | Scheduled bounce monitoring |
| `deploy.completed` | After CI/CD deploy |
| `checkout.init` | Checkout cart creation |
| `payment.failed` | Payment failure events |
| `cron.compass-ingest` | Compass drift detection |
| `work.completion_claim` | When agent claims work is done |
| `rule.created_or_modified` | When a rule is created or changed |

### `autonomy_level`
| Level | Behavior |
|---|---|
| `simulate` | Observe only, no action taken. **START HERE.** |
| `auto_safe` | Executes action automatically, no guardrails |
| `auto_guarded` | Executes with retry limits + owner notification on failure |
| `human_review` | Logs the hit, escalates to human — does NOT auto-execute |

**Rule:** New rules always start in `simulate`. Promote only after Nick approves or after 50+ hits with 0 recurrences + 95% success.

### `action_type`
`block` | `retry` | `queue` | `notify` | `rollback` | `archive` | `patch` | `escalate`

### `conditions_json` — operators (11 available)
```json
[{"field": "FIELD_NAME", "op": "OPERATOR", "value": VALUE}]
```
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
| `is_null` | Field is null/missing (value: null) |

All conditions are **AND logic**. For OR logic → create separate sub-rules (see no-test-domains pattern: one rule per domain).

---

## Action Config Examples

### block
```json
{"block": true, "reason_code": "no_validation_record", "fallback": "queue_for_validation"}
```

### notify
```json
{"notify": ["nick", "kai"], "write_health": true}
```

### retry
```json
{"retry": true, "max": 1, "notify": ["nick", "kai"]}
```

### rollback
```json
{"rollback": true, "notify": ["nick", "kai"], "reason_code": "structural_gate_failure"}
```

---

## Full INSERT Template (Supabase MCP)

Use the `supabase-mcp-server execute_sql` tool with `project_id: cjgsgowvbynyoceuaona`:

```sql
INSERT INTO rule_ledger.rules (
  rule_key, name, description, domain,
  trigger_type, trigger_name,
  priority, severity, autonomy_level,
  action_type, action_config_json, conditions_json,
  owner, enabled
) VALUES (
  'DOMAIN-short-slug',
  'Display Name',
  'One sentence description. Incident: DATE if applicable.',
  'DOMAIN',
  'TRIGGER_TYPE', 'trigger.name',
  1, 'critical', 'simulate',
  'block',
  '{"block": true, "reason_code": "REASON"}',
  '[{"field": "FIELD", "op": "eq", "value": false}]',
  'kai', true
);
```

---

## Workflow

1. **Listen** — Nick describes the incident, behavior to prevent, or policy to enforce
2. **Classify** — Pick domain, trigger_type, trigger_name, action_type
3. **Draft** — Write the `rule_key` (domain-prefixed kebab-case) and conditions
4. **Show Nick** — Display the INSERT statement for review before executing
5. **Insert into Supabase** — Use MCP `execute_sql` with project `cjgsgowvbynyoceuaona` (SOS project)
6. **Verify** — Run `SELECT rule_key, name, autonomy_level FROM rule_ledger.rules WHERE rule_key = 'KEY';` via MCP to confirm it landed
7. **MANDATORY: Distribute** — Run `cd ~/scceo-1/grok-personal && python3 distribute_rules.py` to push to all repos
8. **MANDATORY: Verify Distribution** — Check that AGENT-RULES.md was updated in at least 3 repos. Don't just say "done."
9. **MEMORY.md** — Add the new rule to the HARD RULES section if it's a burned lesson

---

## Rule Key Naming Convention

```
{domain}-{short-description}
```

Examples:
- `email-validate-before-send`
- `deploy-no-groq-in-prod`
- `payment-cart-fail-detect`
- `email-no-test-domains-mailinator`

For OR-style coverage, use sub-rule suffix:
- `email-no-test-domains-testcom`
- `email-no-test-domains-mailinator`

---

## After Adding a Rule

1. New rules land in `simulate` — they observe but don't block
2. To promote: Update `autonomy_level` in Supabase via MCP
3. Heat map: `SELECT * FROM rule_ledger.rule_heat_map;` via MCP

## MANDATORY: Distribute After Every Rule Change

After adding, promoting, or modifying ANY rule, **always run distribution**:

```bash
cd ~/scceo-1/grok-personal && python3 distribute_rules.py
```

This pushes updated rules to:
- `AGENT-RULES.md` in all 5 repos (rocket, app, spark-kanban, rv, scceo)
- `AGENTS.md` in scceo-1 (active rule list)
- `~/.gemini/GEMINI.md` (global Antigravity instructions)
- `CLAUDE.md` and `.cursorrules` in all 5 repos

**Do NOT skip this step.** If rules change but aren't distributed, agents in other repos will operate on stale instructions.

## MANDATORY: Verify "Done" (Rule: ops-done-means-verified-everywhere)

Before saying this rule was added successfully, you MUST:
1. Verify it exists in Supabase (`SELECT` query)
2. Verify `distribute_rules.py` completed without errors
3. Spot-check at least 2 repo AGENT-RULES.md files to confirm they're updated
4. Consider: will an agent in another repo actually see and follow this rule?

**If you can't verify all of the above, do NOT say "done."**


---

## Variants / Absorbed Modes

### --update
Update an existing rule. Workflow: read current rule → propose changes → apply SQL UPDATE → run distribute_rules.py.
Same verification requirements as adding a new rule (verify in Supabase + spot-check AGENT-RULES.md in 2+ repos).
*(absorbed: update-rule)*
