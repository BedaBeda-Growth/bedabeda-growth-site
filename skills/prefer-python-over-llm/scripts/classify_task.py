#!/usr/bin/env python3
"""
classify_task.py — Heuristic classifier: is this task scriptable or does it need an LLM?

Usage:
    python3 classify_task.py "check if email is valid"
    python3 classify_task.py "write a personalized follow-up based on conversation history"

Returns: SCRIPTABLE or LLM_JUSTIFIED with reasoning. No LLM calls. Zero tokens.
"""

import sys
import re

# Tasks that are deterministic and should be Python scripts
SCRIPTABLE_SIGNALS = [
    # Data operations
    r"\b(query|fetch|get|list|count|sum|average|filter|sort|group|join|aggregate)\b",
    r"\b(select|insert|update|delete|upsert)\b",
    r"\b(read|write|parse|load|save|export|import|convert|transform)\b",
    # File operations
    r"\b(file|files|directory|folder|path|glob|copy|move|rename|delete)\b",
    r"\b(csv|json|yaml|xml|xlsx|pdf|markdown|html)\b",
    # Validation
    r"\b(validate|check|verify|confirm|assert|test|detect|match|compare)\b",
    r"\b(exists|contains|starts with|ends with|equals|greater|less than)\b",
    # API/network
    r"\b(api|endpoint|request|response|http|webhook|call|ping|status)\b",
    r"\b(send email|send message|post to|update record|create record)\b",
    # Math/logic
    r"\b(calculate|compute|multiply|divide|add|subtract|percentage|ratio)\b",
    r"\b(if.*then|condition|flag|toggle|enable|disable)\b",
    # Monitoring/checks
    r"\b(monitor|watch|poll|check every|scheduled|cron|daily|hourly)\b",
    r"\b(log|record|track|store|cache|index)\b",
    # Formatting
    r"\b(format|template|render|replace|substitute|slug|kebab|snake_case)\b",
]

# Tasks that genuinely require LLM (judgment, synthesis, language)
LLM_SIGNALS = [
    r"\b(write|draft|generate|create|compose|craft)\b.*(email|message|content|copy|post|blog|summary|description)",
    r"\b(summarize|summarise|explain|describe|analyze|analyse|interpret)\b",
    r"\b(suggest|recommend|decide|evaluate|assess|review|judge)\b",
    r"\b(personalize|personalise|tailor|customize|adapt)\b",
    r"\b(conversation|context|tone|voice|sentiment|intent|meaning)\b",
    r"\b(translate|paraphrase|rewrite|improve|polish|edit)\b",
    r"\b(plan|strategy|prioritize|brainstorm|ideate)\b",
    r"\b(classify|categorize|label|tag)\b.*(ambiguous|unclear|nuanced|complex)",
    r"\b(understand|comprehend|extract.*from.*text|read.*between)\b",
]

SCRIPTABLE_KEYWORDS = [
    "query", "fetch", "get list", "count", "check if", "validate", "parse",
    "read file", "write file", "send email", "api call", "calculate", "format",
    "compare", "filter", "sort", "update record", "insert", "delete", "cron",
    "schedule", "monitor", "log to", "track", "store", "distribute", "copy",
    "move", "rename", "convert", "export", "import", "transform", "search",
    "find files", "grep", "extract field", "check status", "ping",
]


def classify(task: str) -> tuple[str, str]:
    task_lower = task.lower()

    scriptable_hits = []
    for pattern in SCRIPTABLE_SIGNALS:
        if re.search(pattern, task_lower):
            scriptable_hits.append(pattern)

    llm_hits = []
    for pattern in LLM_SIGNALS:
        if re.search(pattern, task_lower):
            llm_hits.append(pattern)

    keyword_hits = [kw for kw in SCRIPTABLE_KEYWORDS if kw in task_lower]

    # Decision logic
    if llm_hits and not scriptable_hits:
        return "LLM_JUSTIFIED", f"Language/judgment signals: {len(llm_hits)} match(es). No scriptable signals detected."

    if scriptable_hits and not llm_hits:
        reasons = keyword_hits[:3] if keyword_hits else [p[:40] for p in scriptable_hits[:2]]
        return "SCRIPTABLE", f"Deterministic signals: {', '.join(reasons)}. No language/judgment signals. Build a Python script."

    if scriptable_hits and llm_hits:
        # Scriptable wins if keyword hits are strong
        if len(keyword_hits) >= 2 or len(scriptable_hits) > len(llm_hits):
            reasons = keyword_hits[:3] if keyword_hits else [p[:40] for p in scriptable_hits[:2]]
            return "SCRIPTABLE", f"Predominantly deterministic ({len(scriptable_hits)} scriptable vs {len(llm_hits)} LLM signals). Consider splitting: script for the mechanical part, LLM only for judgment. Scriptable signals: {', '.join(reasons)}."
        else:
            return "LLM_JUSTIFIED", f"Mixed signals but judgment dominates ({len(llm_hits)} LLM vs {len(scriptable_hits)} scriptable). LLM justified — document reasoning in description frontmatter."

    # No strong signals either way
    return "UNCERTAIN", "No strong signals. Review manually: does this require natural language understanding? If not, it's probably scriptable."


def main():
    if len(sys.argv) < 2:
        print("Usage: classify_task.py <task description>")
        print('Example: classify_task.py "count the number of active users in the database"')
        sys.exit(1)

    task = " ".join(sys.argv[1:])
    verdict, reasoning = classify(task)

    icon = {"SCRIPTABLE": "🐍", "LLM_JUSTIFIED": "🤖", "UNCERTAIN": "❓"}.get(verdict, "❓")
    print(f"\n{icon}  {verdict}")
    print(f"   Task: {task}")
    print(f"   Reason: {reasoning}\n")

    if verdict == "SCRIPTABLE":
        print("   → Build a Python script instead of an LLM skill.")
        print("   → Log to rule_ledger.skill_usage with python_candidate=true")
        sys.exit(0)
    elif verdict == "LLM_JUSTIFIED":
        print("   → LLM skill acceptable. Add justification to description frontmatter.")
        sys.exit(0)
    else:
        print("   → Review manually before proceeding.")
        sys.exit(2)


if __name__ == "__main__":
    main()
