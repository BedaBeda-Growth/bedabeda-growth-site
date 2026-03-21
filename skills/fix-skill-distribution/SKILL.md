{---
name: "Fix Skill Distribution"
description: "Bulletproof repair for the skill distribution system. Run when skills are missing, broken, or inaccessible in any repo. Self-heals everything."
ruleDomains:
  - ops
---

# Fix Skill Distribution

## When to Use

Run this skill when:
- Skills are missing from a repo
- @skill-name references fail
- A git checkout/pull/reset/clean nuked skills
- A new repo was cloned and needs skills
- Any agent reports "skill not found"
- Nick says "skills are broken" or "fix skills"

## Architecture (Why This Works)

```
Supabase rule_ledger.skills     <- Source of truth (89+ skills)
        | sync
~/.skills/                      <- Local cache. OUTSIDE all git repos.
        | copy (real files, NOT symlinks)
repo/.agents/skills/            <- Real directories. Antigravity reads these.
        + git-tracked           <- Git cannot nuke tracked files.
```

**Why real copies, not symlinks?**
- Antigravity's file scanner does NOT follow symlinks for skill discovery
- It treats symlinks as files (29 bytes), never traverses into the target
- Real directories with real SKILL.md files = Antigravity discovers them

**Why git-tracked (not gitignored)?**
- Git-tracked files survive branch switches, pulls, and resets without deletion
- DO NOT add `.agents/skills/` to `.gitignore`

### Full Repair (Rules + Skills)
```bash
python3 ~/scceo-1/grok-personal/distribute_rules.py
```

## Repo Map (11 repos)

| Repo | Path |
|------|------|
| scceo-1 | `~/scceo-1` |
| app | `~/SOS/App` |
| rocket | `~/SOS/Rocket/fractional-ignite` |
| spark-kanban | `~/SOS/MIni SOS/spark-kanban` |
| rv | `~/rv` |
| auto1 | `~/SOS/Auto-1` |
| web | `~/SOS/Web` |
| pinchpay | `~/SOS/pinch-pay-dash` |
| portal | `~/SOS/SOS 2/portal` |
| bedabeda | `~/SOS/bedabeda-growth-site` |
| spark-skill-build | `~/SOS/FreelySite/spark-skill-build` |

**To add a new repo:** Edit `REPO_MAP` in `~/scceo-1/grok-personal/distribute_rules.py`, then run the repair command.

## Adding a New Skill

1. Insert into Supabase: `INSERT INTO rule_ledger.skills (slug, name, skill_md, enabled) VALUES (...)`
2. Run: `python3 ~/scceo-1/grok-personal/distribute_rules.py` (full sync + distribute)
3. Skill is now real-copied into all 11 repos and discoverable by Antigravity

## Troubleshooting

**"Skills show in terminal but Antigravity does not see them"**
-> `.agents/skills/` is probably a symlink. Run the repair command to replace with real copies.

**"ModuleNotFoundError: psycopg2"**
```bash
pip3 install psycopg2-binary
```

**"RULES_DATABASE_URL not set"**
-> Use `--distribute` which only needs the local `~/.skills/` cache (no DB).

**A new repo was cloned and has no skills**
```bash
# Add it to REPO_MAP in distribute_rules.py, then:
python3 ~/scceo-1/grok-personal/distribute_rules.py
```
}