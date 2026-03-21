---
name: run-qa-loop
description: >
  Unified QA execution skill for rv. Runs the frozen golden-master workflow
  with a single exit code: compare against qa/golden-master.json, fix drift,
  and only refreeze with an explicit approval signature.
  Use when asked to run QA, fix QA, close QA gaps, or verify before handoff.
ruleDomains:
  - ops
  - deploy
---

# Golden Master QA Loop

## Primary Command

```bash
GOLDEN_MASTER_SIGNATURE="<approval phrase>" npm run qa:frozen
```

This is the hard compare against `qa/golden-master.json`. If it passes, the
site matches the frozen master. If it fails, fix the drift first.

## Refreeze Command

After the site is corrected and the change is intentional, refreeze with the
same approval phrase that signed the lock:

```bash
GOLDEN_MASTER_SIGNATURE="<approval phrase>" npm run qa:freeze
```

Only run this after the updated state is approved.

## QA Flow

1. Run `npm run qa:frozen`
2. Fix the drift in HTML/CSS/content if it fails
3. Run `npm run qa:frozen` again
4. When the result is correct and approved, run `GOLDEN_MASTER_SIGNATURE="<approval phrase>" npm run qa:freeze`
5. Re-run `npm run qa:frozen` to confirm the refrozen snapshot matches

Any frozen-test failure is a code/content drift signal, not a reason to edit the
master by hand.

## Fix Loop

When asked to run/fix QA:

1. Run `npm run qa:frozen`
2. Read failures and identify the page / heading / bodyText drift
3. Fix the **code** (HTML/CSS/content) — never edit `qa/golden-master.json` by hand
4. Run `npm run qa:frozen` again
5. When the corrected state is approved, refreeze with the approval signature
6. Run `npm run qa:frozen` one more time to confirm the new master matches

Completion = frozen compare passes against the approved master. "Advisory logs
only" is not done.

## Step 0: Verification Pass (for handoff)

Before calling `notify_user` or `signal_completion`, you MUST:

1. Run `npm run qa:frozen` — must pass
2. If the master was intentionally updated, show the refreeze command used with the approval signature
3. List every acceptance criterion with behavioral proof (computed style, DOM assertion, test result)
4. **"File was edited" is NOT proof** — show the test passing

## Useful Variants

| Command | What it does |
|---|---|
| `npm run qa:frozen` | Compare live site to frozen golden master |
| `npm run qa:freeze` | Rebuild `qa/golden-master.json` after approval |
| `npm run qa:golden-status` | Show local lock state |
| `npm run qa:golden-sign` | Create a local approval lock on this machine |
