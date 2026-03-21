---
name: "Schedule via Typefully"
description: "Schedule X threads and LinkedIn posts to Typefully using Nick's existing content pipeline. Routes to correct social set automatically."
alwaysAllow: ["Bash"]
ruleDomains:
  - ops
---

# Schedule via Typefully

Schedule X threads and LinkedIn posts using the existing Typefully v2 API integration in the content pipeline.

## Key Facts

- **API client:** `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/article_monitor.py` — `schedule_to_typefully()`
- **LinkedIn client:** `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/linkedin_composer.py` — `schedule_to_typefully()`
- **Auth:** `TYPEFULLY_API_KEY` loaded from 1Password via `op_env.load_op_env()` — never hardcode
- **Config:** `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/config.py`
- **Base URL:** `https://api.typefully.com/v2`

## Social Set Routing — NEVER MIX

| Profile | Social Set ID | Use For |
|---------|--------------|---------|
| `nick` | `250704` | Nick's personal X account (nip74) — DEFAULT |
| `rocket` | `283152` | Rocket/Freely brand (X + LinkedIn) |

**Hard rule:** Nick's personal content → `250704`. Brand content → `283152`. Confirm before posting.

## Workflow

### Step 1 — Load auth
```python
import sys
sys.path.insert(0, '/Users/nicholaspetros/scceo-1/grok-personal')
from op_env import load_op_env
from pathlib import Path
load_op_env(Path('/Users/nicholaspetros/scceo-1/grok-personal/.env'))
from content_pipeline.config import TYPEFULLY_API_KEY, TYPEFULLY_API_URL
```

### Step 2 — Parse the thread
Read the thread file (usually `~/Desktop/Rocket/Articles/{date}/...X Thread.md`).
Split on `---` or `**N/**` markers to get individual tweets.
Strip markdown formatting — plain text only for X.
Validate each tweet is under 280 characters.

### Step 3 — Confirm with Nick before posting
Always show:
- Which social set (nick=250704 or rocket=283152)
- The full tweet list numbered
- Proposed schedule time (or "post now")

### Step 4 — Call the API
```python
import requests
from datetime import datetime, timezone

tweets = ["Tweet 1 text", "Tweet 2 text", ...]  # parsed from file
social_set_id = "250704"  # nick's account

payload = {
    "platforms": {
        "x": {
            "enabled": True,
            "posts": [{"text": t} for t in tweets],
        }
    },
    "share": False,
}

# If scheduling for a specific time:
# payload["publish_at"] = "2026-03-11T17:00:00Z"
# payload["share"] = True

response = requests.post(
    f"{TYPEFULLY_API_URL}/social-sets/{social_set_id}/drafts",
    headers={
        "Authorization": f"Bearer {TYPEFULLY_API_KEY}",
        "Content-Type": "application/json",
    },
    json=payload,
    timeout=30,
)

if response.status_code in [200, 201]:
    data = response.json()
    print(f"✅ Scheduled. Draft ID: {data.get('id')} | URL: {data.get('share_url')}")
else:
    print(f"❌ Error {response.status_code}: {response.text}")
```

### Step 5 — Confirm delivery
After a successful API call, print the draft URL so Nick can verify in Typefully before it goes live.

## Schedule Time Guidelines

- **Peak X engagement (EST):** 8–9am, 12–1pm, 6–8pm
- **Default if no time given:** Next available peak slot
- **All times in UTC** for the API payload (convert from EST: EST = UTC-5)

## Thread Parsing — Tweet Markers

The thread files use this format:
```
**1/**
Tweet text here

---

**2/**
Next tweet text
```

Parse by splitting on `---` then stripping `**N/**` prefix from each block.

## Dos and Don'ts

- **DO** always confirm social set routing before posting
- **DO** validate tweet character counts before sending
- **DO** print the Typefully draft URL after scheduling so Nick can review
- **DO** use `dry_run=True` pattern (print payload, don't post) if Nick asks to preview
- **DON'T** post to `283152` (brand) unless explicitly asked
- **DON'T** hardcode the API key — always load from op_env
- **DON'T** schedule LinkedIn without explicit confirmation (separate social set)
- **DON'T** strip intentional line breaks inside a single tweet

## LinkedIn Scheduling (separate flow)

For LinkedIn, use `linkedin_composer.py`'s `schedule_to_typefully()` instead.
LinkedIn uses the same social set IDs but the platform key is `"linkedin"` not `"x"`.
Media uploads require a 3-step S3 process — see `/Users/nicholaspetros/scceo-1/grok-personal/docs/typefully-integration.md`.
