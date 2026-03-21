---
name: "Update QA Rules"
description: "Update the QA rules for the current repository and ensure business constraints are documented."
alwaysAllow:
  - Bash
  - Read
globs:
  - "**/*"
ruleDomains:
  - ops
---

# Update QA Rules

Use this skill whenever the user asks to add, remove, or modify a QA rule, or mandate a specific behavior (e.g., "all emails must come from X").

## Workflow

1. **Locate the Rules:** Find the active QA rules document in the current repository (usually `.agents/workflows/qa-rules.md` or `.agents/workflows/rules.md`).
2. **Review Current Rules:** Read the file to understand the existing format and structure (typically markdown tables tracking the rule description, checks, and test coverage).
3. **Draft the Update:** Create a clear, concise addition or modification that accurately enforces the user's business constraint. Include instructions on how to validate the rule programmatically or manually.
4. **Apply Change:** Use your file editing tools to add the rule to the QA rules document. 
5. **Report:** Provide a brief summary to the user indicating the rule has been added and how it will be verified going forward.
