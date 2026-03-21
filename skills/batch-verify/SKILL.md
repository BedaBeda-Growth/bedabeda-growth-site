---
name: batch-verify
description: Verify all "built" items for a repository in one pass.
ruleDomains:
  - ops
  - deploy
---

# Batch Verify

Use this skill when Nick says something like:
- "batch verify rocket"
- "verify all built items in app"
- "clear the built queue"

## Intent
Automatically verify all pending/built items in the work ledger without requiring Nick to manually review every single one, by invoking the `verify-agent` skill for each.

## Inputs
- `repo`: The repository to target (e.g., `rocket`, `scceo`, `app`)
- `mode`: The validation mode (`quick` or `full`). Defaults to `quick`.

## Workflow
1. Read the central work ledger at `/Users/nicholaspetros/scceo-1/grok-personal/data/work_ledger.json`
2. Find all items with `status: "built"` (or `verification_submitted`) for the given `repo`
3. For each matching item:
   - Present to Nick that you are verifying `<item_id>`
   - Invoke the `verify-agent` skill passing `item_id`, `repo`, `mode`, and `auto_retry=true`
   - Capture the result
4. Summarize all outcomes in a matrix for Nick:
   - 🟢 `item_id`: VERIFIED
   - 🔴 `item_id`: FAILED (reason)
