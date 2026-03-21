# Consolidation Patterns Reference

## Table of Contents
1. [Tier Definitions](#tier-definitions)
2. [Decision Matrix](#decision-matrix)
3. [Absorption Patterns](#absorption-patterns)
4. [Known Consolidation Candidates](#known-consolidation-candidates)
5. [SQL Templates](#sql-templates)
6. [SKILLS-REGISTRY.md Format](#skills-registrymd-format)

---

## Tier Definitions

| Tier | Description |
|---|---|
| `core` | Primary automation target. An autonomous agent would invoke this directly. Covers all variations of its domain via flags/modes. |
| `supporting` | Genuinely distinct sub-task with a unique purpose. Not a variation of something else. Stays as a separate skill. |
| `absorbed` | Was a separate skill. Content folded into a primary skill's SKILL.md or `references/`. Disabled in Supabase (record preserved). |

**Key difference from rules:** No count target. Skills are on-demand, not always-loaded. The only metric is uniqueness — every enabled skill must have a purpose that no other enabled skill covers.

---

## Decision Matrix

Apply in order. First match wins.

| Test | Result |
|---|---|
| Could an autonomous agent pick this as a direct job/command? | → **core** |
| Manages the toolkit itself (distill-*, add-*, improve-*, optimize-*) | → **core** |
| Genuinely distinct purpose from all other skills — no overlap | → **supporting** |
| Is a repo-specific or context-specific variation of a primary skill | → fold into primary as a `--repo` / `--mode` flag, mark **absorbed** |
| Is a wrapper, alias, or renamed copy of another skill | → mark **absorbed**, content rescue optional |
| Is a one-off that has already run and has no future use | → mark **absorbed** |
| Is prefixed `ARCHIVED_` | → mark **absorbed**, no content rescue needed |

---

## Absorption Patterns

When a skill is absorbed into a primary, its purpose doesn't disappear — it becomes a documented mode or flag in the primary skill.

### Pattern 1: Repo Flag (most common for CI/dispatch skills)

**Before:** `rocket-ci-gates`, `scceo-ci-gates`, `app-ci-gates` — 3 separate skills
**After:** `ci-full-verify` gains a `--repo` flag, all three absorbed

Add to the primary skill's SKILL.md:
```markdown
## Modes

### --repo <name>
Scope CI to a single repo. Valid: `rocket`, `scceo`, `app`, `spark-kanban`, `rv`.

Previously handled by `rocket-ci-gates`, `scceo-ci-gates`, `app-ci-gates`.
```

### Pattern 2: Scope/Depth Flag

**Before:** `ci-full-verify` + `ci-verify` (fast vs full)
**After:** `ci-full-verify` gains `--fast` flag, `ci-verify` absorbed

```markdown
## Modes

### --fast
Runs quick smoke tests only. Equivalent to the former `ci-verify` skill.
```

### Pattern 3: Sub-workflow Mode

**Before:** `send-to-jules` + `jules-plan-loop` (single dispatch vs batch planning)
**After:** If genuinely different enough in flow, keep both. If one is just `send-to-jules --batch`, absorb.

Decide by asking: **would an agent ever be confused about which to call?** If yes, they need to be separate. If the distinction is just a flag, fold it.

### Pattern 4: Renamed/Alias Skill

**Before:** `skill-creator` and `add-skill` (same purpose, different names)
**After:** `add-skill` is canonical. Rescue any unique content from `skill-creator/SKILL.md` into `add-skill/references/legacy-skill-creator.md`, then mark absorbed.

```bash
SKILL_DIR=~/.agents/skills
cat "$SKILL_DIR/skill-creator/SKILL.md" \
  > "$SKILL_DIR/add-skill/references/legacy-skill-creator.md"
echo -e "\n---\n_Absorbed from skill-creator on $(date +%Y-%m-%d)_" \
  >> "$SKILL_DIR/add-skill/references/legacy-skill-creator.md"
```

### Pattern 5: Dead / Completed One-Off

**Before:** `fix-together-ai`, `fix-skill-distribution`, `duplicate-cleanup`
**After:** Mark absorbed. No content rescue — these were one-off fixes with no reuse value.

No filesystem changes needed (leave the directory as historical record). Just disable in Supabase.

---

## Known Consolidation Candidates

> First-pass map. Phase 1 of distill-skills refines this against actual skill content and usage.

### Consolidate → `ci-full-verify`
Absorb: `rocket-ci-gates`, `scceo-ci-gates`, `spark-kanban-ci-gates`, `app-ci-gates`, `rv-ci-gates`, `auto1-ci-gates`, `pinchpay-ci-gates`, `web-ci-gates`, `legacy-ci-gates`, `ci-verify`
Mechanism: `--repo` flag + `--fast` flag

### Consolidate → `add-skill`
Absorb: `skill-creator` (alias), `update-skill` (add `--update` mode), `fix-skill-distribution` (one-off, dead), `duplicate-cleanup` (one-off, dead), `distribute-skills` (fold into add-skill as publish step), `sync-skills` (fold into add-skill as sync step)

### Consolidate → `send-to-jules`
Evaluate: `jules-plan-loop` — keep separate if the batch planning flow is distinct enough that an agent should explicitly choose it. Absorb if it's just `send-to-jules --batch --plan-mode`.

### Consolidate → `make-a-plan`
Absorb: `plan-advance` (fold as `--advance` mode), `review-plan` (fold as `--review` mode), `closeout-plan` (fold as `--close` mode)
Keep separate: `plan-and-prioritize` (distinct strategic workflow), `repo-planning` (if genuinely distinct repo-specific flow)

### Consolidate → `plan-wave`
Absorb: `wave-dispatch` (if same as plan-wave --dispatch), `conveyor-dispatch` + `conveyor-item` (evaluate — may be a distinct pipeline abstraction worth keeping)

### Consolidate → `morning-boot`
Absorb: `daily-check` (if subset), `get-status` (if subset), `whats-next` (fold as `--next` mode)
Keep separate: `sos-pulse` (distinct SOS-specific pulse), `finance-loop` (distinct domain), `objectives-check` (distinct strategic check)

### Consolidate → `send-to-antigravity`
Absorb: `manager-canary-dispatch` (if just AG with specific routing), `orchestrator-mode` (evaluate)
Keep separate: `verify-agent`, `verify-compass` (if genuinely distinct verification targets)

### Clean Absorb (dead one-offs, no content rescue needed)
`ARCHIVED_grok-plan-loop`, `fix-together-ai`, `nuke-permissions`, `fix-skill-distribution`, `duplicate-cleanup`

### Verify Before Deciding
`op-dev-session` vs `open-dev-session` — one is redundant, need to check which is current
`free-up` / `trim-ag` — check if still in use
`major-improvement` — check if absorbed by `improve-rules`
`slug` — check if still called anywhere

---

## SQL Templates

### Mark absorbed skills
```sql
UPDATE rule_ledger.skills SET
  tier = 'absorbed',
  enabled = false,
  parent_skill_slug = '{primary_slug}',
  updated_at = now()
WHERE slug IN (/* absorbed slugs */);
```

### Tag core skills
```sql
UPDATE rule_ledger.skills SET tier = 'core', updated_at = now()
WHERE slug IN (
  'morning-boot', 'make-a-plan', 'plan-and-prioritize',
  'send-to-jules', 'send-to-antigravity', 'jules-plan-loop',
  'ci-full-verify', 'dev-loop', 'run-qa-loop',
  'distill-rules', 'distill-skills',
  'add-rule', 'add-skill', 'outcome-record',
  'read-the-rules', 'optimize-rules', 'improve-rules',
  'check-rule-alignment', 'morning-content-jam', 'plan-wave'
);
```

### Tag supporting skills (run per parent)
```sql
UPDATE rule_ledger.skills SET
  tier = 'supporting',
  parent_skill_slug = '{primary_slug}',
  updated_at = now()
WHERE slug IN (/* genuinely distinct supporting slugs */);
```

### Verify state
```sql
SELECT tier, enabled, count(*) FROM rule_ledger.skills GROUP BY tier, enabled ORDER BY tier;

-- Confirm no two enabled skills have the same effective purpose
SELECT slug, name, tier, parent_skill_slug
FROM rule_ledger.skills
WHERE enabled = true
ORDER BY tier, slug;
```

---

## SKILLS-REGISTRY.md Format

After consolidation, generate `~/.agents/skills/SKILLS-REGISTRY.md`. This is the single reference doc for every enabled skill, its purpose, and its flags.

```markdown
# Skills Registry
_Last updated: YYYY-MM-DD by distill-skills_

## Core Skills (direct automation targets)

### morning-boot
**Purpose:** Daily system pulse — revenue gates, work ledger, director queue, unread chat.
**Flags:** none
**Triggers automatically:** session start, cron

### ci-full-verify
**Purpose:** Run CI verification across any repo.
**Flags:**
  - `--repo <name>` — scope to one repo (rocket, scceo, app, spark-kanban, rv)
  - `--fast` — smoke tests only
**Absorbed from:** rocket-ci-gates, scceo-ci-gates, app-ci-gates, ci-verify

### add-skill
**Purpose:** Create or update a skill end-to-end (design → write → triple-publish → Supabase).
**Flags:**
  - `--update` — iterate on existing skill
  - `--sync` — push to Supabase only
**Absorbed from:** skill-creator, update-skill, sync-skills

...

## Supporting Skills (invoked by core skills)

### jules-merge-verify
**Purpose:** Verify a Jules PR before merge. Called by send-to-jules post-completion.
**Parent:** send-to-jules

...
```
