---
name: "Jules Plan Loop"
description: "Cloud-first planning loop: bulk-dispatch planning tasks to Jules, pull draft plans, apply rule system + Antigravity hardening locally, redispatch approved plans for execution."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
  - deploy
---

# Jules Plan Loop

This skill orchestrates the "Triple Threat" cloud-first planning loop. 
It integrates Jules (cloud drafting), Antigravity (local review/polish), and Jules (cloud execution) while keeping your local machine explicitly out of heavy compute tasks.

## Trigger Phrases
- "jules loop"
- "run jules loop"
- "plan and dispatch to jules"
- "cloud planning loop"

## The 4-Phase Protocol

When Nick triggers this skill, you must execute the following protocol sequentially. Do not skip steps unless explicitly instructed.


## Rule Gate (run before acting)

Before dispatching, deploying, or mutating state, call:

```
check_rule_hits(domain="deploy", last_n=5)
```

If any `high` or `critical` severity hits are active:
- Surface them to Nick before proceeding
- Do not suppress or skip — a recent hit means the system detected drift
- If the hit is expected and understood, note it and continue

This gate costs one MCP call. It prevents re-triggering known violations.

### Phase 1: Bulk Dispatch Planning (Jules)
1. Help Nick select top items from the work ledger (or default to top 25 if requested).
2. For each selected item, formulate a **PLANNING TASK** (not execution). Use the `send-to-jules` skill to dispatch `jules remote new` sessions with these instructions:
   > Create a draft Objective Document. Read relevant files. Draft the document in `plans/<item-id>.md`. Ensure the Acceptance Criteria explicitly define 'Proof Mechanisms' (Gold-Tier Verification like raw logs, query results, or screenshots). Open a PR titled 'Jules Draft: <item-title>' with the label `jules-plan`. Do NOT execute code.

### Phase 2: Plan Pull (Local Staging)
1. Run `python3 scceo-1/grok-personal/pull_jules_plans.py`.
2. This PyGitHub script scans all valid repos for PRs labeled `jules-plan` and downloads their Markdown bodies and any in-branch `plans/*.md` files into the `scceo-1/jules-plans/{date}/{repo}/` staging directory.
3. Report the number of plans pulled.

### Phase 3: Rule-Gated Polish (Antigravity Approval)
1. Run `python3 scceo-1/grok-personal/plan_rule_checker.py`.
2. This runs the draft plans against the company rule system (`rules_ledger/evaluator.py`) and basic structural checks (has verification commands, rollback, etc.).
3. **Your Job (Antigravity Polish):** For any plan marked `needs_review` by the script:
   - Identify the missing pieces (e.g., test commands, missing rollback, missing Gold-Tier Proof Mechanisms).
   - Locally patch the plan's Markdown file.
   - Run the script again to verify it passes.
   - When finished, present a concise dashboard to Nick:
     - ✅ Auto-Approved
     - ⚠️ Antigravity Patched (Needs quick review)
     - ❌ Flagged manually (You couldn't patch it)
4. Ask Nick for final approval (e.g., "approve all"). To approve, manually update the `status: "polished"` in `jules-plans/{date}/index.json`.

### Phase 4: Redispatch Execution (Jules)
1. Once polished, run `python3 scceo-1/grok-personal/dispatch_jules_plans.py`.
2. This script takes the `polished` plans, commits them back to the `conveyor/<item-id>` remote branches via PyGitHub, and dispatches new Jules sessions with **EXECUTION TASKS**.
3. Report the resulting Session IDs and budget snapshot.

## Non-Negotiable Rules
1. **Never dispatch for execution without passing rule check and explicit approval.**
2. **Never overwrite polished plans with fresh Jules drafts** (use `--force` if you must).
3. **Never touch the `main` branch.** All work must remain on `conveyor/` or `jules-plan/` branches.
4. **Max 5 concurrent Jules execution sessions.** The dispatch script enforces this.
5. **Always update the Work Ledger** after Phases 1 and 4 to reflect the status (`planning`, `dispatched___method=jules`).

## Helper Commands

**Check Jules Status:**
```bash
jules remote list --session
```

**Evening Review:**
```bash
cd ~/scceo-1/grok-personal && python3 conveyor_feed.py --since 12
```
