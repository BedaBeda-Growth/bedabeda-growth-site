---
name: "Prefer Python Over LLM"
description: "Evaluates whether a task should be a Python script instead of an LLM skill call. Use when creating a new skill, reviewing existing skills for automation candidates, asking 'could this be a script?', 'is this worth automating?', or performing an automation check. Also fires during skill invocation review to surface LLM-vs-script replacement opportunities. Rule: ops-prefer-python-over-llm."
ruleDomains:
  - ops
---

# Prefer Python Over LLM

Enforce the rule: **never use an LLM for something a deterministic Python script can do.**

## Decision Tree

Run this check whenever creating a new skill or reviewing an existing one:

```
Does the task require natural language understanding, synthesis, or judgment?
  YES → LLM skill is justified. State why in description frontmatter.
  NO  ↓

Is the task deterministic (query, file op, API call, validation, calculation, comparison)?
  YES → Python script. STOP. Build a script instead.
  NO  ↓

Will this run repeatedly with predictable inputs and outputs?
  YES → Python script. STOP.
  NO  → LLM skill may be acceptable. Document reasoning.
```

## Quick Classification

Run `scripts/classify_task.py` for a fast heuristic check:

```bash
python3 ~/.agents/skills/prefer-python-over-llm/scripts/classify_task.py "task description here"
```

Returns: `SCRIPTABLE` or `LLM_JUSTIFIED` with reasoning.

## If Python Candidate

1. Recommend a script location: `{repo}/scripts/` or a bundled `scripts/` inside the skill
2. Log the signal to Supabase:
```python
# Via psql or python — log to rule_ledger.skill_usage
INSERT INTO rule_ledger.skill_usage (skill_slug, session_id, trigger_source, result, python_candidate, notes)
VALUES ('{slug}', '{session}', 'kai-agent', 'deferred', true, 'Flagged as Python automation candidate');
```
3. Ask Nick: "**This looks scriptable** — should we build a Python function in `[repo]` instead of keeping this as an LLM skill?"

## If LLM Justified

State the reason in the skill's `description` frontmatter. Example: "Requires judgment about tone, context, or ambiguous inputs."

## Reviewing Existing Skills

To find the highest-priority automation candidates:

```sql
-- Run via psql $RULES_DATABASE_URL
SELECT * FROM rule_ledger.skill_heat_map ORDER BY invocations_7d DESC LIMIT 10;
```

High-invocation + `python_candidate_hits > 0` = top replacement target.

## Logging Skill Invocations

Every skill should log a row to `rule_ledger.skill_usage` at invocation time. Minimal row:

```sql
INSERT INTO rule_ledger.skill_usage (skill_slug, session_id, trigger_source, result)
VALUES ('{slug}', '{session_id}', 'kai-agent', 'completed');
```

Use `python_candidate = true` when the task was flagged during execution as scriptable.