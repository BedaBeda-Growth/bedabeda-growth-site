---
name: "Test Coverage Scan"
description: "Enforces the 1-for-1 test rule by ensuring every changed source file has a corresponding test file change in the PR."
alwaysAllow:
  - Bash
ruleDomains:
  - ops
  - testing
---

# Test Coverage Scan

Use this skill when running CI gates, reviewing PRs, or when Nick asks "did we test this", "check coverage for this PR", or "enforce the testing rule".

## Workflow

1. **Run the scan**
   ```bash
   python3 grok-personal/scripts/test_coverage_scan.py
   ```

2. **Strict Mode (Blocking)**
   To use as a CI gate that fails if coverage is missing:
   ```bash
   python3 grok-personal/scripts/test_coverage_scan.py --strict
   ```

3. **Interpret Results**
   - **PASS**: Every changed source file has a correlated test file change.
   - **WARN**: Some source files lack tests, but strict mode is OFF.
   - **FAIL**: Source files lack tests and strict mode is ON.

## Logic

- Scans the diff between main and HEAD.
- Identifies primary source files (.js, .ts, .tsx, .py, .go).
- Correlates them to test files using filename similarity (e.g., user-profile.ts matches user-profile.test.ts).
- Focuses on PR-level changes rather than global codebase coverage for speed and relevance.
