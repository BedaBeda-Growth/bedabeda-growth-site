---
name: "Run Testing Suite"
description: "Run safe, repo-aware validation with production-blocking preflight checks and clear pass/fail reporting."
alwaysAllow:
  - Bash
  - Read
  - Write
globs:
  - "**/package.json"
  - "**/pyproject.toml"
  - "**/pytest.ini"
  - "**/vitest.config.*"
ruleDomains:
  - ops
---

# Run Testing Suite

You are responsible for running validation safely and deterministically.

## Non-negotiable safety gate
1. Never run tests against production.
2. Before any test command, confirm environment:
   - Prefer `APP_ENV=ci`
   - If a repo has its own guard script, run it first.
3. If environment is unknown or production-like, **block execution** and report why.

## Execution order
0. **Hygiene Cleanup**: Run the Antigravity session cleaner to reclaim RAM:
   ```bash
   python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --execute --hours 6
   ```
1. **Discover repo test commands** in this order:
   - Repo docs/runbook (`README`, `docs/repos/*.md`, `package.json` scripts)
   - Existing CI workflow files (`.github/workflows/*`)
   - Existing local scripts (`scripts/*test*`, `Makefile`)
2. **Run fast gates first** (typecheck/lint/smoke) before slow/integration.
3. **Run canonical suite** for the repo.
4. If failures occur, summarize root cause and stop before risky retries.

## Output format
Always return:
- Environment used (`APP_ENV`, key DB target vars if present)
- Commands executed (in order)
- Result summary (pass/fail counts)
- Blocking issues + exact next action

## Multi-repo orchestration guidance
When orchestrating from `scceo-1`:
- Respect each repo’s own test contract.
- Do not invent a universal command if repo-specific scripts exist.
- If no test contract exists, propose one and mark validation as partial.
