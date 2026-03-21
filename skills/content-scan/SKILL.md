---
name: "Content Scan"
description: "Audits URLs or local files against deterministic marketing, legal, and pricing profiles to ensure consistency and compliance."
alwaysAllow:
  - Bash
ruleDomains:
  - ops
  - docs
---

# Content Scan

Use this skill when Nick asks to "audit the site", "check pricing pages", "verify marketing copy", or "scan for legal compliance".

## Workflow

1. **Select a profile**
   - Available: marketing, legal, pricing, email, cta.
   - Profiles are stored in grok-personal/scan_profiles/.

2. **Run the scan**
   Audit a URL:
   ```bash
   python3 grok-personal/scripts/content_scan.py --url https://rocket.so --profile marketing
   ```
   Audit a local file:
   ```bash
   python3 grok-personal/scripts/content_scan.py --file path/to/page.html --profile legal
   ```

3. **Handle Violations**
   - If the status is FAIL, review the violations list.
   - Propose fixes or use the bulk-update skill if the issue is widespread.

## Parameters

- --url: Public URL to fetch and scan.
- --file: Local path to scan.
- --profile: Profile name (required).
- --output: Output JSON file for structured results.

## Profiles
- marketing: Checks for brand promises, CTA presence, and placeholder text.
- legal: (Pending) Checks for disclaimer presence and required footers.
- pricing: (Pending) Scans for specific price points and currency symbols.
