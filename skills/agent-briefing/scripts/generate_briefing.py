#!/usr/bin/env python3
"""
generate_briefing.py — Generate a portable AGENT-BRIEFING.md

Reads:
  - All enabled skills from ~/.agents/skills/*/SKILL.md (YAML frontmatter only)
  - All active rules from the rule ledger (psql → sqlite3 fallback)

Outputs:
  - A single markdown file with 4 sections: Identity, Skills, Rules, Behavioral Guidelines

Usage:
  python3 generate_briefing.py [--output /path/to/AGENT-BRIEFING.md]
"""

import argparse
import os
import re
import sqlite3
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


# ── Config ──────────────────────────────────────────────────────────────────

SKILLS_DIR = Path.home() / ".agents" / "skills"
RULES_DB = Path.home() / "scceo-1" / "rules_ledger" / "rules.db"
DEFAULT_OUTPUT = Path.home() / "Desktop" / "Rocket" / "AGENT-BRIEFING.md"


# ── YAML frontmatter parser (no deps) ───────────────────────────────────────

def parse_frontmatter(text: str) -> dict:
    """Extract YAML frontmatter from a markdown file. Returns {} if not found."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    block = text[3:end].strip()
    result = {}
    current_key = None
    multiline_value = []
    in_multiline = False

    for line in block.splitlines():
        # Key: value pattern
        m = re.match(r'^(\w[\w\-]*)\s*:\s*(.*)', line)
        if m and not line.startswith(" "):
            if in_multiline and current_key:
                result[current_key] = " ".join(multiline_value).strip()
            current_key = m.group(1)
            val = m.group(2).strip()
            if val in (">", "|", ""):
                in_multiline = True
                multiline_value = []
            else:
                in_multiline = False
                result[current_key] = val.strip("\"'")
        elif in_multiline and line.startswith("  "):
            multiline_value.append(line.strip())
        elif line.startswith("  - ") and current_key:
            # List item under current key
            if current_key not in result:
                result[current_key] = []
            if isinstance(result[current_key], list):
                result[current_key].append(line.strip(" -"))

    if in_multiline and current_key:
        result[current_key] = " ".join(multiline_value).strip()

    return result


# ── Skills loader ────────────────────────────────────────────────────────────

def load_skills() -> list[dict]:
    """Walk SKILLS_DIR, parse frontmatter from each SKILL.md. Skip archived."""
    skills = []
    if not SKILLS_DIR.exists():
        print(f"  [warn] Skills dir not found: {SKILLS_DIR}", file=sys.stderr)
        return skills

    for skill_md in sorted(SKILLS_DIR.glob("*/SKILL.md")):
        slug = skill_md.parent.name
        if slug.startswith("ARCHIVED_") or slug.startswith("."):
            continue
        try:
            text = skill_md.read_text(encoding="utf-8")
            fm = parse_frontmatter(text)
            if not fm.get("name") and not fm.get("description"):
                continue  # skip non-skill dirs (e.g. AUTONOMY-TIERS.md parent)
            skills.append({
                "slug": slug,
                "name": fm.get("name", slug),
                "description": fm.get("description", "—"),
                "ruleDomains": fm.get("ruleDomains", []),
            })
        except Exception as e:
            print(f"  [warn] Could not parse {skill_md}: {e}", file=sys.stderr)

    return skills


# ── Rules loader ─────────────────────────────────────────────────────────────

def load_rules_psql() -> list[dict] | None:
    """Try to load rules via psql. Returns None if unavailable."""
    db_url = os.environ.get("RULES_DATABASE_URL")
    if not db_url:
        return None
    try:
        sql = (
            "SELECT rule_key, name, domain, severity, autonomy_level, description "
            "FROM rule_ledger.rules WHERE enabled=true ORDER BY domain, severity, rule_key;"
        )
        result = subprocess.run(
            ["psql", db_url, "-t", "-A", "-F", "\t", "-c", sql],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            return None
        rules = []
        for line in result.stdout.strip().splitlines():
            parts = line.split("\t")
            if len(parts) >= 6:
                rules.append({
                    "rule_key": parts[0],
                    "name": parts[1],
                    "domain": parts[2],
                    "severity": parts[3],
                    "autonomy_level": parts[4],
                    "description": "\t".join(parts[5:]),
                })
        return rules if rules else None
    except Exception:
        return None


def load_rules_sqlite() -> list[dict]:
    """Load rules from local SQLite DB as fallback."""
    if not RULES_DB.exists():
        return []
    try:
        conn = sqlite3.connect(str(RULES_DB))
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT rule_key, name, domain, severity, autonomy_level, description "
            "FROM rules WHERE enabled=1 ORDER BY domain, severity, rule_key"
        )
        rules = [dict(row) for row in cur.fetchall()]
        conn.close()
        return rules
    except Exception as e:
        print(f"  [warn] SQLite fallback failed: {e}", file=sys.stderr)
        return []


def load_rules() -> list[dict]:
    rules = load_rules_psql()
    if rules is not None:
        return rules
    print("  [info] psql unavailable — using local SQLite fallback", file=sys.stderr)
    return load_rules_sqlite()


# ── Markdown builders ────────────────────────────────────────────────────────

IDENTITY_BLOCK = """## Who We Are

**SCCEO / Freely** is a community-first platform for Filipino business leaders and entrepreneurs.
The product is the community — not features. Homepage with faces converts at 85%; features-first at 14.5%.

**Current goal:** $30K gross new sales by Mar 27. Three engines: Townhall+Discord virality, email nurture, founder outreach+referral.

**Tech stack:** Supabase (Rocket=`bagzchmynxxyhnkifzwe`, App=`qfthgopshhzrgacysfdr`, SOS=`cjgsgowvbynyoceuaona`), Resend email, Stripe/DodoPay/Xendit payments, xAI (production AI), Kai Agent (CTO AI).

**Core team:** Nick (founder — relationships, strategy, legal), Kai (CTO AI — builder), Ember (Grok co-CEO — internal ops AI).
"""

BEHAVIORAL_GUIDELINES = """## Behavioral Guidelines for Any Agent in This System

These apply to every agent — no exceptions.

| # | Rule | What it means |
|---|------|---------------|
| 1 | **Work ledger first** | Every task must create or update an item in `~/scceo-1/grok-personal/data/work_ledger.json` before and after execution. |
| 2 | **Done = verified on the live site** | "Done" means a real user can do the thing on the live site RIGHT NOW. Not "code merged", not "deployed to staging". |
| 3 | **No production DB for external agents** | External agents (GHA, Jules, Ninja Tech) never get production DB credentials. Only Kai and Nick hold prod access. |
| 4 | **No Groq in production** | Groq is local-only (Ember internal, local finance). Production AI = xAI (api.x.ai) only. Cancel any agent task referencing Groq in a production context. |
| 5 | **Never push to main without written human approval** | Always branch → PR → review → merge. Never `git push origin main` directly. |
| 6 | **No destructive commands without explicit confirmation** | `rm -rf`, `DROP TABLE`, `reset --hard` — always confirm with Nick before running. |
| 7 | **Validate email before send** | Always check `email_validations` table before calling DeBounce API. Never send to unvalidated addresses. |
| 8 | **Configuration before code** | Before writing code to solve a problem, check if the platform already has a toggle/env var/setting that solves it. |
| 9 | **Nick is never the bottleneck** | If Kai/AG/Jules can do it, they do it. Nick's lane: relationships, legal, strategic judgment. The only 3 exceptions: direct money cost, his personal compute time, dramatic changes to critical user flows. |
| 10 | **Scan plans/ before building** | Before planning or building anything, scan `~/scceo-1/plans/` for an existing plan. Never duplicate prior design work. |
| 11 | **Rules must be programmatic** | Any rule that requires a human to enforce it is a failing rule. Every rule must be evaluable with zero human involvement. |
| 12 | **Email boundary** | Rocket sends TRANSACTIONAL only (password reset, subscription confirm, trial start). Spark-kanban sends ALL marketing/nurture. Never scope agent work to touch Rocket email for campaigns. |
"""


def build_skills_section(skills: list[dict]) -> str:
    lines = [
        f"## Skills Catalog ({len(skills)} skills)\n",
        "Each skill is invoked by name. The description defines when to use it.\n",
        "| Slug | Name | Description |",
        "|------|------|-------------|",
    ]
    for s in skills:
        desc = s["description"].replace("\n", " ").strip()
        # Truncate very long descriptions for readability
        if len(desc) > 200:
            desc = desc[:197] + "..."
        lines.append(f"| `{s['slug']}` | {s['name']} | {desc} |")
    return "\n".join(lines)


def build_rules_section(rules: list[dict]) -> str:
    if not rules:
        return "## Rules Catalog\n\n_(No rules loaded — check RULES_DATABASE_URL or local rules.db)_\n"

    lines = [
        f"## Rules Catalog ({len(rules)} active rules)\n",
        "Rules are enforced programmatically. `autonomy_level` controls how they fire.\n",
        "| Rule Key | Name | Domain | Severity | Autonomy Level | Description |",
        "|----------|------|--------|----------|----------------|-------------|",
    ]
    for r in rules:
        desc = (r.get("description") or "").replace("\n", " ").strip()
        if len(desc) > 150:
            desc = desc[:147] + "..."
        lines.append(
            f"| `{r['rule_key']}` | {r['name']} | {r['domain']} "
            f"| {r['severity']} | {r['autonomy_level']} | {desc} |"
        )
    return "\n".join(lines)


def build_doc(skills: list[dict], rules: list[dict], generated_at: str) -> str:
    return f"""# SCCEO Agent Briefing

> Auto-generated by `agent-briefing` skill on {generated_at}
> This document is the single portable context pack for any intelligent agent joining the SCCEO system.
> It contains: identity, full skills catalog, full rules catalog, and behavioral guidelines.

---

{IDENTITY_BLOCK}

---

{build_skills_section(skills)}

---

{build_rules_section(rules)}

---

{BEHAVIORAL_GUIDELINES}

---

_Generated: {generated_at} | Skills: {len(skills)} | Rules: {len(rules)}_
"""


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate AGENT-BRIEFING.md")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT),
                        help=f"Output path (default: {DEFAULT_OUTPUT})")
    args = parser.parse_args()

    output_path = Path(args.output).expanduser()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print("Loading skills...")
    skills = load_skills()
    print(f"  {len(skills)} skills loaded")

    print("Loading rules...")
    rules = load_rules()
    print(f"  {len(rules)} rules loaded")

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    doc = build_doc(skills, rules, generated_at)

    output_path.write_text(doc, encoding="utf-8")
    print(f"\nGenerated: {len(skills)} skills + {len(rules)} rules → {output_path}")


if __name__ == "__main__":
    main()
