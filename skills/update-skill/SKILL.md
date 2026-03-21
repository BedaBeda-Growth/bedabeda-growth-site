---
name: Update Skill
description: Modify an existing skill in the Company Skill Library. Use when Nick says "update skill X", "improve skill X", "add a step to skill X", "fix skill X", "chain skill X to skill Y", or any request to edit an existing skill's SKILL.md, scripts, or references. This skill is NOT for creating a brand-new skill from scratch — use `add-skill` for that. Workflow: scan rules → scan existing skills for overlap/chaining → apply changes → evaluate impact → publish to all 3 locations + Supabase.
license: Complete terms in LICENSE.txt
ruleDomains:
  - ops
---

# Update Skill

Use this skill when modifying any existing skill in the library — editing SKILL.md, adding/removing scripts, chaining to another skill, or restructuring references.

**Not for new skills** → use `add-skill` skill.
**Not for updating rules** → use `update-rule` skill.

---

## Workflow

### Step 0 — Ledger Entry (MANDATORY — Rule Zero)

Before touching any files, confirm a work ledger entry exists.

If none exists, create one now:
```
AUTO-{YYYYMMDD}-update-skill-{skill-slug}
```

Tell Nick which ledger entry maps to this work. Do not proceed without it.

---

### Step 1 — Scan Rules for Alignment

Pull active rules from Supabase before making any changes. Every skill update must stay compliant.

**Via Supabase MCP (preferred):**
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT rule_key, name, domain, severity, trigger_name, action_type, enabled
FROM rule_ledger.rules
WHERE enabled = true
ORDER BY priority ASC, severity DESC;
```

**What to check:**
- Rules in domains the skill touches (e.g., `ops`, `docs`, `engineering`, `security`)
- Rules that **mandate** steps the skill must include (e.g., ledger tracking, verification gates)
- Rules that **restrict** what the skill may do
- Rules the skill changes could break or strengthen

**Output of this step:**
- Short list of rules that apply to this skill's domain
- Confirmation the proposed changes don't violate any rule
- Note any rule the changes should actively reinforce

Do not proceed to Step 2 until this check is complete. If the skill touches `ops` domain, it MUST already include a work ledger update step.

---

### Step 2 — Scan Existing Skills for Overlap

Before writing a single line, check whether the change could be achieved by chaining to an existing skill rather than duplicating logic.

**Scan the library:**
```bash
ls ~/.agents/skills/
# or
ls ~/scceo-1/.agents/skills/
```

**For each skill that might be relevant:**
```bash
head -10 ~/.agents/skills/<skill-name>/SKILL.md
# Read the frontmatter description to assess overlap
```

**Decision matrix:**

| Scenario | Action |
|---|---|
| Existing skill already covers the need exactly | Chain to it (reference it, don't copy it) |
| Existing skill partially covers it | Extend via reference in SKILL.md, or add a script in THAT skill instead |
| No overlap found | Proceed to add directly to the target skill |
| New step duplicates core logic from another skill | Link to that skill as a sub-step, document the chain |

**Chaining pattern** — when the update adds a step that's really another skill's job:
```markdown
### Step N — <Step Name>

Use the `<other-skill-name>` skill for this step. Run it now:
> Trigger: "<natural language phrase to invoke the other skill>"
```

Document any chaining decisions in a `## Skill Chains` section of the updated SKILL.md.

---

### Step 3 — Apply Requested Changes

Now implement the approved changes to the target skill.

**Locate the skill:**
```bash
# Primary location (always edit here first)
~/scceo-1/.agents/skills/<skill-slug>/SKILL.md
```

**Common change types and guidelines:**

| Change Type | Guideline |
|---|---|
| Add a step | Insert in logical order; renumber all steps; check for downstream step references |
| Remove a step | Confirm no other skill or workflow references it by number |
| Add a script | Test it before publishing — run it once on real data |
| Add a reference file | Link from SKILL.md; describe when to load it |
| Chain to another skill | Use chaining pattern (Step 2 above) |
| Tighten/relax a gate | Update the gate condition AND the PASS/FAIL criteria |
| Update frontmatter description | Keep it trigger-complete — the description IS the trigger mechanism |

**Writing rules:**
- Always use imperative/infinitive form
- Keep SKILL.md body under 500 lines — move detail into `references/` files if growing
- Description field must include both WHAT the skill does AND WHEN to use it
- No README.md, CHANGELOG.md, or auxiliary files — only SKILL.md + functional resources

---

### Step 4 — Evaluate Impact

Before publishing, assess whether this change affects anything beyond the skill itself.

**Score each dimension:**

| Dimension | Question | Answer |
|---|---|---|
| **Rule coverage** | Does the change add, remove, or alter a rule gate? | added / removed / unchanged |
| **Other skills** | Does any other skill reference or chain to this one? | yes → list them / no |
| **Workflows** | Is this skill referenced in any workflow file? | check `.agents/workflows/` |
| **Trigger drift** | Did the description change? Could trigger alignment shift? | yes / no |
| **Supabase schema** | Does the change require a schema update in `rule_ledger.skills`? | yes / no |

**Workflow file scan:**
```bash
grep -r "<skill-slug>" ~/scceo-1/.agents/workflows/ 2>/dev/null
```

**Skills cross-reference scan:**
```bash
grep -r "<skill-slug>" ~/scceo-1/.agents/skills/ --include="*.md" -l 2>/dev/null
```

**Gate:** If the change removes a rule gate, OR breaks a cross-skill chain, OR breaks a workflow reference — surface to Nick before publishing. Do not auto-publish in those cases.

If impact is **low** (isolated change, no rule collisions, no cross-skill breaks): proceed to Step 5.
If impact is **high** (rule gate change, chain breaks, workflow changes): present the impact summary to Nick, get explicit approval, then proceed.

---

### Step 5 — Publish Skill (Triple Publication — MANDATORY)

Every skill update must land in all three locations. If only one or two are updated, the change is incomplete.

**5a — Local workspace (source of truth for edits):**
Already done during Step 3: `~/scceo-1/.agents/skills/<skill-slug>/`

**5b — Copy to secondary local locations:**
```bash
cp -r ~/scceo-1/.agents/skills/<skill-slug>/ ~/scceo-1/skills/<skill-slug>/
cp -r ~/scceo-1/.agents/skills/<skill-slug>/ ~/.agents/skills/<skill-slug>/
```

**5c — Upsert to Supabase (single source of truth for all repos):**

Read the updated SKILL.md content, then:

```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
INSERT INTO rule_ledger.skills (slug, name, description, skill_md, rule_domains, enabled, owner)
VALUES (
  '<skill-slug>',
  '<Human Name>',
  '<description from frontmatter>',
  '<full updated SKILL.md content>',
  ARRAY['ops'],
  true,
  'kai'
)
ON CONFLICT (slug) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  skill_md     = EXCLUDED.skill_md,
  rule_domains = EXCLUDED.rule_domains,
  updated_at   = now();
```

**5d — Verify the upsert:**
```sql
-- Use supabase-mcp-server execute_sql with project_id: cjgsgowvbynyoceuaona
SELECT slug, name, updated_at FROM rule_ledger.skills WHERE slug = '<skill-slug>';
```

Confirm `updated_at` reflects now. If it doesn't, repeat 5c.

**5e — Package (if distributing externally):**
```bash
cd ~/scceo-1/.agents/skills/add-skill
python3 scripts/package_skill.py ~/scceo-1/.agents/skills/<skill-slug>/
```

**5f — Verify Antigravity Trusted Paths:**

After publishing, ensure all repo directories are in Antigravity's `trustedPaths` so the skill is visible across all workspace windows (not just scceo-1).

```python
import json
from pathlib import Path

settings_path = Path.home() / "Library/Application Support/Antigravity/User/settings.json"
d = json.loads(settings_path.read_text())

required_paths = [
    str(Path.home() / "scceo-1"),
    str(Path.home() / "app"),
    str(Path.home() / "rv"),
    str(Path.home() / "fractional-ignite"),
    str(Path.home() / "spark-kanban"),
]

changed = False
for key in ["autoAcceptFree.trustedPaths", "antigravity-autopilot.trustedPaths"]:
    existing = d.get(key, [])
    merged = list(dict.fromkeys(existing + required_paths))
    if merged != existing:
        d[key] = merged
        changed = True

if changed:
    settings_path.write_text(json.dumps(d, indent=2))
    print("✅ Trusted paths updated — reload Antigravity window to pick up changes")
else:
    print("✅ Trusted paths already complete — no changes needed")
```

Run as: `python3 /tmp/check_trusted_paths.py`

If any paths were added, tell Nick: **"Reload the affected Antigravity window (`Cmd+Shift+P` → `Developer: Reload Window`) to pick up the new skill."**

---

## Verification Checklist (Rule: ops-done-means-verified-everywhere)

Before reporting the update complete, confirm ALL of the following:

- [ ] Rules scanned and no violations found (Step 1)
- [ ] Skill overlap checked; chaining used if appropriate (Step 2)
- [ ] Changes applied and tested (Step 3)
- [ ] Impact evaluated; Nick approved if high-impact (Step 4)
- [ ] Copied to `~/scceo-1/skills/<slug>/` ✓
- [ ] Copied to `~/.agents/skills/<slug>/` ✓
- [ ] Upserted to Supabase `rule_ledger.skills` ✓
- [ ] Supabase `updated_at` verified ✓
- [ ] Antigravity trusted paths verified (Step 5f) ✓
- [ ] Work ledger entry updated to `done` ✓

If any box is unchecked, the update is **not done**. Say "partially done" and list what remains.

---

## Skill Chain Reference

This skill chains to or complements:

| Skill | When |
|---|---|
| `add-skill` | When the update reveals a need for a whole new skill |
| `update-rule` | When a step in the updated skill enforces a rule that should change |
| `list-rules` | Step 1 fast path — scan all active rules |
| `check-rule-alignment` | Deep alignment audit against the full rule matrix |
| `work-ledger-sync` | Updating ledger status at start and completion |
