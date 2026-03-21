---
name: "Plan Top Five"
description: "Review and enrich the top 5 highest-priority items so they are perfectly staged for the next planning wave."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
ruleDomains:
  - ops
---

# Plan Top Five

## Trigger Phrases
- "plan top five", "surf top priorities", "enrich top 5", "prepare top five for Jules"

## Why We Do This
The goal is to create a high-touch, highest-priority planning piece. When these jobs get to Jules, they get completed fastest. By beefing up the plans *before* the batch runs, we ensure that validation criteria and the finish line are abundantly clear.

## Step 1: Surface the Top 5 Priorities
Run the following script to get the list of our current top 5 highest-leverage items based on our numbers and goals:

```bash
python3 /Users/nicholaspetros/scceo-1/grok-personal/scripts/plan_top_five.py
```

Review the output to understand the 5 items. The script will show you the Title, Priority, Impact/Goal, and Current Done Criteria.

## Step 2: Beef Up the Plans
For **each** of the top 5 items surfaced, evaluate whether its plan is fully ready for Jules to execute autonomously.
A fully ready item MUST have:
1. **Clear Context**: The impact statement and background context tell Jules *why* we are doing this.
2. **Abundantly Clear Validation Criteria / Finish Line**: A precise definition of done. What commands or manual visual checks must pass for this to be considered verifying successfully?

If any of these are missing or vague, you must enrich them.

### How to Enrich
To enrich an item, you can use the `work_ledger.py` utilities or the equivalent `make-a-plan` skill to expand its documentation.
Specifically, you should ensure the `done_criteria` on the item in the Work Ledger is fully populated.
If you need to update the item, you can do so by calling a python one-liner updating the item in the ledger:

```python
import sys
sys.path.append('/Users/nicholaspetros/scceo-1/grok-personal')
from work_ledger import WorkLedger

ledger = WorkLedger()
item = ledger.get_item('ITEM_ID')

# Example update:
# item['done_criteria']['description'] = "Your enriched finish line text..."
# item['impact_tie'] = "Your enriched context..."

ledger._upsert_item(item) # Saves to DB if available
ledger.save()
```

Make sure to add all relevant context to each item so they are "ready to go" for the next `plan and prioritize` wave.

## Step 3: Confirm
Once you have reviewed and enriched all 5 items, summarize what was added or refined for each item and present the readied batch to Nick.
