---
title: op-dev-session
description: Open a 1Password Dev Session to grant access to live secrets for local development
ruleDomains:
  - ops
---

# 1Password Dev Session Skill

When tasks require access to real environment variables/secrets (e.g., live Xendit cutover, Stripe testing, etc.) and you are blocked by missing credentials:

You should ask the USER to run the `opdev` command in their terminal to start a secure 1Password session.

## Steps for the User

Tell the user to do the following:

1. Open their local terminal inside the repo.
2. Run `opdev`.
3. Approve the single biometric prompt (TouchID/FaceID) to unlock 1Password.
4. Once unlocked, the script will cache all resolved secrets in `~/.op-session/resolved.env` for 8 hours.
5. The user should report back once the session is "ACTIVE".

## Accessing Secrets (For the Agent)

Once the user confirms the session is active, you can access the secrets securely by sourcing the cached file in your terminal commands before running whatever script needs them.

**Example usage in a bash command:**
```bash
source ~/.op-session/resolved.env && npm run your-script
```

Or reading a specific key:
```bash
source ~/.op-session/resolved.env && echo $MY_SECRET_KEY
```

## Security Rules
- NEVER echo full secrets to the terminal/conversation. 
- ALWAYS use `source ~/.op-session/resolved.env` directly in the command chain that needs the credentials.
- Do NOT try to run `opdev` yourself, as it requires biometric approval from the user. It MUST be run by the user.

## Cleaning Up
When the task is done, you can remind the user they can run `opclose` to wipe the cache immediately, rather than waiting for the 8-hour expiry.
