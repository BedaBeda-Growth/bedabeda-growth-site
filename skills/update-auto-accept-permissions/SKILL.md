---
name: update-auto-accept-permissions
description: Use this skill when the user encounters a "bump" or wants to automatically approve certain file types, paths, or keywords using the Antigravity Auto Accept plugins. It updates the user's settings.json to expand trusted paths, whitelist file types, or add keywords.
ruleDomains:
  - ops
---

# Update Auto Accept Permissions

This skill helps you seamlessly update the user's Antigravity Auto Accept configurations when they want to bypass manual approval prompts for specific repetitive workflows, directories, or file formats.

When the user asks to "update permissions", "whitelist a path", or "add an auto-accept keyword", follow these direct steps:

1. **Locate settings.json:**
   The settings file is universally located at:
   `/Users/nicholaspetros/Library/Application Support/Antigravity/User/settings.json`

2. **Target JSON Properties:**
   The configuration properties that control the auto-accept behavior are defined under two namespaces to support both the `pesosz` and `kioksiot` extensions. You must always maintain parity between them.
   
   The relevant arrays to target are:
   - `autoAcceptFree.trustedPaths` AND `antigravity-autopilot.trustedPaths`
   - `autoAcceptFree.whitelistFileTypes` AND `antigravity-autopilot.whitelistFileTypes`
   - `autoAcceptFree.keywords` AND `antigravity-autopilot.keywords`
   - `autoAcceptFree.bannedCommands` AND `antigravity-autopilot.bannedCommands`

3. **Execution Guidelines:**
   - Use the `replace_file_content` or `multi_replace_file_content` tool to add the requested values to the appropriate JSON arrays.
   - Do NOT overwrite the entire file; carefully target and replace only the localized lists.
   - For paths, standard glob patterns (e.g., `/Users/nicholaspetros/new-project/**`) are acceptable.
   - For file types, include the leading dot (e.g., `.ts`, `.md`).

4. **Completion:**
   Once successfully saved, briefly inform the user what was added and confirm that the change takes effect immediately (so they can keep moving past the bump!).
