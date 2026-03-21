---
name: Manual AP Scan
description: Manually trigger the AP (Accounts Payable) pipeline to scan email for new invoices and score them against contracts
icon: 📄
domain: ops
tags:
  - finance
  - ap
  - invoices
  - scanning
  - manual
---

# Manual AP Scan

Trigger a manual scan of the AP email inbox for new invoice emails.

## When to Use

- Nick asks to "run invoice scan" or "check for new invoices"
- After uploading new vendor contracts and wanting to score existing payables
- Testing the AP pipeline before going live

## How It Works

1. Scans ap@pinchforth.com inbox for invoice-related emails from the last N days
2. Downloads attachments (PDFs, images)
3. Parses invoices via OCR (Groq cloud fallback if LM Studio unavailable)
4. Scores parsed invoices against active vendor contracts
5. Creates/updates payable records with scores

## Usage

```
@manual-ap-scan [--mode shadow|live|dryrun]

Examples:
- "run ap scan" → runs in shadow mode
- "manual-ap-scan --mode live" → runs in live mode (sends emails)
- "scan invoices" → runs in shadow mode
```

## Output

Returns:
- Number of emails scanned
- Number of new invoices parsed
- Number of payables scored
- List of new payables created

## Safety

- Runs in shadow mode by default (AP_PIPELINE_MODE=shadow)
- No invoices are sent for payment in shadow mode
- Use the finance-safety-mode skill to switch to live mode

## Dependencies

- Finance Chat must be running (for database access)
- Groq API key must be configured (for OCR fallback)
- Vendor contracts must be indexed in database
