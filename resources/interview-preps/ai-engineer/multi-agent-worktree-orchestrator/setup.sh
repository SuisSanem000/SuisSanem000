#!/usr/bin/env bash
# ==============================================================================
# Environment & Setup Automation (`setup.sh`)
# 16-Agent Git Worktree + OpenRouter Concurrency Orchestrator
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "==> [1/4] Verifying .gitignore configuration..."
for pattern in ".worktrees/" "node_modules/" "dist/" ".env"; do
  if ! grep -qxF "$pattern" .gitignore 2>/dev/null; then
    echo "$pattern" >> .gitignore
  fi
done

echo "==> [2/4] Verifying / initializing Git repository on branch 'main'..."
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b main
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
if [ "$CURRENT_BRANCH" != "main" ]; then
  git checkout -B main
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add .gitignore package.json tsconfig.json
  git commit -m "chore: initial commit on main"
fi

echo "==> [3/4] Installing TypeScript & tsx dependencies..."
if command -v npm >/dev/null 2>&1; then
  npm install
elif command -v bun >/dev/null 2>&1; then
  bun install
else
  echo "ERROR: Neither npm nor bun found on PATH." >&2
  exit 1
fi

# Ensure node/npx/npm shims exist inside node_modules/.bin if running on a Bun-only machine
mkdir -p "$SCRIPT_DIR/node_modules/.bin"
if ! command -v node >/dev/null 2>&1 && command -v bun >/dev/null 2>&1; then
  cat << 'EOF' > "$SCRIPT_DIR/node_modules/.bin/node"
#!/usr/bin/env bash
exec "$HOME/.bun/bin/bun" "$@"
EOF
  chmod +x "$SCRIPT_DIR/node_modules/.bin/node"
fi

if ! command -v npx >/dev/null 2>&1 && command -v bunx >/dev/null 2>&1; then
  cat << 'EOF' > "$SCRIPT_DIR/node_modules/.bin/npx"
#!/usr/bin/env bash
exec "$HOME/.bun/bin/bunx" "$@"
EOF
  chmod +x "$SCRIPT_DIR/node_modules/.bin/npx"
fi

echo "==> [4/4] Verifying TypeScript build..."
export PATH="$SCRIPT_DIR/node_modules/.bin:$PATH"
npx tsc --noEmit

echo ""
echo "✅ Setup complete! Quick commands:"
echo "   • Run 16-agent orchestrator (instant mock mode):  bun run dev -- --mock   (or npm run dev -- --mock)"
echo "   • Run 16-agent orchestrator (live OpenRouter):    OPENROUTER_API_KEY=... bun run dev"
echo "   • Inspect active worktrees:                       git worktree list"
echo "   • Clean worktrees & feature branches:             bun run clean           (or npm run clean)"

