---
name: push-to-prod
description: Push a fully verified local branch to production. Handles the complete sequence of (1) preserving the current branch to git, (2) switching to the prod environment via switch-env.sh, (3) merging the branch into main locally, (4) applying Supabase migrations to the production DB via `supabase db push --include-all`, and (5) pushing main to origin. Use when Nick or the system says "push to prod", "ship it", "go live", "deploy to main", or "final push". LLM justified — conflict resolution, migration drift, and environment selection require judgment that a script alone cannot provide safely.
ruleDomains:
  - ops
  - engineering
---

# Push to Prod

Automates the end-to-end production deployment sequence for a fully verified branch.

## Prerequisites

1. You are on a verified non-`main` branch (e.g. `ci-testing-verify`)
2. All CI gates have passed (unit tests + Playwright E2E green)
3. `supabase` CLI is linked to the production project (run `supabase link` if not)
4. `switch-env.sh` exists in repo root or `./scripts/`

## Standard Workflow

Run the bundled script from the repo root:

```bash
bash .agents/skills/push-to-prod/scripts/push_to_prod.sh
```

Use `--dry-run` to preview steps without executing:

```bash
bash .agents/skills/push-to-prod/scripts/push_to_prod.sh --dry-run
```

### What the script does

| Step | Action |
|------+--------|
| 1 | `git add -A && git commit && git push origin HEAD` — preserves branch |
| 2 | `./switch-env.sh prod` — point Supabase CLI and .env to production |
| 3 | `git checkout main && git merge <branch>` — merges locally |
| 4 | `supabase db push --include-all` — applies all pending migrations to prod DB |
| 5 | `git push origin main` — ships the merged code |
| 6 | Auto-close all in-flight work ledger items for this repo as `done` in Supabase |

## Step 6 — Auto-Close Work Ledger Items

After a successful push, run this via `supabase-mcp-server execute_sql` (project `cjgsgowvbynyoceuaona`):

```sql
UPDATE public.work_ledger
SET
  status = 'done',
  notes = notes || jsonb_build_array(
    jsonb_build_object(
      'at', NOW(),
      'text', '[push-to-prod] Shipped to production. Full CI suite green. Branch merged to main and verified.'
    )
  ),
  updated_at = NOW()
WHERE repo = 'rocket'  -- change to match the repo slug being deployed
  AND status IN ('in_progress', 'built', 'verified');
```

Then confirm the close count:

```sql
SELECT id, title, status, updated_at
FROM public.work_ledger
WHERE repo = 'rocket'
  AND status = 'done'
ORDER BY updated_at DESC
LIMIT 20;
```

Full CI green + shipped to main = done by definition. No manual ID selection required.

## Conflict Resolution

### Merge Conflicts (Step 3)
The script exits with code `2` and lists conflicted files. Resolve by:
1. Opening each file and resolving `<<<<<<<` markers
2. `git add -A && git commit`
3. Re-run step 4 and 5 manually:
   ```bash
   supabase db push --include-all
   git push origin main
   ```

### Migration Conflicts (Step 4)
If `supabase db push` fails with a conflict:
1. Run `supabase db diff --linked` to see drift
2. If migration already applied: mark it applied with `supabase migration repair --status applied <version>`
3. If schema diverged: create a reconciliation migration in `supabase/migrations/`
4. Re-run `supabase db push --include-all`

> [!CAUTION]
> Never force-push to main or skip migrations. If in doubt, stop and flag to Nick before proceeding.

## Environment Check

After the push succeeds, verify:
```bash
supabase projects list  # confirm linked to correct project
grep SUPABASE_URL .env  # should point to prod URL
```