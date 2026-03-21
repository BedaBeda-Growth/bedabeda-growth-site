---
name: "Finance Safety Mode"
description: "Manages the finance AP pipeline mode (shadow/live) to prevent accidental email sends during testing or development. Use when: (1) Starting any finance/AP/invoice pipeline work, (2) Testing invoice processing, (3) Any work that could trigger emails to vendors, (4) Reminds user to flip back to live when done"
---

# Finance Safety Mode

## Purpose

Prevents accidental email sends from the AP (Accounts Payable) pipeline during testing/development by managing `AP_PIPELINE_MODE` in `~/.finance/config.env`.

## When to Use

- When starting any finance-related work involving invoices, AP, or vendor payments
- When testing the invoice ingestion pipeline
- When running any pipeline that could send emails to vendors
- Always use BEFORE doing AP/finance work, and REMIND user to flip back when done

## Workflow

### 1. Set to Shadow Mode (Before Work)

```bash
# Check current mode
grep "AP_PIPELINE_MODE" ~/.finance/config.env

# If not set or is 'live', set to 'shadow'
echo "AP_PIPELINE_MODE=shadow" >> ~/.finance/config.env
```

Or update existing:
```bash
sed -i '' 's/AP_PIPELINE_MODE=.*/AP_PIPELINE_MODE=shadow/' ~/.finance/config.env
```

### 2. Do Your Finance Work

Run pipelines, test invoice processing, etc. No emails will be sent.

### 3. Set Back to Live (After Work - CRITICAL)

**ALWAYS remind the user to flip back to live when done:**
```bash
sed -i '' 's/AP_PIPELINE_MODE=.*/AP_PIPELINE_MODE=live/' ~/.finance/config.env
```

Or manually change in `~/.finance/config.env`:
```
AP_PIPELINE_MODE=live
```

### Mode Reference

| Mode | Behavior |
|------|----------|
| `shadow` | Invoice scanning works, scoring works, NO emails sent, NO payment status changes |
| `live` | Full pipeline: score, send emails, update payment status |
| `dryrun` | Log only, no DB writes |

## Reminder Script

After completing finance work, ALWAYS say:

> **🔔 REMINDER:** Flip `AP_PIPELINE_MODE` back to `live` when ready to go live. Change in `~/.finance/config.env`:
> ```
> AP_PIPELINE_MODE=live
> ```

## Files Modified

- `~/.finance/config.env` — Contains `AP_PIPELINE_MODE` setting
