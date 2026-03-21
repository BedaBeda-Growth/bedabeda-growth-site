#!/usr/bin/env python3
"""
categorize_rules.py — Auto-categorize rules in qa-rules.json (portable, distributed with run-qa-loop skill)

Adds a 'category' field to every rule based on its type and severity:
  - tests/script  → layout-expression, required-element, forbidden-element (deterministic)
  - playwright    → region-snapshot, contrast-rendered, bounding-box, sibling-consistency
  - midscene      → ai-assertion
  - polish        → stubs (expression=="true"), advisory severity

Usage:
  python3 .agents/skills/run-qa-loop/scripts/categorize_rules.py
"""

import json, sys, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def find_qa_rules():
    """Walk up from CWD to find qa-rules.json."""
    d = os.getcwd()
    for _ in range(10):
        candidate = os.path.join(d, "qa-rules.json")
        if os.path.exists(candidate):
            return candidate
        parent = os.path.dirname(d)
        if parent == d:
            break
        d = parent
    return None


def categorize(rule):
    """Return the category for a rule based on its type and properties."""
    rtype = rule.get("type", "")
    severity = rule.get("severity", "hard")
    expression = rule.get("expression", "")

    if rtype == "ai-assertion":
        return "midscene"
    elif rtype in ("region-snapshot", "contrast-rendered"):
        return "playwright"
    elif rtype in ("bounding-box", "sibling-consistency"):
        return "playwright"
    elif rtype in ("required-element", "forbidden-element"):
        return "tests/script"
    elif rtype == "layout-expression" and expression.strip() in ("true", '"true"'):
        return "polish"
    elif rtype == "layout-expression" and severity == "advisory":
        return "polish"
    elif rtype == "layout-expression":
        return "tests/script"
    else:
        return "midscene"


def main():
    dry_run = "--dry-run" in sys.argv

    path = find_qa_rules()
    if not path:
        print("❌ qa-rules.json not found (searched from CWD upward)")
        sys.exit(1)

    with open(path, "r") as f:
        data = json.load(f)

    rules = data.get("rules", [])
    stats = {"tests/script": 0, "playwright": 0, "midscene": 0, "polish": 0}
    changed = 0

    for rule in rules:
        cat = categorize(rule)
        if rule.get("category") != cat:
            changed += 1
        rule["category"] = cat
        stats[cat] += 1

    if not dry_run:
        with open(path, "w") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    mode = "DRY RUN" if dry_run else "APPLIED"
    print(f"\n{'🔍' if dry_run else '✅'} [{mode}] Categorized {len(rules)} rules ({changed} changed):\n")
    for cat, count in sorted(stats.items(), key=lambda x: -x[1]):
        pct = (count / len(rules) * 100) if rules else 0
        print(f"  {cat:15s}  {count:3d}  ({pct:.0f}%)")
    print(f"\n  Total:           {len(rules)}")


if __name__ == "__main__":
    main()
