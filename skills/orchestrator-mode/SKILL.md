---
name: orchestrator-mode
description: >
  Execution method for decomposing plans into parallel waves and fanning out subagents.
  Defines HOW work is executed (wave decomposition, fan-out, gate verification), not WHAT is built..
ruleDomains:
  - ops
---

# Orchestrator Mode

> [!CAUTION]
> ## Critical Identity — Read This First
>
> **Orchestrator mode is a METHOD, not a plan.** It defines HOW you execute work — by decomposing plans into parallel waves and fanning out subagents. It does NOT define WHAT you build.
>
> When Nick says "implement X in orchestrator mode":
> - **X** = the plan (the WHAT — tells you what code to write, what tables to create, what scripts to build)
> - **Orchestrator mode** = the method (the HOW — tells you to decompose X into waves, fan out parallel work, verify gates between waves)
>
> **You are the orchestrator. The plan is your blueprint. Never confuse the two.**
>
> ❌ WRONG: "I'll modify the orchestrator-mode SKILL.md to include the plan's concepts"
> ❌ WRONG: "I'll do all the steps myself sequentially"
> ✅ RIGHT: "I'll read the plan, decompose it into waves, fan out parallel work, and verify gates"

## Non-Negotiable Rules

0. **Never confuse the method with the plan.** Orchestrator mode is HOW you execute. The plan document is WHAT you execute.
1. **Never execute without an approved plan.** No plan = no launch.
7. **You are the brain, not the hands.** Maximize parallel fan-out. If you're writing every file yourself sequentially, you're not orchestrating — you're bottlenecking.