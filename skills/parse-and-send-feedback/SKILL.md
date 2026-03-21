---
name: "Parse and Send Feedback"
description: "Shred a feedback doc into isolated Objective Documents, dispatch each to a fresh headless AG background worker in sequence, and surface failures to Nick. Zero context bleed between items."
alwaysAllow:
  - Read
  - Write
  - Bash
ruleDomains:
  - ops
---

# Parse and Send Feedback

Use this skill whenever:
- Nick pastes a block of feedback, QA notes, bug reports, or client notes
- Nick says "parse this", "break this down and dispatch", "send this feedback through", "shred this"
- A batch of sequential tasks needs to run without context bleeding into each other

---

## What This Skill Does

Takes a raw feedback block → shreds it into isolated Objective Documents → dispatches each one as a fresh **headless AG background worker** → reports pass/fail + next actions.

Each worker:
- Gets a completely fresh context window (zero bleed from previous tasks)
- Executes a single intent with explicit proof gates
- Writes pass/fail + evidence to the message bus
- Returns control to this skill before the next item runs

Nick sees it as: sequential to-do items, each handled cleanly in isolation.

---

## Strict Sequence (never skip)

```
1 → PARSE     — Extract discrete items from the feedback block
2 → CLASSIFY  — Tag each item: code / content / config / QA-rule-only
3 → SHRED     — Write one Objective Document per buildable item
4 → CONFIRM   — Show Nick the dispatch queue, get approval
5 → DISPATCH  — Loop: dispatch → wait → verify → next
6 → REPORT    — Surface pass/fail/blocked per item
```

---

## Step 1 — PARSE

Extract every discrete action item from the feedback block. Rules:
- One item per clear, testable outcome. Do NOT combine unrelated changes.
- If an item is vague ("make it better") → mark as `needs_clarification`, surface to Nick and skip until clarified.
- If an item is a pure QA rule with no code change (e.g., "this font should always be X") → tag `qa-rule-only`, add to `qa-rules.json`, skip dispatch.
- If an item is a content edit with zero logic change → tag `content-only`, can send directly or batch.

Output format:
```
PARSED ITEMS:
1. [code]       Fix the checkout flow bug where GCash fails silently  (rocket)
2. [content]    Update the hero headline to "Join the best..."        (rv)
3. [qa-rule]    Footer links must not wrap to 2 lines on mobile       (rv)
4. [unclear]    "Make onboarding smoother" — needs clarification
```

---

## Step 2 — CLASSIFY

For each parsed item, tag:
- `[code]`       — requires a code/config/migration change → goes to headless dispatch
- `[content]`    — text/copy edit only → can batch or dispatch
- `[qa-rule]`    — write to `qa-rules.json` in the target repo, no dispatch needed
- `[unclear]`    — surface to Nick, pause on this item until clarified

---

## Step 3 — SHRED (Objective Document per item)

For each `[code]` or `[content]` item, create one Objective Document in `~/scceo-1/objectives/feedback-{YYYYMMDD}-{N}.md`:

```markdown
# Objective: {short title}
**ID:** FEEDBACK-{YYYYMMDD}-{N}
**Source:** Feedback block (parse-and-send-feedback dispatch)
**Repo:** {repo}
**Date:** {date}

## What Nick Said (Verbatim)
"{exact feedback text for this item}"

## What This Means In Our System
- Repo: {repo}
- File(s) likely affected: {if known}
- Existing thing this changes: {component / page / endpoint}

## User Capability Test
Nick opens {exact URL or interface}, does {action}, sees {result}.

## Definition of Done (Nick runs this himself)
- [ ] {specific, actionable test step 1}
- [ ] {specific, actionable test step 2}
- [ ] Previous functionality unchanged

## What This Is NOT
- ❌ Not a refactor of other components
- ❌ Not a scope expansion (scope-creep guardrail)

## Acceptance Criteria & Proof Mechanisms
- [ ] {Criterion 1}
  **Proof:** {exact command / screenshot / curl / DB query}
- [ ] {Criterion 2}
  **Proof:** {exact measurable proof}

## Dispatch Prompt (sent verbatim to headless worker)
{Auto-generated prompt to send to claude -p. Must include:
  - exact repo
  - exact task
  - explicit acceptance criteria
  - proof requirement (worker must gather and include proof in PR body)
  - message bus write instruction}
```

---

## Step 4 — CONFIRM

Before dispatching anything, show Nick the full queue:

```
DISPATCH QUEUE — Parse and Send Feedback
──────────────────────────────────────────
Ready to dispatch (headless AG):
  1. [FEEDBACK-20260317-1]  rocket   Fix GCash silent failure
  2. [FEEDBACK-20260317-2]  rv       Update hero headline

QA rules (no dispatch — writing to qa-rules.json):
  3. [FEEDBACK-20260317-3]  rv       Footer links must not wrap

Skipped (needs clarification):
  4. "Make onboarding smoother" — please clarify before I can dispatch

Budget: ~{N} AG sessions. Estimated time: {N} min sequential.
Approve dispatch? (yes / skip N / clarify N)
```

Do NOT dispatch until Nick approves.

---

## Step 5 — DISPATCH LOOP

For each approved item, run sequentially:

```python
for item in approved_items:
    # 1. Write the Objective Document (Step 3 above)
    write_objective_doc(item)
    
    # 2. Dispatch to headless AG
    dispatch_agent(
        repo=item.repo,
        prompt=item.dispatch_prompt,    # includes proof requirement
        background=False                # WAIT for completion before next
    )
    
    # 3. Read result from message bus
    result = read_message_bus(item.repo)
    
    # 4. Verify proof gates passed
    if result.status == "completed" and proof_gates_met(result):
        mark_done(item)
        print(f"✅ {item.id} — {result.summary}")
        continue_to_next()
    else:
        mark_blocked(item)
        surface_to_nick(item, result)
        pause_pipeline()   # STOP and wait for Nick before continuing
```

**Critical rules:**
- Run items **sequentially, never parallel** — each result must be verified before the next starts
- If a worker fails or doesn't meet proof gates → **surface immediately, stop the loop**
- Never silence a failure and continue. Nick must approve resuming after a failure.
- Each worker gets a brand-new context. Do NOT pass prior results into the next worker's prompt.

---

## Step 6 — REPORT

When all items have run (or the pipeline is paused), output:

```
DISPATCH COMPLETE — Parse and Send Feedback
──────────────────────────────────────────
✅ PASSED (2/4):
  FEEDBACK-20260317-1  rocket  Fix GCash silent failure
    → PR: {url}, Proof: test logs attached in PR body
  FEEDBACK-20260317-2  rv      Update hero headline
    → PR: {url}, Proof: screenshot in PR body

⚠️  NEEDS REVIEW (1/4):
  FEEDBACK-20260317-3  rocket  Auth flow change
    → Worker completed but proof gates not met: "No test output found in PR body"
    → Action required: Review PR and ask worker to add proof

⏭️  SKIPPED (1/4):
  FEEDBACK-20260317-4  "Make onboarding smoother" — awaiting clarification

QA Rules added: 1 entry added to rv/qa-rules.json
```

---

## Proof Gate Requirements

A worker is considered **passing** only if its PR body contains:
- At minimum one of: raw terminal output, curl response, screenshot, DB query result
- Explicit confirmation of each acceptance criterion with pass/fail
- No phrases like "Tests pass" or "I verified it" without attached raw output

These are enforced by the `review-work` skill. If a worker just prose-claims success → it fails the proof gate.

---

## Non-Negotiable Rules

1. **Never dispatch without Nick's approval of the queue.** Ever.
2. **Never run items in parallel** — sequential only, each verified before next.
3. **Never swallow a failure.** Surface it immediately and pause the pipeline.
4. **Always write the Objective Document first.** You cannot dispatch a naked prompt.
5. **Max 10 items per session.** If there are more, batch into multiple sessions with Nick's approval.
6. **Respect the headless AG concurrency limit** — max 2 workers running at once across the whole system. Check with `python3 kai_orchestrator.py --status` before dispatching.

---

## Related Docs and Skills

- `docs/how-to-use-headless-ag.md` — Full walkthrough of the headless AG architecture
- `[skill:send-to-antigravity]` — Single dispatch, no loop
- `[skill:make-a-plan]` — Same Objective Document format used here per item
- `[skill:review-work]` — Proof gate validator used after each worker completes
- `[skill:ingest-feedback]` — Companion: adds QA rules from feedback without dispatching code
