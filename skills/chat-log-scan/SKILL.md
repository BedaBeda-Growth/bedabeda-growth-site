---
name: "Chat Log Scan"
description: "Scans recent Kai Agent session logs to identify recurring manual patterns and recommend automation targets."
alwaysAllow:
  - Bash
ruleDomains:
  - ops
---

# Chat Log Scan

Use this skill when Nick asks "what should we automate next", "where is our time going", or "audit our sessions for bottlenecks".

## Workflow

1. **Run the scan script**
   ```bash
   python3 grok-personal/scripts/chat_log_scan.py --days 14
   ```

2. **Review the report**
   - The script outputs a markdown report (default: `chat_log_analysis.md`).
   - Read the report and present the **Top 3 Automation Targets** to Nick.

3. **Offer Action Items**
   - For each target, propose a specific work ledger item.
   - If Nick approves, create the `AUTO-{YYYYMMDD}-{SLUG}` items in the work ledger.

## Parameters

- --days: Number of days to look back (default: 7).
- --path: Path to sessions directory (default: `~/scceo-1/sessions/`).
- --output: Report filename.

## Logic
- The script uses `router.py` to route log snippets to Grok for thematic analysis.
- It extracts high-frequency user requests and repeated tool sequences.
- It calculates potential ROI based on pattern frequency.
