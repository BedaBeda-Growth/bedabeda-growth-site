#!/usr/bin/env python3
"""
Add a single item to the work ledger.

Usage:
    python3 add_ledger_item.py '<json_string>'

Example:
    python3 add_ledger_item.py '{"id": "AUTO-20260316-fix-signup-flow", "title": "Fix signup flow", "owner": "kai", "impact_tie": "revenue", "repo": "rocket"}'

Required fields: id, title, owner, impact_tie
Optional fields: repo, item_type, priority, blast_radius, confidence_tier,
                 is_gate, estimate, verifier, done_criteria, notes
"""

import sys
import json

WORK_LEDGER_PATH = "/Users/nicholaspetros/scceo-1/grok-personal"


def main():
    if len(sys.argv) < 2:
        print("Usage: add_ledger_item.py '<json_string>'", file=sys.stderr)
        sys.exit(1)

    try:
        item = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    # Validate required fields before touching the ledger
    required = ["id", "title", "owner", "impact_tie"]
    missing = [f for f in required if not item.get(f)]
    if missing:
        print(f"❌ Missing required fields: {missing}", file=sys.stderr)
        sys.exit(1)

    sys.path.insert(0, WORK_LEDGER_PATH)
    from work_ledger import WorkLedger

    ledger = WorkLedger()

    # Check for duplicate ID
    existing = ledger.get_item(item["id"])
    if existing:
        print(f"⚠️  Item already exists: {item['id']} — {existing.get('title')}")
        print("Use update_work_ledger() to modify existing items.")
        sys.exit(1)

    ledger.add_item(item)
    # Ensure local JSON cache is updated (critical when Supabase is unavailable)
    if not ledger._use_supabase:
        ledger.save()

    priority_labels = {0: "critical/today", 1: "this week", 2: "next sprint",
                       3: "backlog", 4: "someday", 5: "nice-to-have"}
    pri = item.get("priority", 2)
    pri_label = priority_labels.get(pri, str(pri))

    print(f"✅ Ledger item added")
    print(f"  ID:           {item['id']}")
    print(f"  Title:        {item['title']}")
    print(f"  Owner:        {item.get('owner')} | Repo: {item.get('repo', 'scceo')}")
    print(f"  Priority:     {pri} ({pri_label}) | Blast: {item.get('blast_radius', 0)} | Gate: {'Yes' if item.get('is_gate') else 'No'}")
    print(f"  Impact tie:   {item.get('impact_tie')}")
    dc = item.get("done_criteria", {})
    if isinstance(dc, dict) and dc.get("business_goal"):
        print(f"  Business goal: {dc['business_goal']}")


if __name__ == "__main__":
    main()
