---
name: "Autonomous Verification Resolution"
description: "Drive PR and branch verification to resolution without using human review as a default fallback. Use when the goal is to verify code, docs, CI, schema, auth, payment, email, or infrastructure changes autonomously, repair stale or missing verification inline, batch PRs through CI and integration flows, and reserve human escalation only for deploy approval, explicit DO NOT MERGE holds, or clearly defined business/compliance exceptions."
ruleDomains:
  - ops
  - deploy
---

## Autonomous Execution Protocol

> **Autonomy Tier: FULL AUTO** — This skill runs without human intervention for verification and recovery work.

### Scope
- Use this skill to drive PRs, branch verification, and verification backlog resolution.
- Treat `clear-pipe` as the default autonomous verification lane.
- Do not use this skill for production deploys. Production push still requires `final-verify` plus explicit human approval.

### Prompt Guardrails
- Stay on the working branch or ephemeral worktree for the target repo.
- Do not push to production or remote databases without explicit approval.
- Do not run tests against production databases.
- Never switch to `main` or `production` unless the active skill explicitly allows it.
- Prefer deterministic repair: fix the failing selector, fixture, environment parity, or schema drift instead of escalating.
- If the main checkout is dirty, run in an ephemeral worktree and keep the primary checkout untouched.

---

# Autonomous Verification Resolution

## Core policy

Treat human review as a release authority, not as a generic verifier of code.

Do not escalate to human simply because a change touches:
- code
- documentation
- tests
- CI
- schema
- auth
- payments
- email
- monitoring
- infrastructure

If a domain is mechanically verifiable, verify it.
If verification coverage is missing or stale, repair or extend it.

## Required routing behavior

1. Use `verification-router` only for initial repo/context detection when needed.
2. Route built PRs, completed Jules sessions, and `verification_submitted` backlog into `clear-pipe` as the default autonomous verification lane.
3. Let `clear-pipe` delegate internally to `check-jules-status`, `jules-merge-verify`, `ci-full-verify`, and the coverage sweep.
4. Let Heartbeat auto-launch `clear-pipe` for repos with PR-linked verification backlog, including dirty repos via ephemeral worktrees.
5. Use `ci-verify` or `ci-full-verify` only when a repo-specific or explicitly requested path requires them.
6. Keep pushing verification toward a machine verdict without asking the user what to do next.
7. Use human escalation only for:
   - production deploy approval
   - explicit `DO NOT MERGE`
   - explicit business decision with no encoded acceptance criteria
   - compliance/security exception requiring named owner review

## Failure handling

If verification fails, classify the failure as one of:
- failing checks
- missing automation coverage
- infra flake
- explicit business hold
- deploy gate

Never output generic `needs human`.

## Coverage repair rules

When confidence is limited, prefer repairing one of these before escalating:
- Playwright selectors
- test fixtures / seeded accounts
- synthetic payment/auth/email flows
- policy checks
- smoke tests
- preview health monitors
- environment parity issues
- schema/setup drift

## Required verdicts

Use only:
- `VERIFIED`
- `BLOCKED – FAILING CHECKS`
- `BLOCKED – MISSING AUTOMATION COVERAGE`
- `HOLD – EXPLICIT BUSINESS DECISION REQUIRED`
- `DEPLOY-GATED – HUMAN APPROVAL REQUIRED`
- `DO NOT MERGE – EXPLICIT MANUAL HOLD`

## Required output

1. Repo / queue in scope
2. Verification path chosen
3. Checks run
4. Failures fixed or coverage added
5. Final verdict per PR / branch
6. Exact remaining blockers
7. Whether anything still truly requires human action

## Skill References

- [`clear-pipe`](../scceo-1/skills/clear-pipe/SKILL.md) for PR batching, integration verification, and verification handoff.
- [`cto-heartbeat`](../scceo-1/skills/cto-heartbeat/SKILL.md) for heartbeat dispatch, live status, and backlog advancement.
- [`push-to-prod`](../scceo-1/skills/push-to-prod/SKILL.md) for production deployment after `final-verify`.

## Escalation standard

Before escalating, explicitly state:
- why the issue is not mechanically verifiable yet
- what automation was attempted
- what exact missing coverage or business decision remains

If that cannot be stated clearly, do not escalate.
