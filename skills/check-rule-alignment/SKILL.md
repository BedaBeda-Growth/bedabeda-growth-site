---
name: "Check Rule Alignment"
description: "Checks skills against the company rule ledger to identify coverage gaps by severity. It parses the graded JSON matrix output by skill_grader.py."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Check Rule Alignment

This skill verifies the alignment between available skills and the active rules in the Supabase `rule_ledger.rules` ledger.

## Trigger Phrases
- "check rule alignment"
- "which skills don't consider rules"
- "skill rule gaps"
- "grade skills against rules"

## Execution Flow

### 1. Run the Grader (or use cache)

Check if the cached gap matrix exists and is younger than 24 hours:

```bash
cd /Users/nicholaspetros/scceo-1/rules_ledger
if [ -f "reports/skill_rule_gaps.json" ] && [ $(find reports/skill_rule_gaps.json -mtime -1 2>/dev/null | wc -l) -eq 1 ]; then
    echo "Cache valid (<24h)"
else
    python3 skill_grader.py
fi
```

### 2. Parse and Render Gap Matrix

Read `/Users/nicholaspetros/scceo-1/rules_ledger/reports/skill_rule_gaps.json`.

Display a Markdown datatable of the top skill vs rule gaps, sorted by severity, based on the JSON output:

```bash
python3 -c "
import json
try:
    with open('/Users/nicholaspetros/scceo-1/rules_ledger/reports/skill_rule_gaps.json', 'r') as f:
        data = json.load(f)
    print('## Top 5 Skill-Rule Gaps')
    gaps = data.get('summary', {}).get('top_gaps', [])
    for gap in gaps[:5]:
        rule_info = data['rules'].get(gap, {})
        print(f'- **Rule**: {gap} ({rule_info.get(\"severity\")})')
        print(f'  - Domain: {rule_info.get(\"domain\")}')
        print(f'  - Recommended Action: Add rule gate or domain declaration to relevant skills.')
except FileNotFoundError:
    print('Error: Grader JSON not found.')
"
```

Produce a full report detailing:
- The top 5 gaps with recommended actions.
- A datatable summarizing any other significant gaps sorted by severity.

*Remember: This skill does NOT read individual skill files. All data comes exclusively from the grader output json.*
