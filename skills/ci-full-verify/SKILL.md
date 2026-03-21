---
name: "ci-full-verify"
description: "Cross-repo orchestration: dispatch Jules (remote VM) to run the ci-verify workflow in each target repo, which merges ci-integration branches into ci-testing-verify and triggers GitHub Actions for the full Playwright matrix against CI_TESTING_URL. Read each repo's ci-verify skill before dispatching."
ruleDomains:
  - ops
  - deploy
---

# CI Full Verify — Cross-Repo Orchestration

This is the ORCHESTRATION layer. The actual merge+verify logic lives in each repo's own
`.agents/skills/ci-verify/SKILL.md`. Read that skill before dispatching.

## What this skill does NOT do
- Does not run Playwright locally
- Does not reset or clean local working trees
- Does not create branches from main
- Does not duplicate the ci-verify logic — it invokes it

## The process (per repo)

### 1. Confirm ci-integration branches exist
git branch -r | grep ci-integration

### 2. Dispatch Jules pointing at the repo's ci-verify workflow

jules remote new \
  --repo <owner/repo> \
  --session "$(cat ~/SOS/Rocket/fractional-ignite/.agents/skills/ci-verify/SKILL.md)

---
BRANCHES TO PROCESS (merge in this order):
1. ci-integration-<batch-1>
2. ci-integration-<batch-2>
...
"

Jules will:
- Checkout ci-testing-verify (existing branch, NOT from main)
- Run scripts/ci-merge-verify.sh --mode quick per branch
- Fix gate failures inline
- Run scripts/verify-batch.sh push → pushes ci-testing-verify → triggers GH Actions

Environment note: Supabase credentials in this workflow are CI_TESTING_URL and
CI_TESTING_SERVICE_KEY — NOT SUPABASE_URL (production).

### 3. Monitor GH Actions
gh run list --branch ci-testing-verify --limit 3
gh run watch <run_id>

### 4. Handle failures
gh run view <run_id> --log-failed | head -50
Dispatch targeted Jules fix session → push → Actions re-runs

### 5. Land to main (only when GH Actions fully green)
gh pr create --base main --head ci-testing-verify --title "ci: land $(date +%Y-%m-%d)"
gh pr merge <number> --squash

### 6. Sync ledger + SOS
cd ~/scceo-1/grok-personal && python3 sync_sos_ledger.py --push

## Repo map
| Repo | Skill location | Branch |
|------|----------------|--------|
| Rocket | .agents/skills/ci-verify/SKILL.md | ci-testing-verify |
| App | .agents/skills/ci-verify/SKILL.md | ci-testing-verify |
| Spark | .agents/skills/ci-verify/SKILL.md | ci-testing-verify |
| scceo | .agents/skills/ci-verify/SKILL.md | ci-testing-verify |


---

## Python Automation Audit

CI steps should already be deterministic scripts — that's the whole point. After this run, confirm:

- All merge/verify/push steps ran as Bash/Python scripts (not LLM judgment)
- If any step required LLM interpretation → flag it: `python3 ~/.agents/skills/prefer-python-over-llm/scripts/classify_task.py "step"`
- Log invocation: `INSERT INTO rule_ledger.skill_usage (skill_slug, trigger_source, result) VALUES ('ci-full-verify', 'kai-agent', 'completed')`
- Rule: `ops-prefer-python-over-llm`

---

## Variants / Absorbed Modes

The following former standalone skills are now modes of `ci-full-verify`:

### --repo <name>
Scope CI gates to a single repo instead of all repos.
Valid: `rocket`, `scceo`, `app`, `spark-kanban`, `rv`, `auto1`, `pinchpay`, `web`, `legacy`
*(absorbed: rocket-ci-gates, scceo-ci-gates, app-ci-gates, spark-kanban-ci-gates, rv-ci-gates, auto1-ci-gates, pinchpay-ci-gates, web-ci-gates, legacy-ci-gates)*

### --mode sequential
Merge PRs one-by-one into the testing branch with a verification gate after each merge.
Default is parallel/full suite.
*(absorbed: ci-verify)*

### --mode test-only
Run the test suite without the merge pipeline. Use when code is already merged and you just need a test pass.
*(absorbed: run-testing-suite)*