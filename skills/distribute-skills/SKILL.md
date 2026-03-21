---
name: Distribute Skills
description: Sync and distribute all skills from Supabase to every repo so Antigravity can discover them. Use when Nick says "distribute skills", "sync skills", "skills are missing", "push skills to repos", "run skill fortress", or when skills have just been created/updated and need to propagate. Also use when adding a new repo to the skill map. The core mechanism is skill_fortress.py which: (1) pulls from Supabase rule_ledger.skills → ~/.skills/ cache, (2) copies real directories into each repo''s skills/ folder (git-tracked, never gitignored), (3) verifies health. Skills MUST be real directories — symlinks are NOT followed by Antigravity''s scanner.
ruleDomains:
  - ops
---

# Distribute Skills

Distribute all skills from Supabase to every repo so Antigravity can discover and use them.

## Architecture (Why This Works)

```
Supabase rule_ledger.skills (76 skills — source of truth)
        ↓ sync_from_supabase()
~/.skills/                    ← Local cache OUTSIDE all git repos
        ↓ distribute_to_repos()
repo/skills/                  ← REAL directories (not symlinks). Git-tracked.
```

**Critical constraints:**
- Skills must live at `{repo}/skills/` — Antigravity reads this path
- Must be **real directories with real SKILL.md files** — Antigravity does NOT follow symlinks
- Must be **git-tracked** — `.gitignore` would let `git clean` nuke them
- `~/.skills/` cache lives outside all git repos so git can never touch it

## Quick Commands

```bash
# Full sync + distribute + verify (recommended)
python3 ~/scceo-1/grok-personal/skill_fortress.py

# Just distribute from local cache (no DB needed)
python3 ~/scceo-1/grok-personal/skill_fortress.py --distribute

# Health check only
python3 ~/scceo-1/grok-personal/skill_fortress.py --health-check

# Full repair (fixes broken symlinks, empty repos, etc.)
python3 ~/scceo-1/grok-personal/skill_fortress.py --repair
```

## When to Run Full vs Distribute-Only

| Trigger | Command |
|---------|---------|
| New skill created / skill updated in Supabase | `skill_fortress.py` (full sync) |
| Skills missing from a repo | `skill_fortress.py --repair` |
| Just want to re-copy from cache | `skill_fortress.py --distribute` |
| Verify everything is connected | `skill_fortress.py --health-check` |
| `RULES_DATABASE_URL` not set | `skill_fortress.py --distribute` |

## Standard Distribution Workflow

1. **Check ledger entry exists** for any work being tracked
2. **Run full sync** (pulls latest from Supabase + distributes to all repos):
   ```bash
   python3 ~/scceo-1/grok-personal/skill_fortress.py
   ```
3. **Review output** — every repo should show `N copied, M unchanged`
4. **Verify health** — output should end with "ALL GOOD. Skills are bulletproof."

## Adding a New Repo

Edit `REPO_MAP` in `~/scceo-1/grok-personal/skill_fortress.py`:

```python
REPO_MAP = {
    ...
    "new-repo": Path.home() / "path/to/new-repo",
}
```

Then run `python3 skill_fortress.py --distribute` to populate it.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Skills visible in terminal but Antigravity doesn't see them | `skills/` is a symlink — run `--repair` |
| `ModuleNotFoundError: psycopg2` | `pip3 install psycopg2-binary` |
| `RULES_DATABASE_URL not set` | Use `--distribute` (uses local cache only) |
| A repo shows "repo missing" | Repo path in `REPO_MAP` is wrong — check `skill_fortress.py` |
| 0 skills after distribute | `~/.skills/` cache is empty — run full sync first |

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

To verify the current map: `grep -A 20 "REPO_MAP" ~/scceo-1/grok-personal/skill_fortress.py`
