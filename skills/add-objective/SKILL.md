---
name: add-objective
description: Add or update a core feature objective for a repository (branch) and sync it globally. Use this when the user asks to add an objective, update a repo's objectives, track new strategic goals, or fix strategic misalignment.
ruleDomains:
  - ops
---

# Add Objective

Use this skill whenever a repository's (or branch's) core objectives need to be established or updated. This ensures all agents building features in that repo understand the strategic business intent before they begin work.

## Core Process

1. **Understand the Objective**: If the user didn't provide one, ask for the new objective they want to add to the target repository.
2. **Upsert to Supabase**: Insert the updated objectives into the central `rule_ledger.objectives` table in Supabase.
3. **Distribute Globally**: Run the python distribution script to push the new `OBJECTIVES.md` out to the repository.

### Step 1: Prepare the Objectives

Determine the target repository key (e.g., `scceo`, `rocket`, `spark-kanban`, `app`, `web`, `rv`, `auto1`, `pinchpay`, `portal`, `bedabeda`, `spark-skill-build`).

Formulate the objective content as markdown. It should traditionally look like this:

```markdown
# [Repo Name] Core Objectives

1. **[Objective 1 Title]**: [Description]
2. **[Objective 2 Title]**: [Description]
```

If updating existing objectives, make sure to fetch the current ones first using the `mcp_supabase-mcp-server_execute_sql` tool on project `cjgsgowvbynyoceuaona`:
```sql
SELECT objective_text FROM rule_ledger.objectives WHERE repo_name = '<repo-key>';
```
Then append or merge the new objective into the text.

### Step 2: Upsert to Supabase

Use the `mcp_supabase-mcp-server_execute_sql` MCP tool (project `cjgsgowvbynyoceuaona`) to upsert the objective:

```sql
INSERT INTO rule_ledger.objectives (repo_name, objective_text)
VALUES (
    '<repo-key>', 
    '<full-markdown-content>'
) ON CONFLICT (repo_name) DO UPDATE SET objective_text = EXCLUDED.objective_text;
```

### Step 3: Distribute Locally

After the objective is successfully inserted into Supabase, you must run the sync script to generate the local `OBJECTIVES.md` files across all repos:

```bash
python3 ~/scceo-1/grok-personal/distribute_objectives.py
```

### Step 4: Verify

Verify that the `OBJECTIVES.md` file was successfully written to the target repository's root directory. Tell the user the objective has been added and synced.