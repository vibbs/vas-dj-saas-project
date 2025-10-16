# Git Hooks Troubleshooting Guide

## Quick Fix: Commit Blocked by Pre-commit Hooks

### 🚀 Fastest Solution

If your commit is blocked, run this ONE command:

```bash
make pre-commit-setup
```

This installs all required tools (black, isort, ruff, pre-commit) and configures hooks.

---

## Common Error Messages

### Error: "Git: black...Failed"

**Cause**: The `black` code formatter is not installed.

**Solutions**:

```bash
# Option 1: Full setup (recommended)
make pre-commit-setup

# Option 2: Manual install
pip install black isort ruff

# Option 3: Skip hooks for this commit (not recommended)
git commit --no-verify -m "Your message"
```

---

### Error: "Django system check failed"

**Cause**: Django environment not properly configured.

**Solutions**:

```bash
# Option 1: Check Django status
make check-system

# Option 2: Start backend services
make start

# Option 3: Check environment variables
cat .env

# Option 4: Skip Django checks (not recommended)
SKIP=django-smart-check git commit -m "Your message"
```

---

### Error: "Missing migrations detected"

**Cause**: Model changes require new migrations.

**Solutions**:

```bash
# Option 1: Auto-create migrations (recommended)
AUTO_FIX=true ./scripts/pre-commit-helper.sh
# Then commit normally

# Option 2: Manual migrations
python manage.py makemigrations
git add apps/*/migrations/*.py
git commit -m "Your message"

# Option 3: Skip migration check (DANGEROUS)
SKIP=django-migrations git commit -m "Your message"
```

---

### Error: "pre-commit: command not found"

**Cause**: Pre-commit package not installed.

**Solutions**:

```bash
# Option 1: Full setup
make pre-commit-setup

# Option 2: Manual install
pip install pre-commit
make pre-commit-install

# Option 3: Use smart check instead
make pre-commit-check
```

---

## Understanding the Error Log

When hooks fail, a detailed log is saved here:

```bash
cat .git/pre-commit-errors.log
```

The log contains:
- Exact error messages
- Files that caused issues
- Tool output (black, isort, ruff)
- Django check results

---

## Bypassing Hooks (Use Carefully)

### Skip All Hooks

```bash
git commit --no-verify -m "Your message"
```

**⚠️ Warning**: This skips ALL checks. Use only when:
- You're committing non-code files (docs, configs)
- Hooks are broken and blocking urgent fixes
- You're in a WIP branch

### Skip Specific Hooks

```bash
# Skip Django checks only
SKIP=django-smart-check git commit -m "Your message"

# Skip black formatting only
SKIP=black git commit -m "Your message"

# Skip multiple hooks
SKIP=black,isort,ruff git commit -m "Your message"
```

---

## Verifying Hook Setup

### Check if tools are installed

```bash
# Check black
black --version
# OR
python3 -c "import black; print(black.__version__)"

# Check isort
isort --version

# Check ruff
ruff --version

# Check pre-commit
pre-commit --version
```

### Test hooks manually

```bash
# Run all hooks
make pre-commit-run

# Run smart check with auto-fix
make pre-commit-check

# Run smart check without auto-fix
make pre-commit-check-manual
```

---

## VSCode-Specific Issues

If you're seeing git commit errors in VSCode:

1. **View the error log**:
   - Click "Show Command Output" in the error dialog
   - OR check: `.git/pre-commit-errors.log`

2. **Common VSCode issues**:
   - VSCode uses a different Python environment
   - Tools installed in terminal may not be in VSCode's PATH

3. **Solutions**:
   ```bash
   # Install globally (not in venv)
   pip install --user black isort ruff pre-commit

   # OR restart VSCode after installation
   # OR commit via terminal instead
   ```

---

## Installation Paths

After running `make pre-commit-setup`, verify installations:

```bash
# Check where tools are installed
which black
which isort
which ruff
which pre-commit

# Check Python can import them
python3 -c "import black, isort; print('✅ Tools available')"
```

If tools are not found, add to PATH:

```bash
# For pip user installs
export PATH="$HOME/.local/bin:$PATH"

# For Homebrew Python
export PATH="/opt/homebrew/bin:$PATH"

# Add to ~/.zshrc or ~/.bashrc for permanent fix
```

---

## Understanding Hook Behavior

### What runs automatically

When you run `git commit`, these hooks execute:

1. **Formatting** (non-blocking if tools missing):
   - Black: Code formatting
   - isort: Import sorting
   - Ruff: Linting with auto-fix

2. **Django checks** (blocking):
   - System check: Validates Django configuration
   - Migration check: Detects missing migrations

3. **File checks** (always runs):
   - Trailing whitespace removal
   - End-of-file fixes
   - YAML/JSON validation

### Auto-fix vs Blocking

| Check | Auto-Fix | Blocks Commit | Requirement |
|-------|----------|---------------|-------------|
| Black formatting | ✅ Yes | ❌ No | Optional |
| isort | ✅ Yes | ❌ No | Optional |
| Ruff | ✅ Yes | ❌ No | Optional |
| Django system | ❌ No | ✅ Yes | Required |
| Migrations | ✅ Yes* | ⚠️ Yes* | Required |

*Migrations auto-fix with `AUTO_FIX=true`

---

## Getting Help

### Check these resources

1. **Pre-commit Guide**: `backend/PRE-COMMIT-GUIDE.md`
2. **Project docs**: `backend/CLAUDE.md`
3. **Main README**: `backend/README.md`
4. **Error log**: `.git/pre-commit-errors.log`

### Still stuck?

Run these diagnostic commands:

```bash
# Check Python
python3 --version

# Check pip
pip --version

# Check git
git --version

# Check current branch
git status

# Check staged files
git diff --cached --name-only

# Check Django
python manage.py check

# Check for missing migrations
python manage.py makemigrations --check --dry-run
```

---

## Best Practices

### ✅ Do This

- Run `make pre-commit-setup` once during project setup
- Review auto-generated migrations before committing
- Use `make pre-commit-check` to test hooks before committing
- Read error logs when hooks fail

### ❌ Avoid This

- Don't use `--no-verify` by default
- Don't commit without reviewing migrations
- Don't ignore Django system check failures
- Don't bypass hooks in production branches

---

## Emergency: Need to Commit NOW

If you absolutely must commit immediately and hooks are blocking:

```bash
# 1. Skip hooks for this commit
git commit --no-verify -m "WIP: Your message"

# 2. Fix the issue in next commit
make pre-commit-setup
# Make necessary fixes
git commit -m "fix: Resolve pre-commit issues"

# 3. Squash commits later (optional)
git rebase -i HEAD~2
```

---

## Uninstalling Hooks

To remove pre-commit hooks:

```bash
# Remove git hooks
rm .git/hooks/pre-commit
rm .git/hooks/pre-push

# OR uninstall via pre-commit
pre-commit uninstall
```

To re-enable later:

```bash
make pre-commit-install
```

---

## Summary

**Most common issue**: Tools not installed
**Quickest fix**: `make pre-commit-setup`
**Emergency bypass**: `git commit --no-verify`
**Error details**: `cat .git/pre-commit-errors.log`

For detailed documentation, see [`PRE-COMMIT-GUIDE.md`](PRE-COMMIT-GUIDE.md).
