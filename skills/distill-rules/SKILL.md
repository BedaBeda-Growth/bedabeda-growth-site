---
name: distill-rules
description: >
  Compress the rule ledger back down to the Core 15 by merging overlapping rules
  and demoting operational details to process references. Use this skill when
  rule sprawl has caused the active rule count to climb significantly above 15,
  making enforcement brittle and context windows heavy.
ruleDomains:
  - ops
---

# Distill Rules — Target Core 15

> **Prime directive:** The optimal active rule count is 15. Anything above that usually means processes, checklists, or incident playbooks have disguised themselves as rules, or new rules were created that overlap with existing ones.

This skill executes a structured compression of the rule ledger. It absorbs overlapping constraints into comprehensive principles and safely preserves demoted knowledge into `rule_ledger.process_refs` so nothing is lost.

> [!WARNING]
> Rules cannot be removed or disabled without Nick's explicit approval (`meta-no-rule-removal`). This skill operates in two phases: **Propose** and **Execute**. You must pause for approval between them.

---

## Phase 1: Propose Consolidation

### 1. Read Current State
Query the active rule set:
```sql
SELECT rule_key, name, domain, severity, autonomy_level, description, layer
FROM rule_ledger.rules
WHERE enabled = true
ORDER BY domain, severity ASC, rule_key;
```

### 2. Apply the Rule vs. Process Test
Analyze every rule against this test:
- *If you remove this and nothing breaks — it's probably a process (how-to, cadence, checklist).*
- *If you remove this and something expensive could happen — it's a rule (constraint, boundary, invariant).*

### 3. Build the Core 15 Proposal
Group the rules into a maximum of 15 "Core" principles.
- **Merge/Absorb:** Take a strong parent rule and weave the intent of 2-5 overlapping rules into its description.
- **Demote:** Identify rules that are purely process. They will not be part of the Core 15.
- Write a proposal artifact detailing the mappings (e.g., `Core 1: All Work Must Be Tracked -> Absorbs X, Y, Z`). Let Nick know the impact (e.g., "71 rules -> 15 core, 56 demoted").

### 4. Await Approval
Stop and ask for Nick's approval on the mapping. Do not mutate the database yet.

---

## Phase 2: Execute Distillation

Once Nick approves, execute the following SQL waves via the `supabase-mcp-server`.

### Wave 1: Update the Survivor Rules (Core)
For each of the 15 core rules, update its description to include the absorbed context and ensure its layer is set:
```sql
UPDATE rule_ledger.rules SET
  description = '...', -- The new combined description
  layer = 'core',
  updated_at = now()
WHERE rule_key = '{survivor_rule_key}';
```

### Wave 2: Disable Absorbed Rules
For rules that were merged into a core rule, disable them and link lineage:
```sql
UPDATE rule_ledger.rules SET 
  enabled = false, 
  layer = 'archived', 
  superseded_by_rule_key = '{survivor_rule_key}', 
  updated_at = now()
WHERE rule_key IN ('{absorbed_1}', '{absorbed_2}');
```

### Wave 3: Disable and Demote Process Rules
For rules that failed the rule test and are just playbooks/cadences:
```sql
UPDATE rule_ledger.rules SET 
  enabled = false, 
  layer = 'process', 
  updated_at = now()
WHERE rule_key IN ('{process_rule_1}', '{process_rule_2}');
```

### Wave 4: Preserve Guidance in Process Refs
**CRITICAL:** Every rule disabled in Waves 2 and 3 must have its detailed guidance preserved as a process reference. Do not let knowledge evaporate.

```sql
INSERT INTO rule_ledger.process_refs 
  (slug, title, summary, source_type, source_rule_key, source_rule_description, source_rule_conditions, linked_rule_keys, steps_markdown)
SELECT 
  r.rule_key || '-guide',
  r.name || ' (Absorbed Guidance)',
  r.description,
  'demotion',
  r.rule_key,
  r.description,
  r.conditions_json::text,
  ARRAY[COALESCE(r.superseded_by_rule_key, 'ops-work-must-be-tracked')], -- default link if none
  'Original rule content...'
FROM rule_ledger.rules r
WHERE r.enabled = false 
  AND (r.layer = 'archived' OR r.layer = 'process')
  AND NOT EXISTS (SELECT 1 FROM rule_ledger.process_refs pr WHERE pr.source_rule_key = r.rule_key);
```
*Then link the rules back to these refs:*
```sql
UPDATE rule_ledger.rules r SET demoted_to_process_ref = r.rule_key || '-guide'
WHERE r.enabled = false AND r.demoted_to_process_ref IS NULL;
```

### Wave 5: Version Snapshots
Create an audit trail for the survivor core rules:
```sql
INSERT INTO rule_ledger.rule_versions (rule_key, version_number, changed_by, change_reason, snapshot_json, diff_summary)
SELECT r.rule_key,
  COALESCE((SELECT MAX(version_number) FROM rule_ledger.rule_versions v WHERE v.rule_key = r.rule_key), 0) + 1,
  'kai', 'Core 15 consolidation via distill-rules',
  json_build_object('layer', r.layer, 'name', r.name, 'description', r.description)::text,
  'Rule updated to absorb children during distillation.'
FROM rule_ledger.rules r
WHERE r.enabled = true AND r.layer = 'core';
```

---

## Phase 3: Distribute

1. **Verify State:**
   ```sql
   SELECT layer, enabled, count(*) FROM rule_ledger.rules GROUP BY layer, enabled;
   SELECT count(*) FROM rule_ledger.process_refs;
   ```
   *You should see exactly 15 enabled rules, all in the 'core' layer.*

2. **Trigger Distribution Script:**
   ```bash
   cd ~/scceo-1/grok-personal && python3 distribute_rules.py
   ```
   *(This dynamically pulls the Core 15 and distributes them to `AGENT-RULES.md` in all repos).*

3. **Update GEMINI.md:**
   Manually rewrite `~/.gemini/GEMINI.md` to reflect the newly condensed Core 15 list so it loads correctly on agent start.

4. **Triple-Publish the Skill (if modified):**
   ```bash
   cp -r ~/scceo-1/.agents/skills/distill-rules/ ~/scceo-1/skills/distill-rules/
   cp -r ~/scceo-1/.agents/skills/distill-rules/ ~/.agents/skills/distill-rules/
   ```