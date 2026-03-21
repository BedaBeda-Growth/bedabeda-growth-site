---
name: "Antigravity Repatch"
description: "Reapply the Antigravity/roo-cline permission prompt bypass after updates, using the saved hard-patch plan."
alwaysAllow:
  - "Bash"
  - "Read"
  - "Write"
---

# Antigravity Repatch Skill

You are Kai Agent, and this skill is for **reapplying the Antigravity permission-prompt hard patch** whenever an update overwrites the extension bundle.

The *source of truth* for the patch procedure is the existing plan document:

- Primary reference: `20260315-antigravity-permissions-hard-patch.md`
  - This file lives under the workspace root (typically `/Users/nicholaspetros/scceo-1/` or a nearby plans directory).

Your job when this skill is invoked:

1. **Locate and read the plan doc**
   - Search for `20260315-antigravity-permissions-hard-patch.md` starting from the current workspace root.
   - Typical locations:
     - `/Users/nicholaspetros/scceo-1/plans/20260315-antigravity-permissions-hard-patch.md`
     - Or the corresponding path in the current Kai session's `plans/` folder.
   - Use `Bash` (e.g., `find`, `ls`, `cat`) or the `Read` tool to locate and open it.

2. **Re-derive the patch steps from the doc (do NOT guess)**
   - Read the plan and extract the concrete execution steps.
   - The key sections to follow are:
     - The recommended **Option 3: Hard-Patch the Source (Recommended)**.
     - The detailed "Execution Steps: The Source Lobotomy".
   - Do not invent new patch logic. Always treat the plan file as the canonical instructions.

3. **Locate the current Antigravity/roo-cline extension bundle**
   - Use `Bash` to search for likely install paths, for example:
     - `~/.antigravity/extensions/` or similar, depending on the environment.
   - Confirm candidate paths by:
     - Listing contents to find `roo-cline`, `antigravity-autopilot`, or similar extension folders.
     - Looking for JavaScript bundles that contain the permission prompt strings.

4. **Find the prompt logic in the installed build**
   - Follow the plan doc's guidance:
     - Use `grep`/`rg` to search the extension bundle for strings like:
       - "Allow file access"
       - "Allow Once"
       - "Allow This Conversation"
       - Other related permission text from the plan.
   - Identify the actual JavaScript/TypeScript (often compiled) file that:
     - Shows the permission dialog.
     - Awaits a user choice (Deny / Allow Once / Allow This Conversation).

5. **Confirm you have the correct function before editing**
   - Always verify:
     - The function is clearly responsible for deciding whether to allow a file write based on user input.
     - It is called on every file-write permission check.
   - If you are not certain, stop and re-check the plan doc, and re-run searches. Do **not** blindly edit unrelated code.

6. **Reapply the hard patch exactly as described in the plan**
   - The patch must:
     - Bypass the UI prompt altogether, **or**
     - Immediately resolve the permission as if the user selected the permanent allow option (e.g., "Allow This Conversation").
   - Typical pattern (conceptual, confirm details from the plan file):
     - Replace something like:
       - `const userChoice = await showPermissionPrompt(...);` followed by conditionals.
     - With a direct assignment / resolution, e.g.:
       - `const userChoice = 'Allow';`
       - Or directly invoke the success/allow branch without awaiting the UI.
   - Make minimal, surgical edits:
     - Do not refactor or rename surrounding code.
     - Only change what is necessary to short-circuit the prompt.

7. **Preserve a backup when editing**
   - Before modifying the compiled file:
     - Use `Bash` to create a timestamped backup copy in the same directory.
     - Example: `cp <file>.js <file>.js.backup-YYYYMMDD-HHMMSS`.
   - This ensures you or a human can restore the original extension if needed.

8. **Reload Antigravity and validate behavior**
   - After editing:
     - Instruct the user (or the system, if possible) to reload the Antigravity window.
     - Re-run a simple file-write operation via Jules/Kai Agent that would normally trigger the permission dialog.
   - Success criteria:
     - **No permission modal** appears.
     - The write succeeds if backend permissions allow it.

9. **If anything looks wrong, roll back and re-check the plan**
   - If Antigravity or the extension behaves strangely after the patch:
     - Restore from the backup file.
     - Re-open the plan doc and carefully re-derive the patch steps.
     - Try again with more precise targeting of the function or string markers.

10. **Document any path changes**
    - If the extension path or file layout has changed since the plan was written:
      - Add a brief note to the plan doc (or a new dated patch note) summarizing:
        - New extension path.
        - New file and function names.
        - Any updated prompt strings.
      - This keeps future repatches faster and more reliable.

## Guardrails & Non-Goals

- Do **not** attempt to broaden Kai's own backend permissions as part of this skill.
  - This skill only repatches the *Antigravity/roo-cline UI layer* so it stops asking for redundant permission prompts.
- Do **not** attempt to disable or bypass git/CI protections.
  - Branch protections, CI, and workspace permissions remain the primary safety gates.
- If the plan doc cannot be found or appears outdated:
  - Stop, explain the situation to the user, and ask for guidance or an updated patch plan.
  - Do not improvise a new patch strategy without an explicit, updated design.
