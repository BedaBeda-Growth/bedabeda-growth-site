---
name: checkout-my-blog
description: Review and craft Nick's blog drafts. Reads his stream of thought (or today's blog-outline.md), calibrates against his voice, and returns a polished version. Use when Nick says "checkout my blog", "review my draft", "help me write this post", "polish this article", or pastes raw blog content.
---

# Checkout My Blog

## Step 1: Get the Draft

Check for input in this order:
1. If Nick pasted text directly, use that.
2. Otherwise read today's blog outline: `~/Desktop/Rocket/Articles/{YYYY-MM-DD}/blog-outline.md`
3. If neither exists, ask Nick to paste the draft or confirm the date.

## Step 2: Read the Voice Guide

Read `references/voice.md` before doing anything to the draft. This is the calibration standard. Do not skip it.

## Step 3: Craft the Draft

Apply the voice rules from `references/voice.md`:

- No em dashes (—). Fix every one.
- Active voice. Kill passive constructions.
- Strong first line. If it is weak, rewrite it.
- Lead with the point. Move buried insights to the top.
- Cut filler openers and soft transitions.
- Short sentences. Split anything over 30 words that can be split cleanly.

Preserve Nick's ideas and angles exactly. Only improve the delivery, not the argument.

## Step 4: Return Output

Return:
1. The polished draft in full.
2. A short **"Changes made"** section (3-5 bullets) summarizing what was fixed and why.

If the draft is already clean, say so briefly and return it unchanged.
