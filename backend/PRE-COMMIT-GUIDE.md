# Pre-Commit Hooks Guide

## Overview

This project uses **smart pre-commit hooks** that automatically fix common issues instead of just blocking your commits. The hooks are designed to be developer-friendly with clear error messages and auto-mitigation strategies.

## Features

### ✅ Auto-Fixing Capabilities

1. **Code Formatting** (Black, isort, Ruff)
   - Automatically formats Python code
   - Fixes import ordering
   - Applies linting fixes

2. **Django Migrations**
   - Detects missing migrations
   - **Auto-creates migrations** when needed
   - Stages them for commit automatically

3. **File Checks**
   - Removes trailing whitespace
   - Fixes end-of-file markers
   - Validates YAML, JSON, TOML files

### 🚀 Developer Experience

- **Non-blocking**: Most issues are fixed automatically
- **Clear messages**: Helpful error messages with next steps
- **Fast feedback**: Only runs on changed files
- **Manual override**: Can disable auto-fix when needed

## Installation

### First-Time Setup

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install the hooks
make pre-commit-install
```

This installs hooks for both `pre-commit` and `pre-push` stages.

## Usage

### Automatic (Recommended)

Once installed, hooks run automatically on `git commit`:

```bash
git add .
git commit -m "Your commit message"
# Hooks run automatically and fix issues
```

### Manual Checks

Run checks manually without committing:

```bash
# Run with auto-fix enabled
make pre-commit-check

# Run without auto-fix (just check)
make pre-commit-check-manual

# Run all hooks on all files
make pre-commit-run
```

## How It Works

### Smart Django Migration Handling

When you modify models, the hook:

1. **Detects** missing migrations
2. **Auto-creates** migrations with `makemigrations`
3. **Stages** new migration files automatically
4. **Notifies** you to review them

**Example output:**
```
⚠️  Missing migrations detected. Auto-fixing...
Migrations for 'accounts':
  apps/accounts/migrations/0005_account_new_field.py
    - Add field new_field to account
✅ Migrations created and staged. Please review them.
```

### Smart Django System Check

Validates Django configuration before commit:

- Checks settings and apps
- Verifies database connectivity (if needed)
- Provides helpful error messages

**Example error:**
```
❌ Django system check failed. Run: make check-system

Common fixes:
  1. Check DJANGO_SETTINGS_MODULE environment variable
  2. Verify database connection settings
  3. Run: make check-system for detailed output
```

## Configuration

### Environment Variables

- `AUTO_FIX=true` (default): Enable automatic fixes
- `AUTO_FIX=false`: Check only, no automatic fixes

### Hook Configuration

Located in [`.pre-commit-config.yaml`](.pre-commit-config.yaml):

```yaml
# Django specific checks with smart auto-fix
- repo: local
  hooks:
    - id: django-smart-check
      name: Django Smart Check (with auto-fix)
      entry: bash -c 'AUTO_FIX=true ./scripts/pre-commit-helper.sh'
      language: system
      pass_filenames: false
      require_serial: true
      files: \.py$
      exclude: migrations/
```

## Troubleshooting

### Issue: Pre-commit blocks my commit

**Solution 1: Check the error message**
The hook provides specific instructions for each failure.

**Solution 2: Run manual check**
```bash
make pre-commit-check
```

**Solution 3: Skip hooks (not recommended)**
```bash
git commit --no-verify -m "Your message"
```

### Issue: Migrations not auto-created

**Verify:**
1. Check `AUTO_FIX` is set to `true` (default)
2. Ensure models are in tracked files (`git add`)
3. Run manually: `python manage.py makemigrations`

### Issue: Django system check fails

**Common causes:**
1. Missing environment variables (`.env` file)
2. Database not running (`make start`)
3. Invalid settings configuration

**Fix:**
```bash
# Check system status
make check-system

# Start backend services
make start

# Verify environment
make validate-env
```

### Issue: Hook runs too slowly

**Optimization:**
- Hooks only run on changed files by default
- Use `files: \.py$` pattern to target specific files
- Skip slow hooks with `SKIP=django-smart-check git commit`

## Best Practices

### 1. Review Auto-Generated Migrations

Always review migrations before pushing:

```bash
git diff --cached apps/*/migrations/
```

### 2. Run Checks Before Large Commits

```bash
# Check before committing
make pre-commit-check

# Then commit
git commit -m "Your message"
```

### 3. Keep Hooks Updated

```bash
# Update hook repositories
pre-commit autoupdate

# Re-install hooks
make pre-commit-install
```

### 4. Use Meaningful Commit Messages

Hooks ensure code quality, you ensure commit clarity:

```bash
# Good
git commit -m "feat: Add user profile fields with auto-migration"

# Bad
git commit -m "changes"
```

## Advanced Usage

### Selective Hook Execution

Run specific hooks only:

```bash
# Run only black
pre-commit run black --all-files

# Run only Django checks
pre-commit run django-smart-check --all-files

# Run only on staged files
pre-commit run
```

### Skip Specific Hooks

```bash
# Skip Django checks
SKIP=django-smart-check git commit -m "Your message"

# Skip multiple hooks
SKIP=django-smart-check,ruff git commit -m "Your message"
```

### CI/CD Integration

Hooks automatically run in CI pipelines:

```yaml
# .github/workflows/ci.yml
- name: Run pre-commit
  run: pre-commit run --all-files
```

## Hook Stages

### Pre-Commit Stage (Default)
Runs on `git commit`:
- Code formatting (black, isort, ruff)
- File checks (trailing whitespace, EOF)
- Django system check
- Django migration check

### Pre-Push Stage
Runs on `git push`:
- Full test suite (optional)
- Security scans (optional)

Configure stages in `.pre-commit-config.yaml`:
```yaml
default_stages: [pre-commit]
```

## FAQ

**Q: Can I disable hooks temporarily?**
A: Yes, use `git commit --no-verify` (not recommended for regular use)

**Q: Will hooks fix my code automatically?**
A: Yes, for formatting and migrations. Other issues require manual fixes.

**Q: Do hooks run in Docker?**
A: No, hooks run on your host machine. Ensure Python and dependencies are installed locally.

**Q: Can I customize hook behavior?**
A: Yes, edit [`.pre-commit-config.yaml`](.pre-commit-config.yaml) or [`scripts/pre-commit-helper.sh`](scripts/pre-commit-helper.sh)

**Q: What if hooks fail in CI?**
A: CI runs the same hooks. Fix issues locally with `make pre-commit-run`

## Resources

- [Pre-commit Documentation](https://pre-commit.com/)
- [Black Formatter](https://black.readthedocs.io/)
- [isort](https://pycqa.github.io/isort/)
- [Ruff Linter](https://docs.astral.sh/ruff/)
- [Django System Check](https://docs.djangoproject.com/en/stable/ref/checks/)

## Support

Issues with pre-commit hooks? Check:

1. This guide
2. Project [`CLAUDE.md`](CLAUDE.md) for development commands
3. Main [`README.md`](README.md) for setup instructions
4. [`Makefile`](Makefile) for available commands

Still stuck? Open an issue with:
- Hook error output
- Output of `pre-commit --version`
- Output of `make check-system`
