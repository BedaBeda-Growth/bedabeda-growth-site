# SYSTEM RULES — MANDATORY FOR ALL CONVERSATIONS

These rules apply to EVERY conversation in EVERY workspace. No exceptions.

## RULE ZERO: Ledger First — No Exceptions

**Before you write a single line of code or make any change, you MUST:**

1. **Check if this work has a ledger entry.** Run:
   ```
   psql $RULES_DATABASE_URL -c "SELECT rule_key, name FROM rule_ledger.rules WHERE enabled=true;"
   ```
   OR check `~/scceo-1/grok-personal/data/work_ledger.json`

2. **If no ledger entry exists, CREATE ONE FIRST.** Use a temporary ID: `AUTO-{YYYYMMDD}-{SHORT-DESCRIPTION}`
3. **Tell the user** what ledger entry this work maps to before proceeding.

**Why:** If work isn't in the ledger, it doesn't exist centrally. It can't be prioritized, verified, or learned from. Untracked work = wasted work.

**Enforced by:** Rule `ops-work-must-be-tracked` (critical, auto_guarded)

## RULE ONE: Rules Apply Everywhere

Before making changes in ANY repo, check for relevant rules:
- Run `psql $RULES_DATABASE_URL -c "SELECT rule_key, name FROM rule_ledger.rules WHERE enabled=true;"`
- If you don't know which rules apply, check the database.

## RULE TWO: "Done" Means Verified Everywhere

When you confirm something is done, you MUST:
1. Enumerate every location/repo/system the change was supposed to affect
2. Verify each location individually — not assume, not hope, VERIFY
3. Consider the experience — what will actually happen when a user or agent encounters this?
4. If you cannot verify all locations, say "partially done" and list what's unverified

**Enforced by:** Rule `ops-done-means-verified-everywhere` (critical, auto_guarded, action: block)

## RULE THREE: Rules Are Created Centrally, Distributed Universally

When creating or modifying a rule from ANY workspace:
1. INSERT into Supabase (SOS project `cjgsgowvbynyoceuaona`, schema `rule_ledger`)
2. Run distribution: `cd ~/scceo-1/grok-personal && python3 distribute_rules.py`
3. NEVER create a rule by only editing AGENT-RULES.md or CLAUDE.md in one repo

**Enforced by:** Rule `ops-rule-creation-must-distribute` (critical, auto_guarded, action: block)

## Work Tracking Protocol

Every significant action (code changes, architecture decisions, new features, bug fixes) must be:
1. Tracked in the work ledger BEFORE starting
2. Updated with status when complete
3. Verified against acceptance criteria

## Creating Rules from Any Workspace

You are NOT limited to the scceo-1 repo. From any workspace:
```
# Via Supabase MCP (preferred — works in Antigravity):
Use supabase-mcp-server execute_sql tool with project_id: cjgsgowvbynyoceuaona
INSERT INTO rule_ledger.rules (...) VALUES (...);

# Via terminal (works anywhere):
psql "$RULES_DATABASE_URL" -c "INSERT INTO rule_ledger.rules (...) VALUES (...);"

# Then distribute:
cd ~/scceo-1/grok-personal && python3 distribute_rules.py
```

## Operational Memory (OpenViking / ChromaDB)

A semantic vector memory layer is available for all agents. It stores past outcomes,
incidents, rules, and daily context — enabling similarity search across all prior work.

**Before planning or diagnosing**, check memory for prior context:
```bash
# Pre-plan memory brief — finds similar past outcomes and known dead ends
python3 ~/scceo-1/openviking/scripts/pre_plan_memory.py --domain "{domain}" --title "{title}" --format markdown

# Health check — verify memory layer is running
python3 ~/scceo-1/openviking/scripts/memory_health.py
```

**Direct file access** (no scripts needed):
- Today's overview: `~/scceo-1/exports/openviking/daily/$(date +%Y-%m-%d)/overview.md`
- Latest health: `~/scceo-1/openviking/logs/health-latest.json`
- Past outcomes: `~/scceo-1/exports/openviking/outcomes/`
- Active issues: `~/scceo-1/exports/openviking/megafix/`

**When to use:** Before writing any plan. Before diagnosing any issue. The memory layer
catches repeat mistakes and surfaces analogous fixes from prior work.

_Last distributed: 2026-03-21 17:56 UTC_
