#!/usr/bin/env python3
"""
save_feedback.py — Deterministically writes feedback ingestion output.

Writes:
  1. qa-rules.json  — appends new rules, skips duplicates by ID
  2. feedback/YYYY-MM-DD.md — dated feedback log with rule mapping table

Usage:
  python3 save_feedback.py \
    --repo-path /path/to/repo \
    --rules '[{"id":"phone-number-correct","type":"forbidden-element","selector":".phone"}]' \
    --raw-feedback "Client said phone is wrong on about page" \
    --source "client-review-round-1" \
    [--date 2026-03-16]  # defaults to today
    [--feedback-items '[{"raw":"Phone wrong on about","rule_id":"phone-number-correct"}]']
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path


QA_RULES_FILENAME = "qa-rules.json"


def find_or_create_qa_rules_path(repo_path: Path) -> Path:
    """Return path to qa-rules.json at the repo root."""
    candidate = repo_path / QA_RULES_FILENAME
    if not candidate.exists():
        # Initialize an empty structure if it completely doesn't exist
        candidate.write_text(json.dumps({
            "$schema": "https://pinchforth.com/schemas/qa-rules/v1.json",
            "project": {},
            "viewports": {},
            "pages": {},
            "rules": []
        }, indent=4))
    return candidate


def append_rules_to_file(rules_path: Path, new_rules: list[dict], repo_name: str, source: str, today: str) -> tuple[int, int]:
    """Append new rules to qa-rules.json. Returns (added, skipped)."""
    try:
        data = json.loads(rules_path.read_text())
    except json.JSONDecodeError as e:
        print(f"ERROR: Could not parse {rules_path}: {e}", file=sys.stderr)
        sys.exit(1)

    if "rules" not in data:
        data["rules"] = []

    existing_rules = data["rules"]
    existing_ids = {r.get("id") for r in existing_rules if "id" in r}

    rules_to_add = []
    skipped = 0
    for rule in new_rules:
        rule_id = rule.get("id")
        if not rule_id or rule_id in existing_ids:
            skipped += 1
            continue
            
        rules_to_add.append(rule)
        existing_ids.add(rule_id)

    if rules_to_add:
        existing_rules.extend(rules_to_add)
        rules_path.write_text(json.dumps(data, indent=4))

    return len(rules_to_add), skipped


def write_feedback_file(feedback_dir: Path, today: str, source: str, raw_feedback: str, feedback_items: list[dict]) -> Path:
    """Write or append to feedback/YYYY-MM-DD.md."""
    feedback_dir.mkdir(parents=True, exist_ok=True)
    feedback_path = feedback_dir / f"{today}.md"

    lines = []
    if not feedback_path.exists():
        lines.append(f"# Feedback — {today}\n")
        lines.append(f"**Source:** {source}\n")
        lines.append("\n")
        lines.append("| # | Raw Feedback | Extracted Rule ID | Status |\n")
        lines.append("|---|--------------|-------------------|--------|\n")
    else:
        lines.append(f"\n\n## Additional batch — source: {source}\n\n")
        lines.append("| # | Raw Feedback | Extracted Rule ID | Status |\n")
        lines.append("|---|--------------|-------------------|--------|\n")

    if feedback_items:
        for i, item in enumerate(feedback_items, 1):
            raw = item.get("raw", "").replace("|", "\\|")
            rule_id = item.get("rule_id", "—")
            lines.append(f"| {i} | {raw} | {rule_id} | ⏳ pending |\n")
    else:
        # Fallback: dump raw feedback as a single row
        safe_raw = raw_feedback.replace("\n", " ").replace("|", "\\|")[:300]
        lines.append(f"| 1 | {safe_raw} | — | ⏳ pending |\n")

    with open(feedback_path, "a") as f:
        f.writelines(lines)

    return feedback_path


def main():
    parser = argparse.ArgumentParser(description="Ingest feedback into qa-rules.json and dated feedback log.")
    parser.add_argument("--repo-path", required=True, help="Absolute path to the repo root")
    parser.add_argument("--rules", required=True, help="JSON array of rule objects")
    parser.add_argument("--raw-feedback", required=True, help="Original raw feedback text")
    parser.add_argument("--source", required=True, help="Label for feedback source (e.g. 'client-review-round-1')")
    parser.add_argument("--date", default=str(date.today()), help="Override date (YYYY-MM-DD), defaults to today")
    parser.add_argument("--feedback-items", default="[]", help="JSON array: [{raw, rule_id}] mapping feedback items to rule IDs")
    args = parser.parse_args()

    repo_path = Path(args.repo_path).resolve()
    if not repo_path.exists():
        print(f"ERROR: repo path does not exist: {repo_path}", file=sys.stderr)
        sys.exit(1)

    try:
        rules = json.loads(args.rules)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in --rules: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        feedback_items = json.loads(args.feedback_items)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in --feedback-items: {e}", file=sys.stderr)
        sys.exit(1)

    repo_name = repo_path.name
    today = args.date

    # 1. Append to qa-rules.json
    rules_path = find_or_create_qa_rules_path(repo_path)
    added, skipped = append_rules_to_file(rules_path, rules, repo_name, args.source, today)

    # 2. Write dated feedback file
    feedback_dir = repo_path / "feedback"
    feedback_path = write_feedback_file(feedback_dir, today, args.source, args.raw_feedback, feedback_items)

    # 3. Summary
    print(json.dumps({
        "status": "ok",
        "rules_file": str(rules_path),
        "rules_added": added,
        "rules_skipped_duplicate": skipped,
        "feedback_file": str(feedback_path),
        "feedback_items": len(feedback_items),
    }, indent=2))


if __name__ == "__main__":
    main()
