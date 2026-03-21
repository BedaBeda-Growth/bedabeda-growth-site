---
name: "Daily Check"
description: "Check strike list progress, update status, and keep Nick + Kai advancing against daily priorities."
requiredSources:
  - kai-brain
alwaysAllow:
  - Bash
  - Read
ruleDomains:
  - ops
---

# Daily Check — Strike List Tracker

Use this skill when Nick says:
- "daily check", "where are we", "strike list", "what's next"
- "check off 3", "mark 2 done", "swap 1 and 4"
- "reprioritize", "add to strike list", "drop item 5"

## How It Works

The strike list lives in `~/Desktop/Rocket/Todos/YYYY-MM-DD.md` — the same file the morning pipeline generates. It has a `## Strike List` section at the top with ranked items, each with a `- [ ]` or `- [x]` checkbox.

## Objective Alignment (Mandatory)
When checking strike list progress:
- Read `/Users/nicholaspetros/scceo-1/objectives/OBJECTIVES.md`
- Show objective IDs covered by in-progress/done items when available
- If an active item has no clear objective mapping, ask: **"What's the objective here?"**
- Surface objective gaps in the status card (not just completion counts)

## Step 1: Read Today's Todos

```bash
cat ~/Desktop/Rocket/Todos/$(date +%Y-%m-%d).md
```

Parse the Strike List section (between `## Strike List` and `## Backlog`).

## Step 2: Check Status of Each Item

For each `- [ ]` (unchecked) item, attempt auto-verification where possible:

| Signal | How to Check |
|--------|-------------|
| Git merge | `git -C <repo> log main..staging --oneline` — if 0 lines, merged |
| Sentry errors | Check if error count dropped (compare to morning value) |
| API key fix | `op read "op://Rocket/Resend/api_key" 2>/dev/null && echo OK` |
| Deploy status | `curl -s -o /dev/null -w "%{http_code}" https://site.com` |
| Content posted | Check Typefully or X stats if available |

If auto-verification isn't possible, mark as "needs manual check."

## Step 3: Present Status Card

Format the output as a compact status card:

```
STRIKE LIST — YYYY-MM-DD (X/Y done)

[x] 1. Item title — DONE
[ ] 2. Item title — IN PROGRESS (detail)
[ ] 3. Item title — NOT STARTED

NEXT UP: #N — brief context on how to tackle it.
TIME: HH:MM PM ET — X/Y achievable by EOD.
```

Rules:
- Show current ET time
- "NEXT UP" = first unchecked item with a concrete next action
- Be honest about what's achievable — if 4pm and 4 items left, say so

## Step 4: Handle Nick's Commands

**"check off N"** or **"mark N done"**:
1. Read the file
2. Find the Nth strike list item
3. Change `- [ ]` to `- [x]`
4. Write the file back
5. Confirm: "Checked off #N: <title>"

**"swap N and M"** or **"reorder"**:
1. Swap the items in the file
2. Renumber the `###` headers
3. Confirm the new order

**"add: <title>"**:
1. Add as next item in the strike list
2. Assign appropriate rank, size, owner
3. If >6 items, note which one got bumped to Backlog

**"drop N"**:
1. Remove from strike list
2. Move to Backlog section
3. Confirm

## Step 5: Suggest Reprioritization

If during the check you discover:
- A new blocker surfaced (Sentry spike, deploy failure, pipeline error)
- An item is blocked and can't progress
- Something completed that unlocks a bigger item

Proactively suggest reordering. Don't just report status — help Nick decide what to do next.

## Important

- **Never fabricate status.** If you can't verify, say "can't auto-verify — needs manual check."
- **Keep it tight.** Nick wants a 10-second glance, not a paragraph per item.
- **Update the file.** Every check-off or reorder writes back to the Todos file so the morning pipeline sees it tomorrow.
