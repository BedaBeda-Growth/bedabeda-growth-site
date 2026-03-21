# Rule Alignment Convention

**Date:** 2026-03-11

This document outlines the standard for aligning skills with the rules system. Following these conventions ensures that our skills respect established guardrails without incurring the high token cost of reading the entire rule ledger every time a skill is invoked.

---

## 1. The `ruleDomains` Convention

Every skill that touches a rule-relevant domain must declare it in the YAML frontmatter under `ruleDomains`. This serves as a lightweight tag for static analysis via `skill_grader.py`.

### Available Domains
- `ops` — work ledger, priority handling, incident response
- `deploy` — deploys, structural gates, blast radius
- `email` — send, validate, bounce rate
- `payments` — checkout, cart, retry, GCash
- `growth` — signup, referral, outreach, leader activation
- `identity` — auth, validation

### When to Declare
Declare **only** what the skill actually touches. Most skills will declare 1 or 2 domains.
If your skill is purely informational (like `status-snapshot` or `list-rules`), you may optionally use `ops`.

**Example:**
```yaml
---
name: "Skill Name"
ruleDomains:
  - ops
  - payments
---
```

---

## 2. The Rule Gate Pattern

For **high-blast-radius skills** (especially those modifying `deploy` or `payments`, or executing high-severity `ops`), you must include a dynamic Rule Gate before any state mutation, dispatch, or action.

### When to Include
If your skill automates dispatches, pushes to production, or directly affects business revenue pathways, include the gate.

### Standard Template
Place this at the top of the execution section:

```markdown
## Rule Gate (run before acting)

Before dispatching, deploying, or mutating state, call:

\`\`\`
check_rule_hits(domain="<your-domain>", last_n=5)
\`\`\`

If any \`high\` or \`critical\` severity hits are active:
- Surface them to Nick before proceeding
- Do not suppress or skip — a recent hit means the system detected drift
- If the hit is expected and understood, note it and continue

This gate costs one MCP call. It prevents re-triggering known violations.
```

(Be sure to replace `<your-domain>` with the primary domain the skill operates in, e.g., `deploy` or `ops, payments`).

---

## 3. How `skill_grader.py` Uses These Fields

The `skill_grader.py` script cross-references Supabase `rule_ledger.rules` against `SKILL.md` content. It computes an alignment score prioritizing:
- Use of the `check_rule_hits` rule gate
- The explicitly declared domains in `ruleDomains`
- Keyword presence matching rule keys

When creating a new skill, adding the `ruleDomains` frontmatter and the Rule Gate (when applicable) ensures the skill passes the automated coverage audits.
