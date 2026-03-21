---
name: "Plan & Prioritize"
description: "Priority selection + planning orchestration for either local deep-authoring or the cloud-first Jules Planning Loop: select the right items from the work ledger, keep status truth clean, prepare plan artifacts, and produce send-ready handoff batches."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
  - deploy
---

# Plan & Prioritize — Requirements to Conveyor Queue

## Trigger Phrases

- "plan", "plan this", "plan out", "build a plan", "build out a plan for"
- "add to the plan", "plan and prioritize", "I want to build X"
- "plan [feature] for [repo]"
- "plan highest priority batch"
- "top 20% priorities"
- "plan top leverage batch"

When Nick says any of these for a **major feature** (not a quick fix), run this full pipeline.

---

## Operating Modes

This skill now has three entry modes:

1. **Single-Feature Mode**
   - Use when Nick gives one major feature and wants an intent-based execution packet.
   - Flow: REQUIRE → CONTEXT → ANALYZE → DRAFT → HARDEN → TRACK → CONFIRM.

2. **Top-20 Batch Mode (Intent-Based Dispatch)**
   - Use when Nick asks for top priorities and wants Kai to prepare them for execution.
   - Run **Phase 0** first to select the right items from the work ledger + objectives.
   - Then run the full local planning pipeline per selected item.

3. **Jules Batch Execution Mode**
   - Use when Nick wants the Jules execution loop for a batch of top priorities.
   - In this mode, **Phase 0 still owns selection and status truth**.
   - **Crucially: Jules handles the "How", we handle the "What" and the "Test".** 
   - The flow is:
     1. Select the right implementation items.
     2. **Locally author an Intent-Based Dispatch Packet** for each item (Context Pack + Goal Criteria + Validation Gates).
     3. Ensure each packet is reviewed and 100% APPROVED.
     4. Dispatch the strict packets to Jules for **execution**.
   - This prevents Jules from brittle failures on micro-managed steps, instead holding it accountable to verifiable goals.

---

## Repo → Category Ledger (Hard Gate — Confirm Repo Before Drafting)

**Last updated:** 2026-03-09 (Nick-confirmed)

Before any plan is drafted, confirm the target repo against this table. If the task's natural category doesn't match the assigned repo, surface the mismatch to Nick before proceeding.

| Category | Canonical Repo | Notes |
|----------|---------------|-------|
| AP/AR + accounting ops | `scceo` | All core business finance ops |
| Internal AI / orchestration / Kai systems | `scceo` | Grok planning loop, morning pipeline, dispatch |
| Email pipeline / debounce / send automation | `scceo` | Send, verify, nurture wiring |
| AP loop (morning automation) | `scceo` | Confirmed by Nick 2026-03-09 |
| Grok planning loop cleanup | `scceo` | Confirmed by Nick 2026-03-09 |
| Public platform: auth, signup, checkout, courses | `rocket` | PinchForth/fractional-ignite |
| Meetings / Jitsi / /leader-sharing page | `rocket` | fractional-ignite |
| Account Settings, Admin Hub, member pages | `rocket` | fractional-ignite |
| TutorForge delivery tier (content, courses) | `rocket` | Content delivery layer only |
| TutorForge AI engine tier | `scceo` | Ember + Kai add-on layer — confirmed Nick 2026-03-09 |
| Team kanban / SOS task intake | `spark-kanban` | PinchForth/spark-kanban |
| Client delivery work | `spark-kanban` | e.g. Surety article links |
| SOS AR receiver (owned SCCEO, built here) | `spark-kanban` | Nick confirmed 2026-03-09 |
| Hiring platform / Freely | `app` | FreelyPF/app |
| Learner signup, referral nudge | `app` | FreelyPF/app |
| Client landing pages | `rv` | Renovio |

**When in doubt:** Ask Nick before drafting. Wrong repo = wasted cycles.

---

## Phase 0: PRIORITIZE — Select Highest-Leverage Batch (DETERMINISTIC)

**Goal:** Recommend the highest-leverage pending items from the work ledger.

**CRITICAL RULE:** Do NOT manually calculate leverage scores, deduce statuses, deduplicate items, or map repos yourself. You MUST use the Python engines built for this exact purpose. Bypassing the scripts guarantees stale data and hallucinated priorities, which violates company operating rules.

### Step 1: Run the Unified Pre-flight Pipeline

We use a single unified runbook to automatically sync GitHub status, reconcile drifted lanes, archive duplicates, and extract the real top priorities.

```bash
cd ~/scceo-1/grok-personal && python3 scripts/plan_prep_pipeline.py --limit <BATCH_SIZE>
```
*(Note: Change `--limit 5` to whatever batch size Nick requested, e.g. `--limit 50`. Add `--repo <repo_name>` if Nick asked for a specific repository.)*

### Step 1B: 30-30-30 Triage Mode (Balanced Dispatch)

When Nick asks for a balanced 30-30-30 dispatch batch across multiple repos (App, Ignite infrastructure, Spark Kanban), use the dedicated triage script:

```bash
cd ~/scceo-1/grok-personal && python3 scripts/plan_prep_pipeline.py --triage-30
```

This pulls 15 priorities from the App repo, 15 from Fractional Ignite (focusing on infrastructure like auth, payments, UX), and 15 from Spark Kanban. It builds the drafts, automatically runs the intent assembler (auto-fill + done criteria builder), and runs the QA validator. It will print a report highlighting exactly which drafts need manual LLM polish before handoff.

### Step 2: Presentation and Confirmation
Review the output from `plan_prep_pipeline.py`. 
Always present clearly to Nick:
- The ranked top list (ID, repo, Title, Health, Score, Status)
- Ask for confirmation: "Here is the exact output from the prioritization engine. Shall I proceed with authoring dispatch packets for these items?"

After confirmation, choose the batch path explicitly:

#### Path A — Intent-Based Authoring (Default)
Use this as the primary path to prepare work for execution (either local or Jules).
1. Run Phases 1-7 for each selected item (one dispatch packet per item)
2. Keep source ledger ID linked in each packet header (`Source Item: {id}`)
3. Create a batch summary with:
   - ranking table
   - selected IDs
   - packet paths
   - objective coverage
4. Emit **Send-to-Jules handoff payload** per item:
   - `repo`, `item_id`, `packet_path`, `repo_plan_path`, `review_path`, `objective_ids`, `verification_checks`
5. Do **not** run dispatch/orchestrator from this skill. Hand off only.

#### Path B — Jules Batch Execution Loop
Use this when Nick wants to dispatch a batch of work to Jules for execution.
1. **Locally author the full Intent-Based Dispatch Packet** for each selected item. Do NOT dispatch a stub. Jules needs context, goals, and gates, not stubs.
2. Run the `make-a-plan` equivalent logic locally to build a robust `execution_dispatch_packet` for each item:
   - `repo`
   - `item_id`
   - `title`
   - `priority`
   - `objective_ids`
   - `dispatch_packet_path`
3. Mark the selected items as `execution_dispatch_ready` in the batch summary.
4. Expect the next stages to happen in order:
   - local rule-gated polish + local approval of the dispatch packets
   - Send-to-Jules execution dispatch (handoff to the **Send to Jules** skill)
5. The deliverable from this skill in batch execution mode is a **clean execution batch + verified intent packets + dispatch packets**, ready for Jules to write code.

Safety rules:
- Never handoff without showing selected IDs + packet paths
- Never mix repos in one automatic execution dispatch batch unless explicitly requested
- Never silently include objective-unmapped items
- In cloud-first mode, never skip the local polish/approval gate before execution dispatch
- **Never dispatch a batch-generated stub to Jules.** Stubs must be enriched with actual context, goal criteria, and validation gates before they qualify for Jules dispatch. Rule: `ops-plan-must-capture-verbatim-context`

---

## Jules Batch Execution Adapter

When Nick asks for the batch execution flow to Jules, treat this skill as the **selection + status-truth + intent-authoring front end** for the loop below. Jules handles the implementation steps.

### Phase JL-1 — Bulk Intent Generation
For each selected implementation item, locally prepare a full Intent-Based Dispatch Packet containing:
- item ID
- repo mapping
- objective IDs
- priority
- source ledger context
- existing repo/local plan references
- fully verified execution goals and validation gates (Context Triangle)

### Phase JL-2 — Rule-Gated Local Polish
Before any execution dispatch:
- run structural checks on the intent packets
- run company/rule checks
- patch missing verification commands / rollback details locally
- mark each packet `100% APPROVED` only after local polish is complete

### Phase JL-3 — Send-to-Jules Execution Handoff
Only after JL-2 passes:
- treat the polished packet as the canonical task card
- move the item into the send-ready queue
- hand off to the **Send to Jules** skill for execution dispatch

### Jules Execution Output Contract
When operating in this mode, always present:
1. `Selected for Intent Auth & Jules Execution`
2. `Verification / Reconcile Lane`
3. `Excluded Duplicates / Wrong-Repo / Unmapped`
4. `Intent Packets Locally Authored & Ready`
5. `Needs Local Polish Before Execution`
6. `Ready for Send-to-Jules Execution` (only after approval artifacts exist)

## Quick-Fix Escape Hatch

Before starting the full pipeline, assess scope:

- **If the work is clearly small** (< 30 min, single file, config change, bug fix with known root cause): offer to skip Phase 3 (conflict analysis) and Phase 5 (Grok loop) and go REQUIRE → CONTEXT → DRAFT → TRACK directly. Say: "This looks small enough to skip the full analysis and Grok hardening — want me to draft and track directly, or run the full pipeline?"
- **If Nick says "full plan"** or the scope is ambiguous: always run the full pipeline.

---

## Phase 1: REQUIRE — Gather Requirements

**Goal:** Collect everything needed to write a complete intent packet. Never assume — ask. Do not focus on implementation steps; focus on the "What" and the "Test".

### Mandatory inputs (ask if not provided):

| Input | Question if missing |
|-------|-------------------|
| **Target repo** | "Which repo? (rocket, spark-kanban, app, rv, scceo)" |
| **Goal Criteria** | "What exactly is the end state? Walk me through what the user sees or what the system outputs when this is done." |
| **Priority level** | "What priority? (1 = critical/revenue, 2 = high, 3 = medium)" |
| **Constraints & Limits** | "Any constraints Jules MUST NOT violate? (existing code to preserve, third-party APIs, timeline)" |
| **Validation Gates** | "How will we prove this works? What exact commands or tests must pass?" |

### Optional inputs (use if Nick provides, don't ask):

- Specific files or components to modify (if known, but avoid over-prescribing if Jules can find them)
- Related existing plans or prior work
- Who requested it (SOS task ID, team member)
- Deadline or sprint target

### Output of Phase 1:

A requirements block stored in working memory:

```
REQUIREMENTS:
- repo: {repo}
- goal_criteria: {1-2 sentence description of final state}
- priority: P{1-3}
- user_story: {what the user does, step by step}
- constraints: {list of strict no-gos}
- validation_gates: {commands or explicit manual checks}
- related_work: {existing plans, PRs, ledger items if any}
```

---

## Phase 2: CONTEXT — Pull Repo Intelligence

**Goal:** Automatically gather relevant files, functions, schema, and objectives so the plan is grounded in real code.

### Step 2a: Run Context Gatherer

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from context_gatherer import ContextGatherer
gatherer = ContextGatherer()
pack = gatherer.gather('''FEATURE_DESCRIPTION_HERE''', 'REPO_PATH_HERE')
print(gatherer.format_for_prompt(pack))
"
```

**Repo paths:**
- rocket: `~/SOS/Rocket/fractional-ignite`
- app: `~/SOS/App`
- spark-kanban: `~/SOS/MIni SOS/spark-kanban`
- rv: `~/rv`
- scceo: `~/scceo-1`

If `codebase_map.json` doesn't exist for the repo, flag it:
> "No codebase_map.json found for {repo}. I'll proceed without auto-context, but consider running `python3 codebase_indexer.py --repo {repo}` to enable it for future plans."

### Step 2b: Read Objectives

Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md` and map the feature to one or more objective IDs.

- If a clear mapping exists: record it (e.g., `OBJ-ROCKET-001`)
- If no mapping exists: **pause and ask Nick:** "What's the objective here? I don't see a match in OBJECTIVES.md. Should I create a new objective candidate?"
- If new objective is needed: draft a candidate entry for `OBJECTIVES_LOG.md` (don't write yet — include in plan for Nick's approval)

### Step 2c: Check Existing Work

Search for related items already in the system:

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from work_ledger import WorkLedger
ledger = WorkLedger()
items = ledger.get_items(repo='TARGET_REPO')
related = [i for i in items if any(kw in (i.get('title','') + ' ' + i.get('impact_tie','')).lower() for kw in ['KEYWORD1', 'KEYWORD2'])]
for i in related:
    print(f\"  {i['id']}: {i['title'][:60]} [{i.get('status','?')}]\")
"
```

Also check existing plans:
```bash
ls /Users/nicholaspetros/scceo-1/plans/*KEYWORD* 2>/dev/null
```

If related work exists, note it — the new plan should reference (not duplicate) it.

### Output of Phase 2:

- Context pack (files to read, blast radius, schema slice, relevant functions)
- Objective ID mapping
- Related existing work (ledger items, plans)

---

## Phase 3: ANALYZE — Conflict & Blast Radius Check

**Goal:** Before drafting, verify this plan fits into the current codebase, doesn't conflict with in-flight work, and won't cause schema drift or architectural regression. This is the "does this even fit?" gate.

### Step 3a: Schema Impact Analysis

Check if the planned feature touches database tables/columns and compare against the current schema.

**Read current schema:**
```bash
# From codebase_map.json (fast, structured)
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
import json
from pathlib import Path

REPO_PATHS = {
    'rocket': Path.home() / 'SOS/Rocket/fractional-ignite',
    'app': Path.home() / 'SOS/App',
    'spark-kanban': Path.home() / 'SOS/MIni SOS/spark-kanban',
    'rv': Path.home() / 'rv',
    'scceo': Path.home() / 'scceo-1',
}
repo_path = REPO_PATHS['TARGET_REPO']
cmap = json.loads((repo_path / 'codebase_map.json').read_text())
schema = cmap.get('schema', {})
print(f'Tables: {len(schema)}')
for table in sorted(schema):
    cols = [c['column'] for c in schema[table]]
    print(f'  {table}: {len(cols)} cols — {", ".join(cols[:8])}')
"
```

**Cross-reference with backup schema for full detail (if table modifications are planned):**
```bash
# Read the relevant table definitions from the schema backup
grep -A 20 'CREATE TABLE.*TABLE_NAME' /Users/nicholaspetros/scceo-1/grok-personal/data/repo_docs/TARGET_REPO/backup_schema.sql 2>/dev/null
```

**Check for planned schema changes:**
- Does the feature require new tables? → Flag: "New table `X` — verify naming convention, RLS policy needed"
- Does it modify existing columns? → Flag: "Column change on `X.Y` — check for downstream consumers"
- Does it add new RLS policies? → Flag: "RLS change — verify against auth patterns in existing policies"
- Does it add new RPCs/functions? → Flag: "New RPC `X` — check function catalogue for naming conflicts"

**Check function catalogue for naming conflicts:**
```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
import json
from pathlib import Path

cat_path = Path('data/repo_docs/TARGET_REPO/function_catalogue.json')
if cat_path.exists():
    cat = json.loads(cat_path.read_text())
    # Search for functions with similar names to what this plan will create
    for fn in cat:
        name = fn.get('name', '').lower()
        if any(kw in name for kw in ['KEYWORD1', 'KEYWORD2']):
            print(f\"  Existing: {fn['name']} in {fn.get('file', '?')}:{fn.get('line', '?')}\")
else:
    print('No function catalogue — run codedoc scanner first')
"
```

### Step 3b: File Collision Check

Cross-reference files this plan will touch against files touched by **in-flight work** (planned, dispatched, or built items in the work ledger).

```bash
cd /Users/nicholaspetros/scceo-1/grok-personal && python3 -c "
from work_ledger import WorkLedger
from context_gatherer import ContextGatherer
import json

ledger = WorkLedger()
inflight = [i for i in ledger.get_items(repo='TARGET_REPO')
            if i.get('status') in ('planned', 'dispatched', 'with_jules', 'built', 'in_progress')]

# This plan's files (from Phase 2 context pack)
plan_files = set(PLAN_FILES_LIST)

# Check each in-flight item for file overlap
gatherer = ContextGatherer()
for item in inflight:
    desc = f\"{item.get('title', '')} {item.get('impact_tie', '')}\"
    pack = gatherer.gather(desc, 'REPO_PATH')
    item_files = set(pack.files_to_read + pack.blast_radius_files)
    overlap = plan_files & item_files
    if overlap:
        print(f\"COLLISION: {item['id']} ({item['title'][:40]}) [{item['status']}]\")
        print(f\"  Overlapping files: {', '.join(sorted(overlap)[:5])}\")
"
```

**If collisions found:**
- Same file, different scope → Note in plan: "Coordinate with {item_id} — both touch `{file}`"
- Same file, overlapping scope → **STOP and surface to Nick:** "This plan conflicts with {item_id} which is already {status}. They both modify `{file}` in the same area. Should we: (a) merge into one plan, (b) sequence them, or (c) proceed knowing there'll be a merge?"

### Step 3c: Plan Overlap Check

Search existing approved plans for scope overlap:

```bash
# Search plans for matching keywords
grep -li 'KEYWORD1\|KEYWORD2\|KEYWORD3' /Users/nicholaspetros/scceo-1/plans/*.md 2>/dev/null
```

For each match, read the plan header (first 20 lines) to check:
- Is it the same repo?
- Is it addressing the same user flow or system component?
- Is it already queued (has a ledger item)?

**If overlap found:**
- Already completed plan → Reference it: "Prior plan `{slug}` covered similar ground — building on that foundation"
- Active/planned plan → **Surface to Nick:** "Existing plan `{slug}` overlaps in scope. Should this be an addendum, a replacement, or independent work?"

### Step 3d: Architecture Fit Check

Read the repo's latest codedoc report to verify the plan follows current patterns:

```bash
# Check latest TS scanner report for the repo
cd /Users/nicholaspetros/scceo-1 && python3 -c "
import json
from pathlib import Path

report_path = Path('packages/codedoc-scanner/reports/latest.json')
if report_path.exists():
    report = json.loads(report_path.read_text())
    dead = [d for d in report.get('deadCode', {}).get('items', [])
            if d.get('repo') == 'TARGET_REPO']
    print(f'Dead code items in TARGET_REPO: {len(dead)}')
    # Check if plan is building on dead code
    for d in dead:
        if any(kw in d.get('symbol', '').lower() for kw in ['KEYWORD1', 'KEYWORD2']):
            print(f\"  WARNING: Building near dead code: {d['symbol']} in {d['file']}:{d['line']}\")
"
```

Also read the blast radius from the context pack (already gathered in Phase 2):
- If blast radius > 10 files → Flag: "High blast radius ({N} files). Consider phasing the implementation."
- If blast radius includes auth, payment, or meeting files → Flag: "Touches critical path ({files}). Gate item recommended."

### Step 3f: Rule Ledger Compliance Check


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

**Goal:** Before drafting, verify the planned work doesn't bypass active rules in the Company Rule Ledger.

**Domain → Rules mapping (active as of 2026-03-11):**

| Domain | Active Rule Keys | Autonomy Level |
|--------|-----------------|----------------|
| email | `email-validate-before-send` | auto_safe |
| email | `email-no-test-domains-*` (x4) | auto_safe |
| email | `email-bounce-rate-threshold` | auto_guarded |
| deploy | `deploy-no-groq-in-prod` | auto_safe |
| deploy | `deploy-structural-gates-required` | human_review |
| payments | `payment-cart-fail-detect` | simulate |

**Check procedure:**

```python
import psycopg2  # Connect via os.environ["RULES_DATABASE_URL"]
# Query via: supabase-mcp-server execute_sql (project: cjgsgowvbynyoceuaona)
# conn = psycopg2.connect(os.environ['RULES_DATABASE_URL'])
cursor = conn.cursor()
cursor.execute("""
    SELECT rule_key, name, domain, autonomy_level, action_type, trigger_name
    FROM rules WHERE enabled = 1 AND domain IN ('email', 'deploy', 'payments')
    ORDER BY priority, domain
""")
for row in cursor.fetchall():
    print(row)
conn.close()
```

**Flag if any of these are true:**

1. **New evaluator hook required** — Does this plan introduce any of these code paths?
   - New outbound email send → must call `evaluate('email.send_attempt', payload, 'prod')`
   - New deploy step or CI workflow change → must include structural gates check
   - New checkout/payment init → must call `evaluate('checkout.init', payload, 'prod')`
   - Any AI/model routing changes → confirm Groq is not referenced (`deploy-no-groq-in-prod`)

2. **Rule autonomy level awareness** — Note each applicable rule's current level:
   - `simulate` → fires but no action. Plan may proceed; flag it.
   - `auto_safe` → **will block** if condition met. Plan must comply.
   - `auto_guarded` → **executes with guardrails**. Plan must account for this behavior.
   - `human_review` → **escalates to Nick**. Document in rollback/risk section.

3. **Compliance gaps** — Does the plan trigger a blocking rule?
   - Sending email without `email_validations` check → blocked by `email-validate-before-send`
   - Referencing `groq` in prod file → deploy blocked by `deploy-no-groq-in-prod`
   - `structural_gates_passed = false` on deploy → rollback by `deploy-structural-gates-required`

**If GAPS FOUND:** Stop. Surface each gap to Nick with fix options. Do NOT proceed to DRAFT until resolved or Nick explicitly accepts the risk.

### Step 3e: Conflict Report

Present a clean summary before proceeding to DRAFT:

```
## Conflict & Blast Radius Analysis

### Schema Impact
- Tables touched: {list}
- New tables: {list or "none"}
- Schema risk: LOW | MEDIUM | HIGH
- {any flags from 3a}

### File Collisions
- In-flight items sharing files: {list or "none"}
- {any collision details from 3b}

### Plan Overlap
- Related existing plans: {list or "none"}
- {any overlap flags from 3c}

### Blast Radius
- Direct files: {N}
- Blast radius files: {N}
- Critical paths touched: {list or "none"}
- Recommended: {gate item? phased rollout? standard?}

### Architecture Notes
- Dead code near scope: {list or "none"}
- Pattern compliance: {OK / flags}

### Rule Ledger Compliance
- Applicable rules: {rule_key + autonomy_level for each, or "none"}
- New evaluator hooks required: {list or "none"}
- Compliance gaps found: {list or "none"}
- Rule Ledger Verdict: COMPLIANT | GAPS FOUND (must resolve before draft)

### Verdict: CLEAR TO DRAFT | CONFLICTS NEED RESOLUTION
```

**If verdict is CONFLICTS NEED RESOLUTION:**
- Stop and surface each conflict to Nick with options
- Do NOT proceed to DRAFT until Nick resolves or acknowledges each conflict
- Record Nick's decisions as constraints for Phase 4

**If verdict is CLEAR TO DRAFT:**
- Include the conflict report as a section in the packet (for downstream review — Grok in Mode 1/2, plan_rule_checker.py in Mode 3)
- Proceed to Phase 4

---

## Phase 4: DRAFT — Write the Intent-Based Dispatch Packet

**Goal:** Produce a complete, Grok-reviewable dispatch packet at `scceo-1/plans/{slug}.md`. The packet specifies the "What" and the "Test", leaving the "How" to the executing agent.

### The 4-Script Automation Pipeline

We now use a Python automation pipeline to automatically assemble and cross-reference the Intent Documents. Execute the following scripts in order:

1. **`auto_planner.py`** — Generates the base draft outline from ledger metadata and available context packs.
   ```bash
   python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/auto_planner.py --batch 50
   ```
2. **`draft_auto_fill.py`** — Automatically populates the plan layout and specific verification sections based on the Item Type template logic.
   ```bash
   python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/draft_auto_fill.py
   ```
3. **`done_criteria_generator.py`** — Injects the cascading Done Criteria (evidence rules) mapped from North Star Objectives, Item Types, and Repo constraints.
   ```bash
   python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/done_criteria_generator.py --backfill-drafts
   ```
4. **`draft_qa_validator.py`** — Enforces the 3 Outcome Gates and guarantees every generated plan has substantive criteria before grading them.
   ```bash
   python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/draft_qa_validator.py
   ```

**If the verdict is ✅ PASS:**
- The automatically generated document at `scceo-1/plans/{slug}.md` is fully dispatch-ready.
- Proceed directly to Phase 6. Do not run Phase 5 Grok Loop.

**If the verdict is ⚠️ WARN or ❌ FAIL:**
- Open the draft packet and manually address the flagged issues (e.g., missing NSO objective, lack of specific verifiable steps). 
- You MUST run the `make-a-plan` skill to manually enrich the packet or ask Nick for context before sending to Jules.
- Run `draft_qa_validator.py` again until it passes.

---

## Phase 5: HARDEN — Grok Review Loop
### ⚠️ Modes 1 & 2 ONLY. Mode 3 (Cloud-First Jules Planning Loop) NEVER runs Phase 5 — its review gate is Phase JL-3 (plan_rule_checker.py + local Antigravity polish). Do NOT make a Grok API call in the Jules loop path.

**Goal:** Run the Grok Plan Loop reviewer-only protocol until the plan hits 100% APPROVED.

### Protocol (inline from grok-plan-loop):

1. **Submit plan to Grok** for review against Acceptance Standard v2 (Gates 1-10):

   | Gate | Check |
   |------|-------|
   | 1 | Appendix Schema Completeness |
   | 2 | Dependency Graph / Order Integrity |
   | 3 | Clear Goal Criteria |
   | 4 | Verification / Testability Focus |
   | 5 | Minimal Imperative Steps |
   | 6 | Dispatched/Built Items Have Linked Task Cards |
   | 7 | Reconciliation Cycles Must Show Progress |
   | 8 | Validation Gates Are Unambiguous |
   | 9 | Context Adequately Restricts Blast Radius |
   | 10 | Rule Ledger Compliance Documented |

2. **Grok is reviewer-only** — never plan author. Send plan as context, ask for JSON verdict.

3. **Grok review prompt:**

```
You are reviewing an engineering execution plan. Evaluate it against these 10 gates.

Return JSON:
{
  "decision": "ACCEPTED" | "REJECTED",
  "approval_phrase": "100% APPROVED" | null,
  "gates": {
    "1": {"pass": true/false, "citation": "...", "fix": "..."},
    ...
  },
  "fail_count": N,
  "summary": "..."
}

PLAN:
{full plan text}
```

4. **For each FAIL gate:** patch only the cited section, append reconciliation cycle with citations.
   - If Gate 9 fails: simplify wave structure before rerun.

5. **Rerun** until `decision = ACCEPTED` and `approval_phrase = 100% APPROVED`.

6. **Max cycles:** 8 (default). If cycle cap hit without 100%:
   - Return top remaining FAIL gates with citations
   - Return smallest patch plan
   - Do NOT claim readiness

7. **Save review artifact:** `scceo-1/plans/{slug}.review.json`

8. **Update plan status:** Change header from `Draft — pending Grok review` to `Approved — Grok 100% APPROVED (N cycles)`

---

## Phase 6: TRACK — Persist Artifacts + Ledger Linking

**Goal:** Store deep-plan artifacts and make each item traceable. No dispatch/orchestrator calls in this skill.

### Step 6a: Link Approved Packet to Existing Ledger Item

For each source item (`Source Item: {id}`), update that existing ledger item with packet links and review metadata:

```python
{
  "links": {
    "deep_plan_path": "scceo-1/plans/{slug}.md",
    "deep_plan_review_path": "scceo-1/plans/{slug}.review.json",
    "repo_plan_path": "{repo}/plans/{item-id}.md"
  },
  "orchestration": {
    "attention_reason": "dispatch_packet_ready_for_send_to_jules",
    "awaiting_human": true
  }
}
```

Add a note:
- `[plan-and-prioritize] Intent dispatch packet approved and stored; ready for Send-to-Jules handoff.`

### Step 6b: Store Packet in Repo

Copy the approved packet to the target repo `plans/` directory with source item ID filename:

```bash
mkdir -p {REPO_PATH}/plans
cp /Users/nicholaspetros/scceo-1/plans/{slug}.md {REPO_PATH}/plans/{item-id}.md
```

This repo-local file is the canonical task card for downstream Send-to-Jules.

### Step 6c: Build Handoff Package (No Send)

Emit per-item handoff payload (JSON) but do not send:
- `repo`
- `item_id`
- `objective_ids`
- `plan_path`
- `repo_plan_path`
- `review_path`
- `verification_checks`

---

## Phase 7: CONFIRM — Summary Card

Present this summary to Nick:

```
## Intent-Based Dispatch Preparation Complete

**Feature:** {title}
**Source Item ID:** {item-id}
**Repo:** {repo}
**Priority:** P{N}
**Objective:** {OBJ-XXX-NNN}
**Grok Status:** 100% APPROVED ({N} cycles)

### Artifacts
- Packet: `scceo-1/plans/{slug}.md`
- Review: `scceo-1/plans/{slug}.review.json`
- Repo task card: `{repo}/plans/{item-id}.md`
- Ledger: source item updated with packet links + ready-for-send-to-jules note

### Next Step
Use **Send-to-Jules** flow to transmit this approved execution packet.
```

---

## Batch Mode Output (Top-20 Mode)

When in Top-20 Batch Mode, end with this additional summary:

```
## Top-20 Batch Planning Complete (Deep Authoring)

**Repo Scope:** {repo or cross-repo}
**Candidates:** {N}
**Selected (Top 20%):** {M}

### Ranked Selection
- {item-id} — {title} — score {0.00} — objectives {OBJ-...}
- ...

### Generated Plans
- {item-id}: scceo-1/plans/{slug}.md
- ...

### Send-to-Jules Handoff Package
- Ready (not sent): {item-id list}
- Package paths: {batch handoff json path}
```

---

## Non-Negotiable Rules

1. **Never skip Phase 1.** Requirements must be explicit — not assumed from context.
2. **Never skip Phase 2b.** Every plan maps to an objective. No exceptions.
3. **Never skip Phase 3 for major features.** Conflict & blast radius analysis catches collisions, schema drift, and architectural misfit BEFORE we invest cycles drafting. The only skip is via the quick-fix escape hatch (small scope, Nick agrees).
4. **If Phase 3 verdict is CONFLICTS NEED RESOLUTION — STOP.** Surface every conflict to Nick with options. Do NOT proceed to DRAFT until Nick resolves or acknowledges each conflict.
5. **Never mark an item handoff-ready without 100% APPROVED** (unless quick-fix escape hatch was agreed).
6. **Packets always go to TWO places:** `scceo-1/plans/` AND repo `plans/`.
7. **Do not create new ledger items in this skill.** Update source items with packet links + ready-for-send-to-jules metadata.
8. **Never call Send-to-Jules or Send-to-Antigravity (legacy `dispatch_agent`) from this skill.** Preparation only.
9. **Context gatherer failures are non-blocking.** No codebase_map = proceed without auto-context, flag it.
10. **Grok is reviewer-only.** The packet is authored by Kai, reviewed by Grok. Never let Grok rewrite the packet.
11. **If Nick says stop or changes direction mid-flow:** stop immediately. Save current state as a note. Don't push to finish.
12. **The approved packet IS the task card.** Don't generate a separate task prompt. The packet file copied to the repo is what Send-to-Jules executes from.
13. **Top-20 mode must run objective mapping before selection.** Unmapped items are excluded unless Nick explicitly overrides.
14. **Top-20 mode ranking must be deterministic.** Use the weighted leverage formula and strict tie-breakers — no ad-hoc ranking.
15. **Top-20 selection always requires confirmation before drafting.** Show selected IDs and paths first.
16. **Send-to-Jules is a separate step.** This skill ends at handoff package creation.
17. **The Work Ledger is the canonical execution-status source of truth.** Plans, issues, PRs, and Jules sessions are supporting artifacts only.
18. **Never fresh-plan an item already marked `built`, `verification_submitted`, or `verified`** unless Nick explicitly instructs a reopen/remediation flow.
19. **If an item has completed Jules evidence or an open PR, default it to verification/reconcile lane** rather than implementation lane.
20. **Always collapse duplicates before ranking.** `AUTO-CONFLICT-*`, `[TEST]`, and same-scope duplicates must be excluded or mapped to a canonical parent.
21. **Repo correction is mandatory before final selection.** If the item domain and current repo disagree, surface it and correct/acknowledge before authoring.
22. **Do Not Send Stubs to Jules:** Jules is for execution. Always equip Jules with rich context, clear goals, and ironclad validation gates before executing Path B dispatch. Handoffs must contain full context.
23. **Always Run Local Polish Before Execution:** Even if creating a batch of packets, they must pass local rule-gated structural and company policy checks and get marked 100% APPROVED before handoff to the Send-to-Jules skill.
24. **Output Verifiable Dispatch Packets:** When wrapping a batch authoring session, the output must be explicit paths to the intent packets, plus the actual execution dispatch packet payloads. Do not just say "packets created".
25. **One-Way Execution Trip:** Jules receives execution packets and returns PRs/evidence. Jules does not return drafts. If a goal needs changing, change it locally.
26. **Never plan a new email send path without `evaluate('email.send_attempt')` in the implementation.** Any new code path that sends outbound email must include the evaluator call. The `## Rule Compliance` section must list `email-validate-before-send` and describe where the hook lives.
27. **Never plan a deploy step without structural gates verification in validation gates.** If the plan includes a deploy, merge to main, or CI workflow change, at least one validation gate must be: `[ ] structural-gates.sh passes (or equivalent) — verified before merge`
28. **Never plan work in email, deploy, or payments domains without surfacing applicable rule keys and their current `autonomy_level`.** Simulate-level rules must still be documented — they will be promoted. Planning around a simulate rule now prevents a surprise block later.
29. **Confirmed duplicates must not remain active queue items.** Once duplicate scope is confirmed, set the duplicate item's status to `duplicate` or `archived_duplicate`, link `links.canonical_item_id`, add a note, and exclude it from all future prioritization passes.
30. **Never dispatch work unmapped from a North Star.** Every selected item must declare which NSO (NSO-01 through NSO-06) it advances before planning begins. No mapping = excluded from batch. Nick can override with `objective_override=true` + written rationale logged in the ledger. Rule: `ops-objective-alignment-required`
31. **Never design a plan that adds a human approval step mid-execution.** Human gates are only valid at the final publish/deploy step. If a plan requires Nick to approve something mid-flow (not at the gate), flag it and redesign before dispatching. Rule: `ops-no-human-mid-execution`
