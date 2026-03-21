---
name: Fix Skills
description: Diagnose and repair broken skill discovery across repos. Use when skills are missing, invisible, not triggering, or sync appears broken. Covers Supabase integrity checks, on-disk file validation, sync_skills.py failures, Antigravity workspace path verification, and full remediation. Use when Nick says "skills are broken", "I can't see skills", "fix skills", "skills missing in app", "sync is broken", or any time skill discovery fails in any repo.
ruleDomains:
  - ops
---

# Fix Skills

Diagnose and repair skill discovery failures across all repos. This skill encodes the exact triage process that resolved the 2026-03-21 skill sync incident.

## Diagnostic Workflow

Run steps in order. Stop as soon as the root cause is identified.

### Step 1 — Identify Scope

Ask or determine:
- Is the problem in **one repo** or **all repos**?
- Is it **one skill** or **all skills**?
- Did something change recently (new skill added, sync ran, Supabase push)?

### Step 2 — Check Supabase Integrity (Source of Truth)

```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona

-- Check all enabled skills for valid frontmatter
SELECT slug, enabled, length(skill_md) as len,
  CASE WHEN skill_md LIKE '---' || chr(10) || 'name:%' THEN 'valid_frontmatter'
       WHEN skill_md LIKE '---' || chr(10) || '%' THEN 'starts_with_dashes'
       ELSE 'INVALID'
  END as frontmatter_status
FROM rule_ledger.skills
WHERE enabled = true
ORDER BY slug;
```

**What to look for:**
- Any row with `frontmatter_status = 'INVALID'` → corrupted `skill_md`
- Any row with `len < 100` → placeholder or stub content
- Any row where the `slug` value doesn't look like a skill name (e.g. `slug` = `"slug"`)

**If corrupted rows found:**
1. Read the correct SKILL.md from `~/scceo-1/.agents/skills/<slug>/SKILL.md`
2. Upsert the correct content back to Supabase
3. Also check for disabled junk rows and clean them up

### Step 3 — Check On-Disk Files

```bash
# Count skills per location
echo "scceo-1: $(ls -1d ~/scceo-1/.agents/skills/*/ 2>/dev/null | wc -l)"
echo "app:     $(ls -1d ~/app/.agents/skills/*/ 2>/dev/null | wc -l)"
echo "rv:      $(ls -1d ~/rv/.agents/skills/*/ 2>/dev/null | wc -l)"
echo "global:  $(ls -1d ~/.agents/skills/*/ 2>/dev/null | wc -l)"
```

**If counts differ across repos** → skills weren't synced. Go to Step 5.

**Check file integrity** (valid YAML frontmatter in each SKILL.md):
```bash
for skill_dir in ~/scceo-1/.agents/skills/*/; do
    skill_name=$(basename "$skill_dir")
    skill_file="$skill_dir/SKILL.md"
    if [ -f "$skill_file" ]; then
        first_line=$(head -n 1 "$skill_file")
        has_closing=$(head -n 10 "$skill_file" | grep -c "^---$")
        size=$(wc -c < "$skill_file" | tr -d ' ')
        if [ "$first_line" != "---" ] || [ "$has_closing" -lt 2 ] || [ "$size" -lt 100 ]; then
            echo "❌ $skill_name (first='$first_line', closing=$has_closing, size=$size)"
        fi
    else
        echo "⚠️  MISSING: $skill_name"
    fi
done
```

### Step 4 — Check sync_skills.py Health

```bash
cd ~/scceo-1/grok-personal
python3 -c "import psycopg2; print('psycopg2 OK')" 2>&1
python3 sync_skills.py --dry-run 2>&1 | head -20
```

**Common failure:** `psycopg2` not installed on Homebrew-managed Python. The fix is to modify `sync_skills.py` to use `subprocess` + `psql` as a fallback, or install psycopg2 in a venv.

### Step 5 — Check Antigravity Workspace Paths

Antigravity discovers skills from `{.agents,.agent,_agents,_agent}/skills` relative to the **workspace root**.

```bash
# Find all .agents directories on the machine
find ~ -maxdepth 3 -type d -name ".agents" 2>/dev/null
```

**Critical check:** Is the workspace root the same as where the `.agents/skills/` directory lives? Common mismatch: user opens `/Users/nicholaspetros/SOS/App` but skills are in `/Users/nicholaspetros/app/.agents/skills/`.

### Step 6 — Check Antigravity Trusted Paths

```python
import json
from pathlib import Path

settings_path = Path.home() / "Library/Application Support/Antigravity/User/settings.json"
d = json.loads(settings_path.read_text())

for key in ["autoAcceptFree.trustedPaths", "antigravity-autopilot.trustedPaths"]:
    print(f"{key}: {d.get(key, 'NOT SET')}")
```

Ensure all repo roots are listed. Missing paths → skills won't be accessible.

### Step 7 — Reload Window

After any fix, the user must reload the Antigravity window:
`Cmd+Shift+P` → `Developer: Reload Window`

Antigravity caches skill discovery at startup. File changes won't be picked up until a reload.

## Remediation Playbook

### Fix Corrupted Supabase Rows

```bash
# Read correct content from disk and push to Supabase
for slug in manual-pr-verify plan-wave; do
    CONTENT=$(cat ~/scceo-1/.agents/skills/$slug/SKILL.md | sed "s/'/''/g")
    psql "$(python3 ~/scceo-1/grok-personal/scripts/resolve_rules_db_url.py)" -c "
        UPDATE rule_ledger.skills SET skill_md = '$CONTENT', updated_at = now()
        WHERE slug = '$slug';
    "
done
```

### Force Full Resync from scceo-1 to All Repos

```bash
# scceo-1/.agents/skills is always the source of truth
targets=(
    "$HOME/app/.agents/skills"
    "$HOME/rv/.agents/skills"
    "$HOME/fractional-ignite/.agents/skills"
    "$HOME/spark-kanban/.agents/skills"
    "$HOME/.agents/skills"
    "$HOME/SOS/App/.agents/skills"
    "$HOME/SOS/Web/.agents/skills"
)

for target in "${targets[@]}"; do
    if [ -d "$(dirname "$target")" ]; then
        echo "Syncing to $target"
        cp -R ~/scceo-1/.agents/skills/* "$target/" 2>/dev/null
    fi
done
```

### Clean Up Junk Supabase Rows

```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
DELETE FROM rule_ledger.skills
WHERE slug IN ('slug')
   OR (enabled = false AND length(skill_md) < 100);
```

## Verification Checklist

- [ ] All enabled Supabase rows have `frontmatter_status = 'valid_frontmatter'`
- [ ] Skill counts match across scceo-1, app, rv, and ~/.agents
- [ ] `sync_skills.py --dry-run` completes without errors
- [ ] User confirms skills are visible after window reload

## Rules This Skill Enforces

- `ops-done-means-verified-everywhere` — verify all repo locations, not just one
- `ops-production-broken-is-p0` — skill sync failure is treated as P0