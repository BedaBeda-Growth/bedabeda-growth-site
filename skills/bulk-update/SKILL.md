---
name: "Bulk Update"
description: "Perform search-and-replace updates across multiple files with support for non-blocking STDIN and dry-run previews."
alwaysAllow:
  - Bash
ruleDomains:
  - ops
---

# Bulk Update

Use this skill when a widespread change is needed (e.g., updating a URL across all profiles, replacing a retired API key, or standardising headers).

## Workflow

1. **Test the update (Dry Run)**
   ```bash
   python3 grok-personal/scripts/bulk_update.py --files file1.md file2.md --search "old-text" --replace "new-text" --dry-run
   ```

2. **Apply the update**
   ```bash
   python3 grok-personal/scripts/bulk_update.py --files file1.md file2.md --search "old-text" --replace "new-text"
   ```

3. **Using STDIN**
   You can pipe a list of files from another tool (like find or grep -l):
   ```bash
   find . -name "*.json" | python3 grok-personal/scripts/bulk_update.py --stdin --search "v1" --replace "v2"
   ```

## Parameters

- --files: List of target files.
- --search: Text to find.
- --replace: Replacement text.
- --stdin: Read file list from STDIN.
- --dry-run: Preview matches without writing changes.

## Logic
- Uses non-blocking STDIN to prevent script hangs when called by sub-agents.
- Performs a direct string replacement on file contents.
- Outputs a concise status report for each file.
