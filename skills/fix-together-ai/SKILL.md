---
name: "Fix Together AI Source"
description: "Runbook for Together AI in Craft Agent — source setup, LLM provider limitations, and cleanup"
ruleDomains:
  - ops
---

# Together AI in Craft Agent

## TL;DR

- **Together AI as a SOURCE (API tool calls):** WORKS. Use `provider: "together-inference"` + `authType: "bearer"`.
- **Together AI as an LLM PROVIDER (powering sessions):** NOT SUPPORTED YET. Craft Agent only supports Anthropic Messages API format for custom endpoints. Together uses OpenAI format. No translation layer exists.

## Why Together Can't Be an LLM Provider (Yet)

Confirmed by reading Craft Agent source code (`main.cjs`, `connection-setup-logic.ts`, `ipc.ts`):

1. Custom endpoint connections use `providerType: "anthropic_compat"`
2. All `anthropic_compat` connections set `ANTHROPIC_BASE_URL` and send **Anthropic Messages API** format (`/v1/messages`)
3. Together AI only accepts **OpenAI Chat Completions** format (`/v1/chat/completions`)
4. `openai_compat` exists in the type system and icon maps but has **zero implementation** in setup or session spawning
5. The `isCompatProvider()` function only recognizes `anthropic_compat` and `pi_compat`

```javascript
// From main.cjs — the actual runtime check
function isCompatProvider(providerType) {
  return providerType === "anthropic_compat" || providerType === "pi_compat";
}
```

**Workaround via CLI:** `craft-cli run --provider together --model Qwen/Qwen3.5-9B "prompt"` — the CLI has its own multi-provider system that's separate from the desktop UI.

## Source Setup (What Works)

### Problem: Source auth gets hijacked

`"provider": "together"` is a recognized LLM provider name. When you try to authenticate the source, Craft Agent shows the LLM connection form instead of the simple API key prompt. This creates a ghost `llmConnections` entry and crashes Claude Code.

### Fix: Use a non-LLM provider name

Change `provider` from `"together"` to `"together-inference"`.

### Correct source config.json

```json
{
  "id": "together-ai_e11c3336",
  "name": "Together AI",
  "slug": "together-ai",
  "enabled": true,
  "provider": "together-inference",
  "type": "api",
  "icon": "https://together.ai/favicon.ico",
  "tagline": "OpenAI-compatible inference (chat, embeddings, images, audio) via Together AI",
  "api": {
    "baseUrl": "https://api.together.xyz/v1/",
    "authType": "bearer",
    "testEndpoint": {
      "method": "GET",
      "path": "models"
    }
  }
}
```

### Auth flow

```
source_credential_prompt({
  sourceSlug: "together-ai",
  mode: "bearer",
  description: "Enter your Together AI API key",
  hint: "Get your key at https://api.together.xyz/settings/api-keys"
})
```

### Validate

```
source_test({ sourceSlug: "together-ai" })
```

## Cleanup

### Remove ghost LLM connection (CRITICAL)

Failed auth attempts create stale entries in `~/.craft-agent/config.json` → `llmConnections` array:

```json
{
  "slug": "together",
  "providerType": "anthropic_compat",
  "authType": "api_key",
  "endpoint": "https://api.together.xyz/v1"
}
```

This shows as "not authenticated" under Anthropic in the sidebar. Remove it from the `llmConnections` array. Validate JSON after:

```bash
python3 -c "import json; json.load(open('$HOME/.craft-agent/config.json')); print('Valid JSON')"
```

### Remove duplicate sources

If workaround sources exist (e.g. `together-api`):
```bash
rm -rf sources/together-api/
```

## Key Lessons

1. **`provider` in source config must NOT match an LLM provider name** — use `"together-inference"`, `"openai-api"`, etc.
2. **`anthropic_compat` = Anthropic Messages API only** — not OpenAI format. Together, Groq, and other OpenAI-compatible services can't be LLM providers until `openai_compat` is implemented.
3. **Ghost LLM connections persist** — always check `~/.craft-agent/config.json` `llmConnections` after failed auth attempts.
4. **Source vs Provider are different things** — a source gives tools for API calls within sessions. A provider powers the session itself. Together works as a source today.
