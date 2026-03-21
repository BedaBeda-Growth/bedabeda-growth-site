---
name: distill-skills
description: >
  Audit the skill registry for redundancy and consolidate overlapping skills into unified, flag-aware
  primary skills. Use when multiple skills do degrees of the same thing, when the registry has grown
  without clear uniqueness enforcement, or before building autonomous agent stacks where skill
  disambiguation matters. Unlike distill-rules (which has a hard cap of 15), distill-skills has no
  count target — the goal is uniqueness: one skill per distinct purpose, each covering all its
  variations in one place. Pairs with distill-rules for a parallel maintenance loop.
ruleDomains:
  - ops
---

# Distill Skills — Enforce Uniqueness, Consolidate Variants

> **Prime directive:** Every skill must be unique by purpose. When two skills do overlapping things, fold the redundant one's use cases into the primary as documented flags, variants, or modes — then disable the shell. Nothing is deleted. Everything is absorbed.

This is fundamentally different from `distill-rules`:
- **Rules:** Hard cap of 15 — context window is a shared resource, strict enforcement required.
- **Skills:** No hard cap — skills are invoked on-demand. The problem isn't count, it's **disambiguation**. When an autonomous agent has to choose between `send-to-jules` and `jules-plan-loop` and `conveyor-dispatch`, it wastes cycles and makes wrong choices. One skill, clearly named, covering all modes = zero ambiguity.

The output of this skill: a registry where every enabled skill has a distinct purpose, and every variation of that purpose is documented inside the primary skill — not scattered across N separate skills.

See [references/consolidation-patterns.md](references/consolidation-patterns.md) for the full absorption playbook, flag documentation patterns, and SQL templates.

---

## Phase 1: Audit — Find Redundancy Clusters

### 1. Inventory all skills
```sql
SELECT slug, name, tier, enabled, updated_at
FROM rule_ledger.skills
WHERE enabled = true
ORDER BY slug;
```
Also scan the filesystem for skills not yet synced to Supabase:
```bash
ls ~/.agents/skills/ | sort
ls ~/scceo-1/skills/ | sort
```

### 2. Cluster by purpose
Group skills that do overlapping things. For each cluster, ask:

- **Can one skill cover all these use cases with flags or modes?** → Consolidation candidate
- **Are these genuinely distinct tasks that an agent would never confuse?** → Keep both, they're fine
- **Is one skill literally a subset of another?** → Absorb the subset into the primary

Common cluster types to look for:
- Multiple CI gate skills that differ only by repo (`rocket-ci-gates`, `scceo-ci-gates`, etc.)
- Multiple dispatch skills at different abstraction levels
- Multiple verify/check skills that differ only in scope
- Pairs where one is clearly a wrapper around the other

### 3. Build the Consolidation Map
Produce a table for each cluster:

```
Cluster: CI Verification
  Primary: ci-full-verify
  Absorb: rocket-ci-gates, scceo-ci-gates, app-ci-gates, ...
  Mechanism: ci-full-verify gets a --repo flag; each repo's specific gates become a documented mode

Cluster: Dispatch
  Primary: send-to-jules
  Keep separate: send-to-antigravity (genuinely different target, different behavior)
  Reason: different enough that an agent should choose explicitly
```

Include the impact summary: e.g., `87 enabled skills → 52 after consolidation (35 absorbed)`.

### 4. Await Nick's approval
Stop and present the Consolidation Map. Do not modify any files or database until approved.

---

## Phase 2: Execute Consolidation

For each approved consolidation, run three steps.

### Step A: Update the Primary Skill
Add a **Variants / Modes** section to the primary skill's SKILL.md documenting the absorbed use cases:

```markdown
## Variants

### --repo <name>
Runs CI gates for a specific repo. Supported: rocket, scceo, app, spark-kanban, rv.
Equivalent to what was previously handled by `rocket-ci-gates`, `scceo-ci-gates`, etc.

### --full
Runs the complete suite including slow integration tests. Default is fast-only.
```

If the absorbed skill had its own references or scripts, move them into the primary skill's
`references/` or `scripts/` folder with a clear name.

### Step B: Mark the Absorbed Skill as Absorbed in Supabase
```sql
UPDATE rule_ledger.skills SET
  tier = 'absorbed',
  enabled = false,
  parent_skill_slug = '{primary_slug}',
  updated_at = now()
WHERE slug IN (/* absorbed skills */);
```
> The skill is disabled (won't appear in agent context) but the record is preserved. Its history, description, and skill_md are permanently accessible for reference.

### Step C: Triple-publish the Updated Primary Skill
```bash
PRIMARY="ci-full-verify"
cp -r ~/.agents/skills/$PRIMARY/ ~/scceo-1/skills/$PRIMARY/
# Then upsert updated SKILL.md to Supabase (see add-skill Step 7)
```

---

## Phase 3: Update the Central Skills Registry

After all consolidations execute, regenerate the central skills registry doc. This is the single reference that shows every skill, its purpose, and its flags/variants.

### Generate the registry
```bash
python3 ~/scceo-1/grok-personal/distribute_rules.py
```

Or manually write/update `~/.agents/skills/SKILLS-REGISTRY.md` — see
[references/consolidation-patterns.md](references/consolidation-patterns.md) for the registry format.

### Verify the result
```sql
-- Confirm no two enabled skills have overlapping purposes
SELECT tier, enabled, count(*) FROM rule_ledger.skills GROUP BY tier, enabled ORDER BY tier;
```

### Triple-publish this skill if modified
```bash
cp -r ~/scceo-1/.agents/skills/distill-skills/ ~/scceo-1/skills/distill-skills/
cp -r ~/scceo-1/.agents/skills/distill-skills/ ~/.agents/skills/distill-skills/
# Then upsert to Supabase (see add-skill Step 7)
```
