#!/usr/bin/env bash
# Fix git hooks that are blocking commits
# This script provides multiple options to resolve hook issues

set -e

cd "$(dirname "$0")/../.."  # Go to monorepo root

echo "🔧 Git Hooks Fix Utility"
echo "========================="
echo ""

# Check if hooks exist
if [ ! -f ".git/hooks/pre-commit" ] && [ ! -f ".git/hooks/pre-commit.disabled" ]; then
    echo "✅ No pre-commit hooks installed - commits should work"
    exit 0
fi

echo "Found git hooks. Choose an option:"
echo ""
echo "1) Disable hooks temporarily (recommended for now)"
echo "2) Remove hooks completely"
echo "3) Try to fix hooks (requires pre-commit installation)"
echo "4) Check hook status"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🔧 Disabling hooks temporarily..."
        [ -f ".git/hooks/pre-commit" ] && mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
        [ -f ".git/hooks/pre-push" ] && mv .git/hooks/pre-push .git/hooks/pre-push.disabled
        echo "✅ Hooks disabled. You can now commit with: git commit -m 'Your message'"
        echo "ℹ️  To re-enable: mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit"
        ;;
    2)
        echo "🗑️  Removing hooks completely..."
        rm -f .git/hooks/pre-commit .git/hooks/pre-push
        echo "✅ Hooks removed. You can now commit normally."
        ;;
    3)
        echo "🔧 Attempting to fix hooks..."
        if command -v pre-commit &> /dev/null; then
            cd backend
            pre-commit install
            pre-commit install --hook-type pre-push
            echo "✅ Hooks reinstalled"
        else
            echo "❌ pre-commit not found. Install with: pip install pre-commit"
            exit 1
        fi
        ;;
    4)
        echo "📊 Hook Status:"
        echo ""
        if [ -f ".git/hooks/pre-commit" ]; then
            echo "✅ pre-commit hook: ACTIVE"
        elif [ -f ".git/hooks/pre-commit.disabled" ]; then
            echo "⏸️  pre-commit hook: DISABLED"
        else
            echo "❌ pre-commit hook: NOT INSTALLED"
        fi

        if [ -f ".git/hooks/pre-push" ]; then
            echo "✅ pre-push hook: ACTIVE"
        elif [ -f ".git/hooks/pre-push.disabled" ]; then
            echo "⏸️  pre-push hook: DISABLED"
        else
            echo "❌ pre-push hook: NOT INSTALLED"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Done! 🎉"
