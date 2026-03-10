---
name: run-qa-loop
description: Execute BedaBeda Growth front-end QA runs using Playwright VRT and visual inspections. Use this to execute visual fixes, test responsive behaviors, standardize shared styling, and close visual regressions without breaking aesthetic quality or existing desktop/mobile invariants.
---

# BedaBeda Growth: Run QA Loop

Use this skill for front-end implementation work and layout changes on the BedaBeda Growth Astro site. 

## Required Outcome

The site must consistently pass a more locked-down, visually premium state after completion:

- Approved fixes/layouts implemented cleanly.
- Visual regressions caught with automated tools (Playwright VRT).
- No new inline-style or messy per-page override debt introduced.
- Strict checks on both Desktop and Mobile layout behaviors.

## Operating Rules

- **Visual result is the primary gate.** Code clarity is important, but preventing visual regressions is critical constraint #1.
- **Do not auto-approve Playwright VRT baselines.** If a baseline changes, verify the change is visually flawless across viewports *before* updating snapshots with `--update-snapshots`.
- **Desktop & Mobile Execution:** Any visual change must be validated simultaneously on distinct Mobile (e.g., Pixel 5 / iPhone 14 Pro) and Desktop Chrome viewports.
- **Do not treat broad code-style cleanup as a win if it breaks the rendered result.**
- Do not silently bypass failing rules or tests. 
- Always ensure visual aesthetics heavily match BedaBeda's "Premium, High-Growth" branding (colors, typography, padding/spacing).

## Execution Workflow

### 1. Scope the Run

- Extract the approved visual/UI fixes you need to perform.
- Separate them into:
  - Immediate execution items.
  - Items needing further clarification on aesthetic choice.

### 2. Inspect Current Implementation

- Read the relevant React/Astro components and shared Tailwind configurations (`tailwind.config.ts`, `globals.css` if applicable).
- Look for where spacing, flex properties, or mobile breakpoints (`md:`, `lg:`) apply.
- Inspect the current VRT tests (`tests/vrt.spec.ts`) before editing them or consolidating them.

### 3. Plan the Minimal Durable Change

- Prefer modifying shared components over duplicating one-off Tailwind classes page-by-page.
- Respect existing variables and the overarching design harmony. 
- When possible, prefer standard scaling values for padding/margins over arbitrary `[13px]` wrappers.

### 4. Implement the Fixes

- Apply the approved UI fixes.
- Keep HTML and CSS class changes aligned with the existing premium styling template.
- Test responsive wrapping (e.g. mobile stacking logic).

### 5. Run the QA Gates

Run the relevant gates in this order:

1. **Wait for dev server compiling / Astro Build:** Make sure Astro completes reloading with `npm run dev` or run `npm run build` locally.
2. **Visual Spec Execution:** Run Playwright VRT `npx playwright test`. If it flags a diff, retrieve and observe the failed snapshot diffs before dismissing.
3. **Contrast Checks:** Ensure any color permutations strongly satisfy WCAG contrast lines.
4. **Targeted Subagent Visual Check:** Optionally spin up a final browser subagent pass to simulate human scroll behavior on sticky headers, lazy-load items, and modals.

### 6. Close the Run Properly

Do not finish with only code changes. Finish with:
- The implemented visual fixes explicitly detailed.
- Verification results from Playwright VRT.
- A concise summary of what was protected and any manual checks run on mobile/desktop via subagents.
