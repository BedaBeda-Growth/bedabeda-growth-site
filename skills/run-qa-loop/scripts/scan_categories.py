#!/usr/bin/env python3
"""
scan_categories.py — QA Rules Category Scanner (portable, distributed with run-qa-loop skill)

Reads qa-rules.json from the current repo root and reports:
  1. Distribution of rules across the 4 execution tiers.
  2. Any rules MISSING a category (validation).
  3. Per-category rule listings.

Usage:
  python3 .agents/skills/run-qa-loop/scripts/scan_categories.py           # summary
  python3 .agents/skills/run-qa-loop/scripts/scan_categories.py --verbose  # show each rule
  python3 .agents/skills/run-qa-loop/scripts/scan_categories.py --validate # exit 1 if any uncategorized
"""

import json, sys, os

VALID_CATEGORIES = {"tests/script", "playwright", "midscene", "polish"}


def find_qa_rules():
    """Walk up from CWD to find qa-rules.json at the repo root."""
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


def main():
    verbose = "--verbose" in sys.argv
    validate = "--validate" in sys.argv

    path = find_qa_rules()
    if not path:
        print("❌ qa-rules.json not found (searched from CWD upward)")
        sys.exit(1)

    with open(path, "r") as f:
        data = json.load(f)

    rules = data.get("rules", [])
    if not rules:
        print("⚠️  No rules found in qa-rules.json")
        sys.exit(0)

    # Tally
    by_cat = {c: [] for c in VALID_CATEGORIES}
    uncategorized = []

    for rule in rules:
        rid = rule.get("id", "unknown")
        cat = rule.get("category", None)
        if cat in VALID_CATEGORIES:
            by_cat[cat].append(rid)
        else:
            uncategorized.append(rid)

    # Summary
    total = len(rules)
    print(f"\n🔍 QA Rules Category Scan — {total} rules ({os.path.basename(os.path.dirname(path))} repo)\n")
    print(f"  {'Category':15s}  {'Count':>5s}  {'%':>5s}")
    print(f"  {'─' * 15}  {'─' * 5}  {'─' * 5}")
    for cat in ["tests/script", "playwright", "midscene", "polish"]:
        count = len(by_cat[cat])
        pct = f"{count / total * 100:.0f}%" if total else "0%"
        print(f"  {cat:15s}  {count:5d}  {pct:>5s}")
    print(f"  {'─' * 15}  {'─' * 5}")
    print(f"  {'Total':15s}  {total:5d}")

    if uncategorized:
        print(f"\n  ⚠️  Uncategorized:  {len(uncategorized)}")
        for rid in uncategorized:
            print(f"    - {rid}")

    # Verbose listing
    if verbose:
        for cat in ["tests/script", "playwright", "midscene", "polish"]:
            ids = by_cat[cat]
            if ids:
                print(f"\n  [{cat}] ({len(ids)} rules):")
                for rid in ids:
                    print(f"    • {rid}")

    # Validate mode
    if validate:
        if uncategorized:
            print(f"\n❌ VALIDATION FAILED — {len(uncategorized)} rules missing category")
            sys.exit(1)
        else:
            print(f"\n✅ VALIDATION PASSED — all {total} rules categorized")
            sys.exit(0)

    print()


if __name__ == "__main__":
    main()
