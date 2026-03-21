#!/usr/bin/env python3
"""
shatter_plan.py — Decompose a plan file into Jules-sized task candidates.

Usage:
  python3 shatter_plan.py <plan-file>
  python3 shatter_plan.py <plan-file> --generate-task-files [--output-dir <dir>]

Output:
  JSON array of candidate tasks printed to stdout.
  Optionally writes one .md file per task to output-dir.
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Repo inference
# ---------------------------------------------------------------------------
REPO_PREFIXES = [
    ("rocket-", "rocket"),
    ("scceo-", "scceo"),
    ("spark-kanban-", "spark-kanban"),
    ("rv-", "rv"),
    ("app-", "app"),
    ("freely-", "app"),
    ("renovio-", "rv"),
    ("finance-", "scceo"),
    ("ap-", "scceo"),
    ("kai-agent", "scceo"),
    ("grok-personal", "scceo"),
    ("platform-", "scceo"),
    ("AUTO-", None),  # need to inspect body
]

REPO_KEYWORDS = {
    "rocket": ["rocket", "xendit", "checkout", "payment"],
    "scceo": ["scceo", "kai", "grok-personal", "finance", "autopilot", "heartbeat"],
    "spark-kanban": ["spark-kanban", "spark kanban", "kanban", "sos"],
    "rv": ["rv", "renovio", "renovation"],
    "app": ["app", "freely", "ember"],
}


def infer_repo(filename: str, content: str) -> str:
    stem = Path(filename).stem.lower()

    # Try prefix match
    for prefix, repo in REPO_PREFIXES:
        if stem.startswith(prefix) and repo:
            return repo

    # Try body field: **Repo:** or **repo:**
    m = re.search(r"\*\*Repo:\*\*\s*`?([a-z\-]+)`?", content, re.IGNORECASE)
    if m:
        return m.group(1).lower()

    # Try keyword scan (first 300 chars of content)
    snippet = content[:300].lower()
    for repo, keywords in REPO_KEYWORDS.items():
        for kw in keywords:
            if kw in snippet:
                return repo

    return "scceo"  # safe default


# ---------------------------------------------------------------------------
# Section extraction
# ---------------------------------------------------------------------------
def extract_sections(content: str) -> list[dict]:
    """
    Extract H2 sections (## ...) as candidate task boundaries.
    Falls back to numbered list items if no H2s found.
    """
    sections = []

    # Try H2 splitting
    h2_pattern = re.compile(r"^## (.+)$", re.MULTILINE)
    h2_matches = list(h2_pattern.finditer(content))

    if len(h2_matches) >= 2:
        for i, match in enumerate(h2_matches):
            start = match.start()
            end = h2_matches[i + 1].start() if i + 1 < len(h2_matches) else len(content)
            title = match.group(1).strip()
            body = content[start:end].strip()
            sections.append({"heading": title, "body": body})
        return sections

    # Fallback: numbered top-level bullets
    numbered = re.compile(r"^(\d+)\.\s+(.+)$", re.MULTILINE)
    for m in numbered.finditer(content):
        sections.append({"heading": m.group(2).strip(), "body": m.group(0).strip()})

    # Final fallback: return whole plan as one task
    if not sections:
        # Extract title from H1
        h1 = re.search(r"^# (.+)$", content, re.MULTILINE)
        title = h1.group(1).strip() if h1 else Path("plan").stem
        sections.append({"heading": title, "body": content.strip()})

    return sections


# ---------------------------------------------------------------------------
# Task filtering heuristics
# ---------------------------------------------------------------------------
SKIP_HEADINGS = {
    "rollback plan", "rollback", "architecture summary", "architecture",
    "files referenced", "files", "known limitations", "future work", "status",
    "overview", "background", "context", "goal", "goals", "summary",
    "known issues", "notes", "references", "related", "design standards",
    "pr requirements", "north star",
}


def is_skip_section(heading: str) -> bool:
    return heading.lower().strip() in SKIP_HEADINGS


def extract_ac_from_body(body: str) -> list[str]:
    """Pull checkbox-style acceptance criteria from a section body."""
    lines = body.split("\n")
    ac = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("- [ ]"):
            ac.append(stripped[5:].strip())
        elif stripped.startswith("- [x]") or stripped.startswith("- [X]"):
            ac.append(stripped[5:].strip() + " ✅")
    return ac


# ---------------------------------------------------------------------------
# Slug helpers
# ---------------------------------------------------------------------------
def to_slug(text: str, max_len: int = 40) -> str:
    text = re.sub(r"[^a-z0-9\s-]", "", text.lower())
    text = re.sub(r"[\s]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:max_len].rstrip("-")


# ---------------------------------------------------------------------------
# Jules task file generator
# ---------------------------------------------------------------------------
JULES_TEMPLATE = """\
# {title}

**Item ID:** `{ledger_id}`
**Repo:** `{repo}`
**Priority:** P{priority}
**Plan source:** `{plan_source}`

---

## Context

{context}

## Task

Implement: **{title}**

Follow the acceptance criteria below exactly. Commit in small, logical steps.
Open a PR to `main` when complete. Include verification evidence in the PR description.

## Acceptance Criteria

{ac_block}

## PR Requirements

- PR title: `feat({ledger_id}): {title_short}`
- Target branch: `main`
- PR description must include: what changed, how to verify, any caveats
- No force-pushes. Small commits preferred.

## Design Standards

- Match existing code patterns in the repo (no new dependencies without justification)
- No breaking changes to auth, checkout, or payment flows
- If you touch a critical path (auth/checkout/meetings), note it in the PR description
- TypeScript: `npx tsc --noEmit` must pass before PR
"""


def generate_task_file(task: dict, output_dir: Path) -> Path:
    ac_lines = task.get("done_criteria", {}).get("evidence_required", [])
    if not ac_lines:
        ac_lines = ["- [ ] Feature/fix implemented as described in task title"]
    else:
        ac_lines = [f"- [ ] {item}" if not item.startswith("-") else item for item in ac_lines]

    context = task.get("body_snippet", "See plan source for full context.")[:300].strip()

    content = JULES_TEMPLATE.format(
        title=task["title"],
        ledger_id=task["id"],
        repo=task["repo"],
        priority=task["priority"],
        plan_source=task.get("plan_source", ""),
        context=context,
        ac_block="\n".join(ac_lines),
        title_short=task["title"][:80],
    )

    slug = to_slug(task["title"])
    filename = f"{task['id']}.md"
    out_path = output_dir / filename
    out_path.write_text(content, encoding="utf-8")
    return out_path


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def shatter(plan_path: Path) -> list[dict]:
    content = plan_path.read_text(encoding="utf-8")
    repo = infer_repo(plan_path.name, content)

    # Extract plan-level title
    h1 = re.search(r"^# (.+)$", content, re.MULTILINE)
    plan_title = h1.group(1).strip() if h1 else plan_path.stem

    sections = extract_sections(content)
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    now_iso = datetime.now(timezone.utc).isoformat()

    tasks = []
    task_num = 0
    for sec in sections:
        heading = sec["heading"]
        if is_skip_section(heading):
            continue

        task_num += 1
        ac = extract_ac_from_body(sec["body"])
        slug = to_slug(heading)
        ledger_id = f"AUTO-{today}-{repo[:8]}-{slug[:28]}"

        # Body snippet for context
        body_snippet = re.sub(r"\n{3,}", "\n\n", sec["body"])[:500]

        task = {
            "id": ledger_id,
            "title": f"[{repo.upper()}] {heading}",
            "owner": "kai",
            "repo": repo,
            "status": "planned",
            "priority": 2,
            "blast_radius": 4,
            "verified": False,
            "item_type": "engineering",
            "impact_tie": f"Part of: {plan_title}",
            "plan_source": str(plan_path),
            "body_snippet": body_snippet,
            "notes": [
                {
                    "at": now_iso,
                    "text": f"[kai] Shattered from plan: {plan_path.name}. Task {task_num} of TOTAL_PLACEHOLDER.",
                }
            ],
            "done_criteria": {
                "business_goal": f"Complete: {heading}",
                "evidence_required": ac if ac else ["PR open against main with verification evidence"],
            },
            "links": {
                "plan_source": str(plan_path),
                "repo_items": [],
            },
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        tasks.append(task)

    # Patch total count in notes
    for t in tasks:
        t["notes"][0]["text"] = t["notes"][0]["text"].replace(
            "TOTAL_PLACEHOLDER", str(len(tasks))
        )

    return tasks


def main():
    parser = argparse.ArgumentParser(description="Shatter a plan file into Jules task candidates.")
    parser.add_argument("plan_file", help="Path to the plan .md file")
    parser.add_argument(
        "--generate-task-files",
        action="store_true",
        help="Generate one Jules task .md file per task",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directory to write task files (default: same as plan file)",
    )
    args = parser.parse_args()

    plan_path = Path(args.plan_file).resolve()
    if not plan_path.exists():
        print(f"ERROR: Plan file not found: {plan_path}", file=sys.stderr)
        sys.exit(1)

    tasks = shatter(plan_path)

    if args.generate_task_files:
        output_dir = Path(args.output_dir) if args.output_dir else plan_path.parent
        output_dir.mkdir(parents=True, exist_ok=True)
        generated = []
        for task in tasks:
            out = generate_task_file(task, output_dir)
            generated.append(str(out))
            print(f"  ✅ {out.name}", file=sys.stderr)
        print(f"\n{len(generated)} task file(s) written to {output_dir}", file=sys.stderr)

    # Always print JSON to stdout for piping / review
    print(json.dumps(tasks, indent=2))


if __name__ == "__main__":
    main()
