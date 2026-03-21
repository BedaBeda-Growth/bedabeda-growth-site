---
name: "dev-loop"
description: "Autonomous, ledger-driven routing skill. Continuously applies a 'push right' force to the Kanban board by reading the work ledger, applying phase gates, and dispatching parallel cloud workers (Jules, Heartbeat, or CI Verify) to advance 20-30 items concurrently without blowing up local context."
ruleDomains:
  - ops
---

# Dev Loop

> **Purpose:** To act as the state-machine orchestrator for traversing the Kanban board. It reads the work ledger, applies phase gates, and routes work to parallel runners. It NEVER does the coding or planning itself. 
> 
> **When to Use:** When Nick says "run dev loop", "@dev-loop", or wants to advance a batch of items from planning to shipping without burning his context window.

## Architecture

The Dev Loop is a router. It reads the `public.work_ledger` table, categorizes items into 4 phases, and fires off parallel dispatches to handle the heavy lifting.

```text
┌────────────────────────────────────────────────────────┐
│ The Dev Loop Router (This Skill)                       │
│                                                        │
│ Phase 1: Needs Plan  ──>  dispatch: /jules-plan-loop   │
│ Phase 2: Needs Code  ──>  dispatch: /conveyor-item     │
│ Phase 3: Needs Test  ──>  dispatch: /ci-verify         │
│ Phase 4: Ready       ──>  Present "Ship It" Menu       │
└────────────────────────────────────────────────────────┘
```

## Step 1: Read the Ledger

Fetch the top 20-30 active priorities directly from the Supabase table `public.work_ledger` via the `mcp_supabase-mcp-server_execute_sql` tool. The project ID is **`cjgsgowvbynyoceuaona`** (spark-kanban).

Use the following query:
```sql
SELECT id, title, status, repo, item_type
FROM public.work_ledger 
WHERE status IN ('pending', 'planned', 'dispatched', 'built', 'verified') 
ORDER BY priority ASC, created_at DESC
LIMIT 30;
```

**CRITICAL NOTE:** Do NOT read the `~/scceo-1/grok-personal/data/work_ledger.json` file. The MCP SQL call is faster, doesn't require locating the central repo, and avoids contextual overflow.

## Step 2: Route by Phase

For all active items, determine their current phase and action:

### Phase 1: Needs Plan (Backlog → Planned)
- **Condition:** Item is `pending` AND has no plan file in `plans/` or `gemini-tasks/`.
- **Action:** Batch these items and dispatch them to the cloud planning loop.
- **Command:** Suggest or run `/jules-plan-loop` on the batch.

### Phase 2: Needs Code (Planned → Built)
- **Condition:** Item is `planned` (has a plan file) but has no PR open.
- **Action:** Enqueue them into the Heartbeat supervisor or dispatch via Jules. 
- **Command:** Use `mcp_kai-bridge_heartbeat_enqueue(task_file, repo)` or `/send-to-jules`. (Never write the code locally).

### Phase 3: Needs Review (Built → Verified)
- **Condition:** Item is `built` (PR is open) but not verified.
- **Action:** Batch the open PRs and run CI verification.
- **Command:** Dispatch to `/jules-merge-verify` or `/ci-full-verify` to run tests sequentially in a sandbox branch.

### Phase 4: Ready to Ship (Verified → Done)
- **Condition:** Item is `verified` (CI passed, 100% green).
- **Action:** Present these items to Nick in a neat menu.
- **Prompt:** "These N items are verified and ready. Say 'ship [id]' to perform the final rollout."

## Step 3: Present Routing Plan and Execute

Ask Nick before firing off mass parallel executions.

```
📋 Dev Loop Routing:
- 5 items need plans -> Will dispatch to Jules Plan Loop
- 12 items need code -> Will enqueue in Heartbeat
- 4 PRs need review -> Will dispatch CI Verify
- 3 items ready to ship -> [Awaiting your approval]

Proceed with dispatches?
```

Once Nick approves, execute the corresponding routing commands via the `kai-bridge` MCP tools or shell scripts.

## Important Constraints

- **DO NOT write code or draft plans directly.** This skill is explicitly designed to protect the context window. It ONLY routes and orchestrates.
- **DO NOT merge PRs directly.** That belongs in the Review/Ship phase.
- **ALWAYS update the ledger.** If an item state changes, or a dispatch fires, update the `public.work_ledger` using the Supabase MCP as outlined in the `work-ledger-sync` skill protocols.
