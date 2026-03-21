---
name: "Closeout Plan"
description: "Meta-orchestration skill that reviews the full pipeline state and skills catalog, then generates a precise, sequential closeout plan to ship priority items. Maximizes Jules for heavy lifting (tests, Playwright, fixes, iteration) while reserving local machine only for final pull, merge, and deploy. Updates the work ledger at every step. Use when Nick says 'closeout plan', 'close it out', 'EOD plan', 'what do we need to ship', 'wrap up the pipe', or wants to efficiently clear the highest-leverage items to production."
ruleDomains:
  - ops
  - deploy
---

# Closeout Plan — Meta Orchestration for Forward Progress

> **Purpose:** Scan the full pipeline, identify items closest to completion, and generate a lean execution plan that moves them to production using the existing skill catalog. Jules does the heavy lifting; local machine handles only the final stamp and deploy.
>
> **Key Principle:** Every handoff to Jules must include full context, numbered steps, and explicit success criteria. No vague prompts. No overloading. Small loops of plan → execute → verify → advance.

---

## Phase 1: Pipeline Snapshot

Pull fresh state from every data source. Call ALL of the following in a single parallel batch.

## Phase 2: Prioritize for Closeout

Classify every active item into tiers ordered by proximity to done: Tier 1 (verified, ready to ship), Tier 2 (built, needs verification), Tier 3 (dispatched, in-flight), Tier 4 (planned, not started), Tier 5 (pending, skip for closeout).

## Phase 3: Generate the Closeout Plan

Output: pipeline snapshot summary, prioritized numbered steps with skill references, copy-paste Jules prompts, ledger update SQL, and local-only steps reserved for Nick.

## Phase 4: Execute Iteratively

Confirm with Nick, execute one step at a time, update ledger after each, re-assess and loop.