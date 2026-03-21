---
name: "Open Dev Session"
description: "Open a 1Password dev session so all op:// secrets resolve without prompting Nick"
alwaysAllow: ["Bash"]
ruleDomains:
  - ops
---

# Open Dev Session

Opens a 1Password dev session that caches all secrets for 8 hours. This eliminates repeated biometric prompts and ensures all `op://` references in `.env` resolve silently for the entire working session.

## When to Use

Run this **at the start of every session** before any pipeline, dispatch, or tool that needs API keys. If you see `op://` references failing to resolve, or `RESEND_API_KEY` / `XAI_API_KEY` / etc. showing as literal `op://...` strings, run this first.

## How It Works

1. Check if a dev session is already active (`~/.op-session/meta` with valid expiry)
2. If active, load the cached secrets into the current process environment
3. If expired or missing, run `op_dev_session.sh open` which triggers ONE biometric prompt via the 1Password desktop app, then caches all resolved secrets for 8 hours

## Execution Steps

### Step 1: Check existing session

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from op_env import _load_session_cache
loaded = _load_session_cache()
if loaded > 0:
    print(f'SESSION_ACTIVE: {loaded} keys loaded from cache')
else:
    print('SESSION_EXPIRED_OR_MISSING')
"
```

### Step 2: If session is expired or missing, open a new one

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && bash op_dev_session.sh open
```

This will trigger ONE biometric prompt on Nick's machine. Wait for it to complete (up to 60 seconds).

### Step 3: Verify the session is active

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && bash op_dev_session.sh status
```

### Step 4: Load secrets into current Python process

After the session is open, load the cached secrets so all subsequent Python code can use them:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from op_env import load_op_env
load_op_env()
import os
# Verify critical keys resolved (not still op:// references)
checks = ['RESEND_API_KEY', 'XAI_API_KEY', 'SUPABASE_SERVICE_KEY', 'STRIPE_SECRET_KEY']
for key in checks:
    val = os.environ.get(key, '')
    status = 'OK' if val and not val.startswith('op://') else 'MISSING/UNRESOLVED'
    print(f'  {key}: {status}')
"
```

### Step 5: Log skill invocation

After a successful session open, log to skill usage tracking:

```sql
-- psql $RULES_DATABASE_URL
INSERT INTO rule_ledger.skill_usage (skill_slug, session_id, trigger_source, result)
VALUES ('open-dev-session', '{session_id}', 'kai-agent', 'completed');
```

## Important Rules

- **ONE biometric prompt per 8 hours.** Never call `op read` individually after session is open.
- **Never hardcode secrets.** All keys live in 1Password. Period.
- **If the session open times out (60s)**, tell Nick: "1Password needs your biometric to unlock secrets. Please approve the prompt on your machine."
- **The session cache lives at** `~/.op-session/resolved.env` (chmod 600). It's securely wiped on `close`.
- **To close early:** `bash op_dev_session.sh close`

## Troubleshooting

- **"Failed to resolve RESEND_API_KEY"** = The 1Password item field name doesn't match the op:// reference. Check with `op item get "Resend" --vault Development --format json` to see actual field names.
- **Session opens but keys still show op://** = The resolved.env file may have unresolved references. Check: `grep 'op://' ~/.op-session/resolved.env`
- **Biometric prompt doesn't appear** = 1Password desktop app may not be running. Tell Nick to open the 1Password app.


---

## Variants / Absorbed Modes

> `op-dev-session` was an alias for this skill with identical behavior. It has been absorbed — always call `open-dev-session`.