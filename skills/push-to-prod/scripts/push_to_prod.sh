#!/usr/bin/env bash
# push_to_prod.sh — Push a fully verified branch to production
# Usage: ./push_to_prod.sh [--dry-run]
#
# Steps:
#   1. Push current branch to origin (preserve work)
#   2. Switch to prod env (switch-env.sh prod)
#   3. Merge current branch into main locally
#   4. Apply Supabase migrations to prod DB (supabase db push --include-all)
#   5. Push main to origin

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE — no changes will be made"
fi

run() {
  echo "▶ $*"
  if [[ "$DRY_RUN" == "false" ]]; then
    "$@"
  fi
}

# ─── Preflight ───────────────────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "main" ]]; then
  echo "❌ You are already on main. Run this from your feature/ci-testing branch."
  exit 1
fi

echo ""
echo "🚀 push-to-prod — Branch: $BRANCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Step 1: Preserve branch ─────────────────────────────────────────────────
echo ""
echo "📦 Step 1 — Preserving branch to origin..."
run git add -A
if ! git diff --cached --quiet; then
  run git commit -m "chore: preserve branch before prod push"
fi
run git push origin HEAD
echo "✅ Branch pushed."

# ─── Step 2: Switch to prod env ──────────────────────────────────────────────
echo ""
echo "🔄 Step 2 — Switching to prod environment..."
SWITCH_ENV_SCRIPT=""
for loc in "./switch-env.sh" "./scripts/switch-env.sh"; do
  if [[ -f "$loc" ]]; then
    SWITCH_ENV_SCRIPT="$loc"
    break
  fi
done

if [[ -z "$SWITCH_ENV_SCRIPT" ]]; then
  echo "❌ Cannot find switch-env.sh (checked ./switch-env.sh and ./scripts/switch-env.sh)"
  exit 1
fi

run bash "$SWITCH_ENV_SCRIPT" prod
echo "✅ Env switched to prod."

# ─── Step 3: Merge branch into local main ────────────────────────────────────
echo ""
echo "🔀 Step 3 — Merging $BRANCH into main locally..."
run git fetch origin main
run git checkout main
run git pull origin main --ff-only || {
  echo "⚠️  Fast-forward failed. Attempting standard merge..."
  run git merge origin/main --no-edit
}
run git merge "$BRANCH" --no-edit

if [[ "$DRY_RUN" == "false" ]]; then
  CONFLICTS=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
  if [[ -n "$CONFLICTS" ]]; then
    echo ""
    echo "⚠️  Merge conflicts detected in:"
    echo "$CONFLICTS"
    echo ""
    echo "Resolve conflicts, then run:"
    echo "  git add -A && git commit"
    echo "  supabase db push --include-all"
    echo "  git push origin main"
    exit 2
  fi
fi
echo "✅ Merged into main."

# ─── Step 4: Supabase DB push ────────────────────────────────────────────────
echo ""
echo "🗄️  Step 4 — Applying migrations to production DB..."
run supabase db push --include-all

if [[ $? -ne 0 ]]; then
  echo ""
  echo "❌ Migration failed. Investigate above output."
  echo "   If there are conflicts, resolve them in the migration files and retry."
  exit 3
fi
echo "✅ Migrations applied."

# ─── Step 5: Push main to origin ─────────────────────────────────────────────
echo ""
echo "📤 Step 5 — Pushing main to origin..."
run git push origin main
echo "✅ Pushed to origin/main."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  push-to-prod COMPLETE"
echo "    Branch \"$BRANCH\" is now merged and live on main."
