---
name: CodeDoc Scan Check
description: How to check and run the CodeDoc Scanner system (dead code, doc gaps, and DB RPCs) to verify codebase hygiene metrics.
ruleDomains:
  - ops
---

# CodeDoc Scanner Overview

The CodeDoc Scanner runs every morning during `fresh_start.py` (Step 7.9) to analyze the `scceo`, `rocket`, `spark-kanban`, and `app` repositories for:
1. **Dead Code** (unused exports and unused Python elements)
2. **Documentation Gaps** (undocumented JSDoc symbols, Python docstrings, and Supabase Edge Functions)
3. **Database RPCs** (scanning `backup_schema.sql` files to identify all functions and whether they have inline SQL comments)

## Where the Code Lives

1. **TypeScript Scanner:** `packages/codedoc-scanner/` (runs via Node `tsx`)
2. **Python Scanner:** `grok-personal/codedoc_python_scanner.py` (runs `vulture` + AST coverage)
3. **Database Scanner:** `grok-personal/codedoc_db_rpc_scanner.py` (parses schema files safely)
4. **Merger & Briefing Script:** `grok-personal/codedoc_report_merger.py`
5. **Orchestrator integration:** `kai_morning.py` / `fresh_start.py`

## File System State

- **TS Scanner Daily Reports:** `packages/codedoc-scanner/reports/` (JSON, Markdown, HTML)
- **Repo Crawl Manifest:** `grok-personal/data/repo_crawl_manifest.json`
- **Schema Backups Checked:** `grok-personal/data/repo_docs/<repo_name>/backup_schema.sql`

---

## Task 0 (Required): Refresh Schema Backups Before DB RPC Scan

Run the repo crawl engine first so DB RPC coverage uses the latest schema from each app repo.

```bash
cd grok-personal
python3 repo_crawl_engine.py
```

*Expected:* `backup_schema.sql` files are regenerated for `rocket`, `spark-kanban`, and `app`, and a new `repo_crawl_manifest.json` is written.

Optional single-repo refresh:

```bash
cd grok-personal
python3 repo_crawl_engine.py --repo rocket
python3 repo_crawl_engine.py --repo spark-kanban
python3 repo_crawl_engine.py --repo app
```

Quick freshness verification:

```bash
ls -lh grok-personal/data/repo_docs/rocket/backup_schema.sql
ls -lh grok-personal/data/repo_docs/spark-kanban/backup_schema.sql
ls -lh grok-personal/data/repo_docs/app/backup_schema.sql
```

## Task 1: Check if the Final Briefing Snippet Ran Successfully

To see if the pipeline successfully ran the scanners this morning, check the local master briefing:

```bash
# Verify the scanner summary reached the team briefing
cat "$HOME/Documents/PinchForth System/Master System DB/Kai Morning Briefing.md" | grep -A 5 "CodeDoc Scanner"
```
*Expected: You should see "CodeDoc Scanner (Health & Debt)" with numbers for DB RPCs, dead code, etc.*

## Task 2: Run the TypeScript Component Manually (Dry-Run / Safe)

If you only want to see what is unused or undocumented in TS without saving anything to disk:

```bash
cd packages/codedoc-scanner
npm run scan:dry
```
*Expected: Prints 3 phases of output directly to the console (Dead code, Doc Coverage, Final Summary).*

## Task 3: Complete Run & Diff Engine Testing

If you want to run the full TypeScript suite with report generation to `~/.kai/codedoc/`:

```bash
cd packages/codedoc-scanner
npm run scan:full
```
*Expected: At the end of the output, it will mention saving "YYYY-MM-DD.json" and "YYYY-MM-DD.md" to the `.kai/codedoc/reports` folder. It will also compute the increment diff against yesterday.*

## Task 4: Test the Python Components Directly

To check if the Python or DB scanner is working or returning expected totals without running the whole TS pipeline:

**Check Python (Vulture + Docstrings):**
```bash
cd grok-personal
python3 codedoc_python_scanner.py
```
*Expected: Prints exact line-by-line dead code detections and docstring coverage %.*

**Check Database RPC parsing:**
```bash
cd grok-personal
python3 codedoc_db_rpc_scanner.py
```
*Expected: Output showing how many triggers and RPC functions were found in the schema backups.*

## Common Issues & Fixes

1. **Knip failing silently:** The `packages/codedoc-scanner/src/knip-runner.ts` will automatically fall back to regex scanning if the `knip` CLI errors heavily. Run `npx knip` directly in the root to debug Knip context parsing errors.
2. **Repos aren't scanning properly:** Check `packages/codedoc-scanner/src/config.ts` or ensure the `.env` correctly maps local checkout paths under `ROCKET_REPO`, `APP_REPO` etc.
3. **DB RPCs are stale:** The DB scanner parses from `grok-personal/data/repo_docs/`. Force a refresh before scanning:
   ```bash
   cd grok-personal
   python3 repo_crawl_engine.py
   ```
   Then re-run:
   ```bash
   cd packages/codedoc-scanner
   npm run scan:full
   ```
