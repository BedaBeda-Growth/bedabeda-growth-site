---
name: "Conveyor Item"
description: "Execute ONE work item end-to-end: read plan → branch → code → test → self-reflect → PR → report status via sidecar. Stateless, single-shot."
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
---

# Conveyor Item — Single-Shot Execution Skill

## Trigger Phrases
- "run conveyor", "execute item", "conveyor-item", "work this item"

## What This Skill Does

You are executing ONE work item from the conveyor queue. This is a single-shot task — you handle one item, report your result, and you're done. Another agent instance handles the next item.

Your job:
```
1. READ    — Read the task prompt and acceptance criteria
2. PLAN    — Build implementation plan from task context
3. BRANCH  — git checkout -b conveyor/{id} from latest main
4. EXECUTE — Do the actual coding work
5. TEST    — Run repo-local quick tests
6. REFLECT — Self-assess against acceptance criteria (9/10 bar)
7. COMMIT  — git add + commit with structured message
8. PUSH    — git push origin conveyor/{id}
9. PR      — Create PR via gh CLI
10. FEED   — Append status to conveyor-status.jsonl (sidecar)
```

## Objective Alignment (Mandatory)
Before implementation work begins:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Confirm this item maps to at least one objective ID
- If unmapped, pause and ask: **"What's the objective here?"**
- Confirm acceptance criteria include objective-level verification (not only code-level checks)
- If this introduces a net-new durable objective, append it to `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES_LOG.md` as `proposed`

## Prerequisites

Before starting, verify:
- [ ] The task prompt (this file or referenced `plans/{id}.md`) contains clear acceptance criteria
- [ ] `gh` CLI is authenticated (`gh auth status`)
- [ ] Git remote is configured and SSH keys work (`git remote -v`)
- [ ] You know the item ID (provided in the task prompt header)

If any prerequisite fails, write `status: blocked` to the sidecar and stop.

## Step 0: Hygiene Cleanup

Run the session cleaner before starting heavy work to keep resources free:

```bash
python3 /Users/nicholaspetros/scceo-1/.runtime/ag_session_cleaner.py --execute --hours 6
```

## Step 1: READ

Read the full task prompt provided in this dispatch file. It includes:
- **Item ID** — the work ledger identifier (e.g., `pri-114`)
- **Task description** — what needs to be done
- **Acceptance criteria** — the specific, verifiable conditions for "done"
- **Files to read first** — context files to understand before coding

Read all referenced context files before proceeding.

## Step 2: PLAN

Before writing any code, plan your approach:
1. List the files you'll need to modify or create
2. Identify any dependencies or ordering constraints
3. Estimate if this is a 1-file or multi-file change
4. Note any edge cases from the acceptance criteria

Write your plan as a comment in your first commit, not as a separate file.

## Step 3: BRANCH

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b conveyor/{ITEM_ID}
```

Rules:
- Always branch from latest `main`
- Branch name format: `conveyor/{item-id}` (e.g., `conveyor/pri-114`)
- **Never** branch from staging, production, or any other branch
- If `main` has conflicts or is dirty, write `status: blocked` to sidecar and stop

## Step 4: EXECUTE

Do the actual coding work described in the task prompt.

Rules:
- Follow existing code patterns and conventions in the repo
- Read neighboring files to understand style before writing
- Don't introduce new dependencies unless explicitly required
- Keep changes scoped to what the task asks for — no drive-by refactors
- If you're unsure about an approach, choose the simpler one

## Step 5: TEST

Run the repo's quick test suite before committing.

Test command priority (try in order, use first that exists):
1. Check if repo has a `ci-gates` skill in `skills/` — use its `quick` mode commands
2. `npm run test:unit:critical` (if exists)
3. `npx tsc --noEmit` (TypeScript repos)
4. `python3 -m pytest tests/ -q --tb=short` (Python repos)
5. `npm test` (generic)
6. If no test infrastructure exists, do a manual sanity check: does the app build? do the changed files parse?

If tests fail:
1. Read the failure output carefully
2. Fix the failing tests (if your code caused the failure)
3. Re-run tests
4. If tests still fail after one fix attempt, proceed to REFLECT with lower confidence

## Step 5.5: FUNCTIONALITY SMOKE TEST (MANDATORY for rocket/app/rv)

If the item is user-facing (repo = `rocket`, `app`, `rv`):

1. **Start the dev server** (if not already running): `npm run dev` or equivalent
2. **Identify the relevant URL/page** from the task prompt's acceptance criteria
3. **Hit the endpoint** — either via `curl`, browser tool, or HTTP client
4. **Check:**
   - Does the page load? (HTTP 200, not error page)
   - Is the feature visible / functional? (key elements present)
   - Does the change appear in the rendered output?
5. **Record the result:**
   - `smoke_test: PASS` — feature works as expected
   - `smoke_test: FAIL` — feature broken, invisible, or erroring
   - `smoke_test: SKIP` — no URL determinable (flag in sidecar)

**Confidence caps based on smoke test result:**
- `PASS` → no cap, proceed normally
- `FAIL` → confidence capped at **4/10** maximum, regardless of unit test results
- `SKIP` → confidence capped at **6/10** maximum, flagged as `needs_manual_verification`

**Valid SKIP conditions (explicit exemptions):**
- Item is backend-only (no UI surface): API endpoint, database migration, cron job, edge function with no page-level effect → exempt from smoke test
- Item repo is `scceo` or `spark-kanban` (not user-facing by default) → exempt

**SKIP is NOT valid when:**
- Item is in `rocket`, `app`, or `rv` AND has any UI acceptance criterion → this is a **plan authoring failure**: the plan should have specified the smoke test URL in the AC. Mark the item BLOCKED and flag the plan for revision. Do NOT silently cap confidence.

Rule: `ops-live-functionality-required`

If the item is NOT user-facing (repo = `scceo`, `spark-kanban`), this step is optional but recommended.

## Step 6: REFLECT (Confidence Gate — 9/10 Bar)

This is the quality gate. Before committing, self-assess against EVERY acceptance criterion:

1. Re-read the acceptance criteria from the original task prompt
2. **Apply smoke test cap** (from Step 5.5) — if a cap is active, no criterion can score above it
3. For each criterion, rate your confidence 1-10:
   - **10** — Absolutely certain this is met, I can prove it
   - **9** — Very confident, implementation is solid and tested
   - **8** — Probably right but there's a minor uncertainty
   - **7 or below** — Not confident, something might be wrong
   - **If user-facing AND no smoke test ran** → max score per criterion is 6
   - **If user-facing AND smoke test failed** → max score per criterion is 4

3. Calculate your **overall confidence** (lowest individual score)

4. **If overall confidence ≥ 9:** Proceed to COMMIT. You're shipping.

5. **If overall confidence < 9:** RETRY ONCE.
   - Identify which criteria scored low and why
   - Adjust your implementation to address the gaps
   - Re-run tests
   - Re-assess confidence
   - If still < 9 after retry: commit anyway, but mark `confidence` in sidecar as the actual score and add `"low_confidence": true`

**Max 1 retry. Never more.** Ship what you have and flag it honestly.

## Step 7: COMMIT

```bash
git add -A
git commit -m "[Conveyor] {ITEM_TITLE}

Item: {ITEM_ID}
Confidence: {SCORE}/10
Changes: {1-line summary of what changed}

Acceptance criteria:
- [x] Criterion 1 (confidence: X/10)
- [x] Criterion 2 (confidence: X/10)
- [ ] Criterion 3 (confidence: X/10) — {reason if not met}"
```

Rules:
- Commit message must include item ID, confidence score, and per-criterion assessment
- Use `[x]` for criteria you're confident about, `[ ]` for uncertain ones
- Never amend or squash — one clean commit per item

## Step 8: PUSH

```bash
git push origin conveyor/{ITEM_ID}
```

If push fails:
- Check if branch already exists on remote (`git ls-remote`)
- If auth failure: write `status: blocked, reason: git_push_auth_failed` to sidecar
- Never force-push

## Step 8.5: GATHER PROOF (GOLD-TIER GATES)

Before opening a PR, you MUST gather the exact Proof Mechanisms defined in the plan's Acceptance Criteria.
If the plan asks for a test run, you MUST run it and capture the raw green terminal output.
If the plan asks for a UI change, you MUST include a screenshot or Playwright trace.
**Prose claims like "Tests pass" or "I verified it" without actual output log/screenshot are automatically REJECTED by `verify-work`.**

## Step 9: PR

Create a pull request using `gh` CLI. You MUST embed the gathered proof directly in the PR body.

```bash
gh pr create \
  --title "[Conveyor] {ITEM_TITLE}" \
  --body "## Item: {ITEM_ID}
## Confidence: {SCORE}/10

### What Changed
{Summary of changes}

### Acceptance Criteria & Proof
{Per-criterion assessment with confidence scores}

**PROOF LOGS:**
\`\`\`
{PASTE YOUR RAW TERMINAL OUTPUT / TEST LOGS HERE}
\`\`\`

### Plan Reference
See \`plans/{ITEM_ID}.md\` for full task context.

---
*Auto-generated by Conveyor system*" \
  --base main \
  --label conveyor \
  --label automated
```

Rules:
- PR always targets `main` (human can re-target during review)
- Title format: `[Conveyor] {item title}`
- Body must include confidence score and per-criterion breakdown
- Add labels `conveyor` and `automated`
- If `gh pr create` fails (labels don't exist, etc.), try without labels

Capture the PR URL from the output — you need it for the sidecar.

## Step 10: FEED (Sidecar Status Update)

Append exactly ONE line to `conveyor-status.jsonl` in the **repo root**:

```bash
echo '{"id":"{ITEM_ID}","status":"pr_open","confidence":{SCORE},"pr_url":"{PR_URL}","summary":"{1-LINE SUMMARY}","at":"{ISO_TIMESTAMP}"}' >> conveyor-status.jsonl
```

Valid status values:
| Status | Meaning |
|--------|---------|
| `started` | Agent picked up the item |
| `executing` | Coding in progress |
| `built` | Code done, tests pass, PR not yet created |
| `pr_open` | PR created and pushed (happy path) |
| `failed` | Tests failed or code doesn't work |
| `blocked` | Can't proceed (auth, merge conflict, missing context) |

If low confidence (< 9 after retry):
```json
{"id":"pri-114","status":"pr_open","confidence":7,"low_confidence":true,"pr_url":"...","summary":"...","retry_reason":"...","at":"..."}
```

**CRITICAL:** Never edit `work-ledger.md`. The sidecar is the ONLY place you write status. It's append-only — no merge conflicts possible.

## Error Handling

| Situation | Action |
|-----------|--------|
| Can't find task prompt | `status: blocked`, reason: `missing_plan` |
| Git branch fails | `status: blocked`, reason: `git_branch_failed` |
| Tests fail after fix attempt | `status: failed`, include test output snippet |
| PR creation fails | `status: built` (code is done, PR is manual) |
| Git push fails | `status: blocked`, reason: `push_failed` |
| Context too large to understand | `status: blocked`, reason: `context_overflow` |
| Acceptance criteria unclear | Make best effort, flag low confidence, proceed |

## Non-Negotiable Rules

1. **Never force-push.** Ever.
2. **Never commit to main or production directly.** Always branch.
3. **Never edit work-ledger.md.** Use `conveyor-status.jsonl` sidecar only.
4. **Always run tests before pushing.** No exceptions.
5. **One branch per item, one PR per item.** No batching.
6. **Max 1 self-reflection retry.** Ship and flag, don't loop forever.
7. **Honest confidence scores.** A 9 means 9. Don't inflate.
8. **Scope discipline.** Do what the task asks. No drive-by refactors, no bonus features.

## Item Type Filter

This skill processes any item that involves building or writing code:
- ✅ Engineering, product, infrastructure, automation, tooling
- ✅ Product tasks from the team (building features, fixing bugs, improving UX)
- ✅ Business process automation (building generators, engines, bots)
- ❌ Pure marketing content creation with zero code component

If you receive a pure content task (no code involved), write `status: blocked, reason: not_buildable` to sidecar.

## Completion

After Step 10, you're done. Report to the agent runtime:
- Item ID
- Final status (pr_open / built / failed / blocked)
- PR URL (if created)
- Confidence score
- 1-line summary

The morning-dispatch and evening-review workflows handle everything from here.
