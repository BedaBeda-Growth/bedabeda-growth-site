---
name: "Grok Plan Loop"
description: "Generate a repo master plan, run Grok reviewer-only gate loops, reconcile failures, and return an execution-ready packet at 100% APPROVED."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
ruleDomains:
  - ops
---

# Grok Plan Loop (Acceptance Standard v2)

Use this skill when user asks for: 
- full-plan generation for a repo (e.g., Rocket, Spark Kanban)
- Grok review loops until approval
- execution packet output for Gemini/agent handoff

## Non-negotiables

1. **Grok is reviewer-only** (never plan author).
2. Evaluate against **Acceptance Standard v2 (Gates 1–9)** including efficiency gate.
3. If any gate fails, **patch cited sections and rerun**.
4. Continue until:
   - `decision = ACCEPTED`
   - `approval_phrase = 100% APPROVED`
5. Return a clean execution packet in chat.

## Objective Alignment (Mandatory)
Before the first review cycle:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Map every included item ID to one or more objective IDs
- If any item is unmapped, stop and ask: **"What's the objective here?"**
- Record net-new durable objective candidates in `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md`
- Ensure task cards and phase exits include objective-linked verification evidence

## Inputs to collect first

- target repo (`rocket`, `spark-kanban`, etc.)
- scope (`all active priorities` or filtered bucket/status)
- max cycles (default `8`)
- whether to emit packet-only output

If user doesn’t specify, default to:
- scope: all active priorities
- max cycles: 8
- emit packet in chat: true

## Execution workflow

1. Gather active priorities from work ledger/context.
2. Build/refresh master plan with:
   - sectioned wave schedule with explicit IDs
   - wave efficiency packing
   - concurrency-safe domain map
   - dependency graph integrity
   - numeric phase exits
   - rollback protocol
3. Build/refresh `plans/task-cards/*.md` files for each linked item.
4. Run Grok review loop (reviewer-only, JSON verdict).
5. For each FAIL gate, patch only cited areas; append reconciliation cycle with citations.
   - If Gate 9 fails, simplify wave structure and reduce coordination overhead before rerun.
6. Rerun until full acceptance.
7. Persist artifacts (`.md` + `.review.json`).
8. Output executor packet.

## Acceptance Standard v2 (required)

Validate all 9 gates:

1. Appendix Schema Completeness
2. Dependency Graph Integrity
3. Wave Schedule Has Explicit Item IDs
4. Wave Efficiency
5. Concurrency Safety Per Wave
6. Dispatched/Built Items Have Linked Task Cards
7. Reconciliation Cycles Must Show Progress
8. Phase Completion Criteria Are Numeric
9. Efficiency Net-Positive (waves reduce cycle/coordination load or increase throughput; reject complexity tax without capacity gain)

## Required output packet format

Always return these sections:

1. **Approval Summary**
   - decision, phrase, fail_count, cycles
2. **Artifacts**
   - plan path
   - review JSON path
   - task-cards directory path
3. **Wave Execution Table**
   - wave -> item IDs
4. **Validation & Rollback**
   - runnable commands
5. **Gemini Handoff Prompt**
   - concise prompt with plan + wave execution order
   - MUST begin with branch bootstrap from latest `main` using a date-stamped branch name

### Branch bootstrap requirement (mandatory)

Every Gemini handoff prompt must start with:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b build-YYYY-MM-DD
```

Rules:
- branch must be created from latest `main`
- branch name must include date (YYYY-MM-DD)
- if repo uses a required branch prefix, keep date suffix (example: `rocket-build-YYYY-MM-DD`)

## Status sync protocol (default)

Always run both checks as part of this skill:

1. **Pre-check before generating plan**
   - scan existing plan files for referenced item IDs
   - mark those ledger items `planned` if still pending/failed
   - sync linked SOS tasks to Supabase so team sees planning progress

2. **Post-approval sync**
   - once Grok review is `100% APPROVED`, mark included item IDs as `planned`
   - sync linked SOS tasks (status mirror) for visibility

Rules:
- never mark `done` during planning stage
- never downgrade `dispatched`/`built`/`verified` back to planned
- ledger is source of truth; SOS is mirrored visibility

## Failure policy

If loop hits cycle cap without 100%:
- return top remaining FAIL gates with exact citations
- return smallest patch plan for next cycle
- do not claim readiness

## Quick invocation examples

- "Generate a plan for all Spark Kanban priorities and run Grok loop to 100%."
- "Run Grok Plan Loop for Rocket, max_cycles=10, emit packet only."
- "Use Grok Plan Loop and include work ledger + SOS status sync."
