---
name: "List Rules"
description: "Dump all rules from the Company Rule Ledger for quick review. Reads from local cache (no auth needed). Works from ANY workspace."
alwaysAllow:
  - Bash
ruleDomains:
  - ops
---

# List Rules — Company Rule Ledger

When Nick says "list rules", "show me the rules", "pull up the rules", or similar:

## Primary Path — Local Cache (No Auth Required)

1. **Check the local cache first** — it's fast and requires no credentials:
   - Cache location: `~/scceo-1/rules_ledger/rules_cache.json`
   - If the file exists and `synced_at` is within 24 hours → read it directly
   - If missing or >24h old → run: `cd ~/scceo-1/grok-personal && python3 distribute_rules.py`
     (this rebuilds the cache and all other distribution targets)
   - Then read the refreshed `rules_cache.json`

2. **Or use the MCP tool** (preferred for programmatic access):
   ```
   list_rules()                                     # all rules, from cache
   list_rules(domain="ops")                        # filter by domain
   list_rules(severity="critical")                 # filter by severity
   list_rules(autonomy_level="human_review")       # filter by autonomy level
   ```
   The `list_rules` tool lives in `kai_mcp_server.py` and is auto-registered
   on the `kai-brain` MCP server. It reads cache-first with 24h fallback.

3. **Output format when reading the cache directly:**
   - Total rule count
   - Breakdown by autonomy_level (e.g. `auto_safe: 4 | human_review: 2 | simulate: 21`)
   - Render all rules as a table with columns:
     `rule_key` | `name` | `domain` | `severity` | `autonomy_level` | `action_type` | `description`

## Fallback — Live Supabase Query (Only if cache unavailable)

If `distribute_rules.py` also fails (no `RULES_DATABASE_URL`), fall back to MCP:

```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT rule_key, name, domain, severity, autonomy_level, trigger_name, action_type, description
FROM rule_ledger.rules
WHERE enabled = true
ORDER BY domain ASC, severity ASC;
```

Also run the summary query:
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT autonomy_level, COUNT(*) as count
FROM rule_ledger.rules
WHERE enabled = true
GROUP BY autonomy_level
ORDER BY autonomy_level;
```

## Rules

- Cache covers rule **definitions only** (`rule_key`, `name`, `domain`, `severity`,
  `autonomy_level`, `action_type`, `description`). Heat map / hit counts are always live.
- The cache is auto-refreshed on every `distribute_rules.py` run (add-rule, update-rule,
  improve-rules, morning-dispatch all call it). No manual sync needed.
- `rules_cache.json` is in `.gitignore` — derived data, not committed.
- Supabase remains the **only write target**. The cache is read-only.
- No filtering. No pagination. Full dump — every rule, every column.
- The MCP `list_rules` tool supports `domain`, `severity`, `autonomy_level` filters.
