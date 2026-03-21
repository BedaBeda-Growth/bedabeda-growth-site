# Strategic Objectives

Updated: 2026-03-21T17:56:58.589334+00:00

## Top Objectives

### 1. [REVENUE] Payment Works Everywhere
- Status: active
- Description: Any user, in any market, can pay in under 3 minutes. No processor, no country, no edge case blocks revenue. PAYMENT infrastructure — Rocket (Stripe/Xendit), Freely (DodoPay). Zero platform revenue until this works.
- Next: Review SSO PR, configure OAuth credentials (Nick — Google/LinkedIn dev console), merge. Then verify DodoPay 500 and Xendit test→prod swap.
- Last: Jules completed SSO implementation — SocialAuth.tsx, wired into Auth.tsx, unit + E2E tests. PR ready for review.
- Key Results:
  - [ ] All 3 processors (Stripe, DodoPay, Xendit) accepting live payments
  - [ ] New user in PH, US, and intl can complete payment with no manual intervention
  - [ ] Signup-to-paid in under 3 minutes end-to-end
  - [ ] Google + LinkedIn SSO live on login/signup pages
- Linked: fix-xendit-pricing, fix-dodopay-500, fix-subscription-management, pri-app-learner-signup-referral-20260309

### 2. [RETENTION] Community Is Stickier Than Any Feature
- Status: active
- Description: Users stay because of the people, not the product. Retention is driven by relationships, not features. Community IS the product — confirmed data: faces+community = 85% registration, features-first = 14.5%. Broken meetings kill retention.
- Next: Verify Jitsi callback fix landed -- check AUTO-20260320-fix-jitsi-callback-error status in heartbeat completions.
- Last: Closed stale spark-kanban UX PR #5 (90+ days old). Jitsi fix and meeting card verification still in progress via Jules.
- Key Results:
  - [ ] Meeting dates display correctly, timezone auto-detected, Jitsi JWT gate locked
  - [ ] Discord daily active members 200+
  - [ ] At least 5 City Leaders actively using Autopilot
  - [ ] Churn is measurably lower among community-engaged users
- Linked: err-cd6ca160, pri-104

### 3. [GROWTH] Every Happy User Recruits One More
- Status: active
- Description: The funnel feeds itself. Referral, virality, and word-of-mouth outpace paid acquisition. Each $30K Master Plan engine depends on self-sustaining growth loops. EMAIL BOUNDARY: Rocket = transactional only. spark-kanban = all marketing/nurture.
- Next: Nick reviews app PRs #12 and #20 (signup+referral). CI failures are Vercel Hobby plan limitation, not code. Merge order: #10 -> #12 -> #20.
- Last: Closed stale app analytics PR #8. App PRs #10, #12, #20 (signup+referral chain) all have Vercel Hobby plan CI failures -- not code issues. Flagged for Nick review since they touch signup flows.
- Key Results:
  - [ ] Referral credits live ($20-50 credits, viral loop active)
  - [ ] spark-kanban email pipeline sending 400-500/day to 4,600+ contacts
  - [ ] Ember demo mode accessible without signup
  - [ ] Day-0 nurture fires via spark-kanban (NOT Rocket)
  - [ ] Measurable viral coefficient > 0.5
- Linked: pri-ember-demo-mode-nurture-20260309, AUTO-20260315-spark-kanban-email-centralization

### 4. [INFRASTRUCTURE] Kai Runs the Machine
- Status: active
- Description: 80% of recurring ops — outreach, email, reporting, dispatch, monitoring — run without Nick's hands. Nick's lane: relationships, legal, strategic judgment only. Everything else is a machine problem. Attribution and funnel visibility are prerequisites.
- Next: Check Jules cloud-brain-nso-reporting-integration PR status. If merged, Nick deploys systemd units.
- Last: Priority Engine first run: closed 2 stale PRs, diagnosed CI failures across repos, identified 3 objective gaps without ledger coverage.
- Key Results:
  - [ ] Morning pipeline runs autonomously every day
  - [ ] Heartbeat CTOS completing 20+ tasks/day
  - [ ] Nick touches < 3 operational items/day
  - [ ] Daily attribution report generating automatically
  - [ ] Source tracking on all signup paths — funnel health in morning boot
  - [ ] Rule governance digest in warm start
- Linked: fix-rules-db-warm-start-ref

### 5. [REVENUE] Companies Get Skills From Us in Under 90 Seconds
- Status: active
- Description: Any company that lands in our flow can understand what we do, choose a relevant skill, and receive clear value in under 90 seconds. No confusion, no dead-end onboarding, no manual explanation required. This is the fastest proof-of-value path for B2B adoption.
- Next: Define the exact 90-second path: landing page, qualification step, skill selection, delivery method, and measurement points.

### 6. [AWARENESS] Top of Funnel Is Always Full
- Status: active
- Description: Brand, podcast, City Leaders, and content keep awareness flowing continuously. The machine is always fed. Without top-of-funnel, the conversion machine starves. Awareness must be a system, not an event.
- Next: Pull Bad Ideas episode status from Gerald. Check Cyril City Leader outreach count. Confirm March promo LP status.
- Last: NSO-05 queued: Director task created to surface content pipeline gaps and City Leader status.
- Key Results:
  - [ ] Podcast episodes publishing on schedule
  - [ ] Social posts automated (not manual)
  - [ ] March promo LP live with tracking
  - [ ] 26 City Leaders activated — each is a multiplier
  - [ ] Townhall 800-1,200 reach per event

### 7. [LEVERAGE] Zero Human Barriers Mid-Execution
- Status: active
- Description: Humans are only injected at the final publish/deploy gate. Machines decide HOW to execute — always. Speed is 90% of our objective. Human decision points mid-flow are structural drag. The 10% human steering happens at the gate, not in the middle.
- Next: Regenerate or verify the live 2026-03-18 content queue through the scheduled fresh_start.py path without overwriting useful manual edits, and resolve why AUTO-20260318-fresh-start-refactor does not persist as a stable work_ledger item.
- Last: Checkpoint on AUTO-20260318-fresh-start-refactor: smoke-tested TodayBrain -> discovery-only content fetch -> reply composer flow in isolation; fixed env bootstrap regression in content_pipeline config; polished new content-queue format; verified kai-brain stdio reconnect and warm-start path after RULES_DB cleanup.
- Key Results:
  - [ ] No skill or plan has a human approval step except at the final deploy gate
  - [ ] Every workflow that previously required mid-execution human input is redesigned
  - [ ] Rule ops-no-human-mid-execution promoted from simulate after 14 days
  - [ ] Evaluator fires on any mid-flow human gate pattern detected

## Backlog

- [ ] Client Relationships Are Grounded in Mutual Accountability — Every client can see every request they've made and every delivery we've made against it — in real time, permanently. Re

## Completed

- [x] Unblock Checkout (TASK — migrated to NSO-01) (2026-03-17)
- [x] Signup-to-Paid Conversion (TASK — migrated to NSO-01) (2026-03-17)
- [x] Ember Demo + Day-0 Nurture (TASK — migrated to NSO-03) (2026-03-17)
- [x] Email Nurture Engine (TASK — migrated to NSO-03) (2026-03-17)
- [x] Meeting & Community UX (TASK — migrated to NSO-02) (2026-03-17)
- [x] City Leader Activation + Autopilot (TASK — migrated to NSO-02) (2026-03-17)
- [x] Outreach Automation (TASK — migrated to NSO-03) (2026-03-17)
- [x] Attribution + Funnel Visibility (TASK — migrated to NSO-04) (2026-03-17)
- [x] Kai Ops Infrastructure (TASK — migrated to NSO-04) (2026-03-17)
- [x] Content & Brand Engine (TASK — migrated to NSO-05) (2026-03-17)
