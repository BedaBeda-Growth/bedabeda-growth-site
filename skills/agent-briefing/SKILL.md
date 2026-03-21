---
name: agent-briefing
description: >
  Generate a single portable master markdown file (AGENT-BRIEFING.md) that contains
  the full SCCEO operating context: identity, complete skills catalog with definitions,
  active rules catalog, and behavioral guidelines — formatted for handoff to any
  intelligent agent. Use when Nick says "generate agent briefing", "export context pack",
  "make a master context file", "brief another agent", "what skills and rules do we have",
  "create an agent handoff doc", or any time a consolidated AI-readable context export
  is needed.
ruleDomains:
  - ops
---

# Agent Briefing

Generates a single exportable `AGENT-BRIEFING.md` with four sections:
1. **Identity** — who SCCEO is, current goal, tech stack, core team
2. **Skills Catalog** — every enabled skill with slug, name, full description
3. **Rules Catalog** — every active rule with key, domain, severity, autonomy level, description
4. **Behavioral Guidelines** — 12 non-negotiable rules for any agent in this system

## Run It

```bash
python3 ~/.agents/skills/agent-briefing/scripts/generate_briefing.py
```

Default output: `~/Desktop/Rocket/AGENT-BRIEFING.md`

Custom output path:
```bash
python3 ~/.agents/skills/agent-briefing/scripts/generate_briefing.py \
  --output /path/to/AGENT-BRIEFING.md
```

## How It Loads Data

**Skills:** Walks `~/.agents/skills/*/SKILL.md`, parses YAML frontmatter. Skips `ARCHIVED_*` dirs.

**Rules:** Tries `psql $RULES_DATABASE_URL` first (live Supabase). Falls back to local `~/scceo-1/rules_ledger/rules.db` (SQLite) if psql is unavailable.

## Output

```
Loading skills...
  87 skills loaded
Loading rules...
  16 rules loaded

Generated: 87 skills + 16 rules → ~/Desktop/Rocket/AGENT-BRIEFING.md
```

Share the output file directly with any agent. It requires no additional context to be actionable.