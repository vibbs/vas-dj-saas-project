#!/usr/bin/env bash
# Setup script for pre-commit hooks
# This installs all required dependencies and configures git hooks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up pre-commit hooks...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Step 1: Install Python dependencies
echo -e "${BLUE}📦 Installing Python formatting tools...${NC}"

if command -v uv &> /dev/null; then
    echo "Using uv (fast installer)"
    uv pip install black isort ruff pre-commit
elif command -v pip &> /dev/null; then
    echo "Using pip"
    pip install black isort ruff pre-commit
elif command -v pip3 &> /dev/null; then
    echo "Using pip3"
    pip3 install black isort ruff pre-commit
else
    echo -e "${RED}❌ Error: No pip found. Please install Python first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python tools installed${NC}"
echo ""

# Step 2: Install pre-commit hooks
echo -e "${BLUE}🪝 Installing git hooks...${NC}"

if command -v pre-commit &> /dev/null; then
    pre-commit install
    pre-commit install --hook-type pre-push
    echo -e "${GREEN}✅ Git hooks installed${NC}"
else
    echo -e "${YELLOW}⚠️  pre-commit command not found${NC}"
    echo "Hooks will run via manual script instead"
fi

echo ""

# Step 3: Verify installation
echo -e "${BLUE}🔍 Verifying installation...${NC}"

missing=()
if ! command -v black &> /dev/null && ! python3 -c "import black" &> /dev/null; then
    missing+=("black")
fi
if ! command -v isort &> /dev/null && ! python3 -c "import isort" &> /dev/null; then
    missing+=("isort")
fi
if ! command -v ruff &> /dev/null; then
    missing+=("ruff")
fi

if [ ${#missing[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All tools installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Some tools still missing: ${missing[*]}${NC}"
    echo "You may need to restart your terminal or add tools to PATH"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test hooks: make pre-commit-check"
echo "  2. Make a commit: git commit -m 'Your message'"
echo "  3. Read guide: cat PRE-COMMIT-GUIDE.md"
echo ""
echo "To skip hooks: git commit --no-verify"
