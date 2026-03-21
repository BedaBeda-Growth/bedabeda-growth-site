---
name: git-clean
description: |
  Scan local git branches for uncommitted changes (untracked files, modified files) and 
  automatically commit and push them to preserve all work. Designed to be called from 
  other processes (pipeline, jewels) to ensure no work is lost before merges.
  Use when: (1) Before merging PRs, (2) As part of send-to-jewels workflow, 
  (3) Before clearing pipeline stages, (4) Any time you want to ensure all local work is pushed.
---

# Git Clean

## Overview

Automatically scans all local branches for uncommitted changes and pushes them to GitHub. Designed to preserve all work with minimal human intervention—auto-generates commit messages and handles the full push workflow.

## Workflow Decision Tree

```
Start
  │
  ▼
Get all local branches
  │
  ▼
For each branch:
  │
  ▼ Check for uncommitted changes?
       │
       ├─ NO ──▶ Skip branch, continue
       │
       └─ YES ──▶ Stage all changes
                   │
                   ▼
              Generate commit message
                   │
                   ▼
              Commit changes
                   │
                   ▼
              Push to remote
                   │
                   ▼
              Continue to next branch
  │
  ▼
Report summary
```

## Decision Rules

| Condition | Action |
|-----------|--------|
| Untracked files exist | Stage all with `git add -A`, include in commit |
| Modified staged files exist | Commit with staged changes |
| Modified unstaged files exist | Stage and include in commit |
| Branch has no changes | Skip silently |
| Branch is ahead of remote | Push to sync |
| Branch has remote but diverged | Force push (preserve local) after warning |

**Commit Message Generation:**
- Format: `[branch-name] WIP: <summary>`
- Summary generated from: file count + file types changed
- Example: `main WIP: 3 files modified (py, md, json)`

## Usage

### Direct Call
```bash
# Run the clean script
python3 scripts/git_clean.py [--repo-path <path>] [--dry-run]
```

### From Another Skill/Process
Call this skill as part of workflows:
- **clear-pipeline**: After processing items, before marking complete
- **send-to-jewels**: Before pushing to jewels, ensure local is synced
- **pre-merge**: Before any merge operation

### Options
- `--repo-path`: Path to git repository (default: current directory)
- `--dry-run`: Show what would be done without executing
- `--branch`: Clean specific branch only (default: all branches)

## Integration Points

This skill is designed to be **callable** from other processes:

1. **clear-pipeline skill**: Call after processing each item to preserve work
2. **send-to-jewels skill**: Call before pushing to jewels to ensure sync
3. **Any merge workflow**: Call before merge to prevent work loss

To call from another skill:
```markdown
Run git-clean skill to ensure all local branches are synced before proceeding.
```

## Output Format

The skill outputs a summary table:

| Branch | Status | Changes | Action |
|--------|--------|---------|--------|
| main | ✅ Clean | 0 files | Skipped |
| feature/login | ⚡ Pushed | 3 files | Committed & pushed |
| bugfix/api | ⚡ Pushed | 1 file | Committed & pushed |

## Safety Rules

1. **Never discard work**: Always commit before any destructive operations
2. **Preserve all changes**: Both staged and unstaged
3. **Auto-push**: Push after every commit to ensure remote sync
4. **Dry-run first**: Use `--dry-run` to preview actions before execution

## Resources

### scripts/
- `git_clean.py` - Main executable script for scanning and cleaning branches
