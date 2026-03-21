---
name: "Draft Content"
description: "Draft LinkedIn essays and tweet replies in Nick's voice. Reads today's blog outline and content queue from Obsidian, applies brand/style rules, outputs ready-to-use drafts."
ruleDomains:
  - growth
---

# Draft Content Skill

Use this skill when Nick asks to draft, write, or jam on content — LinkedIn posts, tweet replies, article shares, or any social copy.

## Step 1 — Read Today's Source Material

Always start by reading the relevant files for today's date (YYYY-MM-DD = current date):

- **Blog outline:** `~/Desktop/Rocket/Articles/YYYY-MM-DD/blog-outline.md`
- **Content queue:** `~/Desktop/Rocket/Articles/YYYY-MM-DD/content-queue.md`
- **Voice profile (reference):** `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/linkedin_voice_profile.json`

If no date is specified, default to today's date. If a blog outline exists, use it as the primary source. If Nick pastes raw content directly into chat, use that instead.

## Step 2 — Identify What's Being Drafted

Ask or infer from context:
- **LinkedIn essay** (long-form, 600-900 words)
- **Tweet replies** (from "My Take" sections in content queue)
- **Article share tweets** (from "Articles to Share" section)
- **Both** (full content day)

If the blog outline has a freeform brain dump, offer to shape it into a LinkedIn essay first, then ask if they want tweets too.

## Step 3 — Draft Following These Rules

### Identity Anchor (NEVER changes)

- Nick Petros, founder of Rocket and Freely
- **Rocket** teaches professionals how to become fractional experts — package expertise, find clients, operate independently
- **Freely** is a skills-based blind hiring platform — companies hire by skill/approach, not resume or pedigree
- Nick's worldview: workforce is shifting toward fractional and independent work; AI accelerates this by letting one person operate like a team
- Nick speaks about AI as a **user and operator**, never as a builder selling AI services — no positioning as technical AI expert or automation company

### Formatting Rules (Hard)

- **NEVER use em-dashes ( — )** — replace with a comma, period, or rewrite the sentence
- Short paragraphs — 3-4 lines max, often 1-2 sentences
- No bullet lists inside LinkedIn essays — flowing paragraphs only
- Section breaks with `---` are fine for LinkedIn essays
- Under 800 words for LinkedIn posts
- Always end with a single open-ended question to drive comments
- No CTAs or "DM me" in the body of any post

### Voice Rules

**Never say:**
- "Yeah," (never open with this)
- "unlimited horsepower"
- "That's true leverage" / "dramatically cheaper"
- "In the near term, people are going to realize"
- "move as fast as you can think"
- "expand that to-do list"
- "When you understand that you have access to that kind of power"
- "to your life"
- Anything that sounds like guru/motivational speaker energy

**Always do:**
- Use declarative, punchy openers — make the first line a claim, not a setup
- Use concrete, personal examples from Nick's actual work (Rocket, Freely, specific numbers when available)
- One metaphor max per post — prefer the Ferrari/grocery-store frame when it fits
- End with a question that invites a real answer, not just engagement bait
- Peer-to-peer tone — talking to an equal, not advising downward
- Speak from experience, not theory

**Core themes to thread through:**
- Execution is getting cheap; judgment/taste/steering is the premium
- Fractional work = zone of expertise across multiple companies
- AI handles what's inside the edge; humans create what's on the outside
- Skills over resumes; proving ability over narrating it
- Portfolio careers / income = distribution
- Age of velocity — slow hirers get left behind

### LinkedIn Essay Structure

Hook (contrarian claim, 2-3 sentences)
→ Tension or proof (personal example or observed reality)
→ Framework (the repeatable insight)
→ Implication (what's at stake)
→ Personal story or builder note (what Nick is actually doing about it)
→ Question (one clean close)

### Tweet Reply Structure

Keep replies under 280 characters when possible. If it needs 2 tweets, split cleanly.
- Lead with the sharpest agreement or reframe
- Add one new idea the original didn't say
- Optional: tie back to Rocket or Freely naturally (never forced)
- End with a question if there's room

### Article Share Tweets

- Lead with Nick's contrarian take on the article (1-2 sentences)
- Don't summarize — add a new angle
- Include the article URL
- Optional quote card note at end: `[quote card: "..."]` if there's a strong 1-liner

## Step 4 — Output

For LinkedIn essays: output the full post as clean text, no JSON wrapper. Note word count at the bottom.

For tweets: output each tweet as a numbered block, labeled by target handle or article title.

For both: output LinkedIn first, then tweets.

## Step 5 — GATE: Present Drafts, Wait for Nick's Approval

**NEVER run `schedule` or push to Typefully without Nick's explicit go-ahead.**

After writing all drafts:

1. **Scan for em dashes** before showing anything. Run:
   `grep -n "—" ~/Desktop/Rocket/Articles/YYYY-MM-DD/content-queue.md`
   Fix any found in My Take or Ready-to-Post sections. Em dashes in `**Suggested angle:**` metadata are not published and can stay.

2. **Present a summary to Nick:**
   - How many items drafted
   - How many skipped (and why: under 500 views / duplicate angle / no genuine take)
   - The top 2-3 takes you're most confident in
   - Any takes that felt forced or generic (flag them honestly)

3. **Say explicitly:** "Drafts are in Obsidian. Review and edit in the content-queue.md, then tell me to run `schedule` when ready."

4. **Wait.** Do not run `schedule` autonomously. Nick may want to rewrite, kill, or add his own live reactions before anything goes to Typefully.

The drafts are Kai's voice approximation. Nick's live takes and reactions are the real content. The gate exists to keep that collaborative.

---

## What NOT to Do

- Do not invent stats, company names, or examples not found in the source material
- Do not describe Rocket as an automation company, AI company, or dev agency
- Do not mention more than two AI tools by name in a single post
- Do not add em-dashes anywhere. This is a hard rule, not a style preference.
- Do not pad to hit a word count. If the idea is said, stop.
- **Do not run `schedule` without Nick's approval.** Writing drafts and publishing them are two separate steps.

## Obsidian File Locations Reference

| File | Path |
|------|------|
| Today's blog outline | `~/Desktop/Rocket/Articles/YYYY-MM-DD/blog-outline.md` |
| Today's content queue | `~/Desktop/Rocket/Articles/YYYY-MM-DD/content-queue.md` |
| LinkedIn drafts folder | `~/Desktop/Rocket/LinkedIn/` |
| Saved LinkedIn drafts | `~/Desktop/Rocket/LinkedIn/YYYY-MM-DD-draft.md` |
| Voice profile (X) | `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/voice_profile.json` |
| Voice profile (LinkedIn) | `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/linkedin_voice_profile.json` |
| Brand voice template | `/Users/nicholaspetros/scceo-1/grok-personal/content_pipeline/brand_voice_template.md` |
