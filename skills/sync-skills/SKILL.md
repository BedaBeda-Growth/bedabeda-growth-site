---
name: sync-skills
description: Sync skills from the Supabase rule ledger to local agent repositories, validating their availability. Use when Nick says 'sync skills', 'run sync skills', or when skills are missing and need to be pulled down from the global registry.
ruleDomains:
  - ops
---

# Sync Skills

## Overview
This skill executes the skill distribution function (`sync_skills.py`) to pull all enabled skills from the Supabase `rule_ledger.skills` table (the single source of truth) and writes them to the local `skills/` directories, ensuring they are available for use by agents.

## Step 1: Run the Sync Script

To sync skills to the current repository, run:

```bash
cd <repo-root>
python3 ~/scceo-1/grok-personal/sync_skills.py
```

To sync across **all common repos** (e.g., scceo-1, kai-agent, freely, rocket), loop through them:

```bash
for repo in ~/scceo-1 ~/Desktop/kai-agent ~/rocket ~/freely ~/.agents; do
    if [ -d "$repo" ]; then
        echo "Syncing $repo..."
        cd "$repo"
        python3 ~/scceo-1/grok-personal/sync_skills.py --target "$repo/skills"
    fi
done
```

## Step 2: Confirm Availability

Verify that the terminal output confirms the sync was successful.
Check the local `skills/` directory to ensure Antigravity can read them:

```bash
ls -la skills/
```