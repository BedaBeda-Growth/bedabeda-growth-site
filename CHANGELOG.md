# Changelog

## 2026-03-12 — UI Fixes

### Links & Navigation
- **Header nav:** Services and Contact links now route to `/services` and `/contact`
- **Footer nav:** Services, Contact, Privacy Policy, and Terms of Service all wired correctly
- **Footer social:** Twitter → `https://x.com/bedabedagrowth`, LinkedIn → `https://www.linkedin.com/company/bedabedagrowth`

### CTAs
- **"Traditional CRO is broken" section:** CTA now links to `/services` (fixed hydration issue by replacing `Button asChild` with `buttonVariants` anchor)
- **Case Studies section:** "Get Results Like These" CTA now links to `https://calendly.com/kanika-misra`

### Visual
- **"Our Difference?" section:** SVG connector lines between WE/THEY boxes re-aligned with pixel-perfect positioning on desktop
- **Favicon:** Updated from Lovable default to BBG logo

### QA
- Added 11 new visual rules to `qa/visual-rules.json` covering all link targets
- Updated VRT baselines for desktop and mobile
