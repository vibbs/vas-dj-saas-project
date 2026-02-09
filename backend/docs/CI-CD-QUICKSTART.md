# 🚀 CI/CD Quick Start Guide

Get up and running with the CI/CD pipeline in 5 minutes!

## 🏃‍♂️ Quick Setup

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -e .

# Setup development environment
make dev-setup
```

### 2. Run Local Validation

```bash
# Run complete pipeline locally
make ci-pipeline

# Or run individual stages
make lint-fix          # Fix code quality issues
make test-coverage-ci   # Run tests with coverage
make security          # Security scanning
```

### 3. Setup GitHub Actions

1. **Copy workflows** to your repository root:
   ```bash
   cp -r backend/.github .github
   ```

2. **Configure secrets** in GitHub repository settings:
   - Go to Settings → Secrets and variables → Actions
   - Add required secrets for your cloud provider

3. **Push to trigger CI**:
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push
   ```

## 🔧 Essential Commands

```bash
# Development
make dev-setup          # One-time setup
make lint-fix           # Fix code issues
make test-ci            # Run tests
make ci-pipeline        # Full pipeline

# Pre-commit
make pre-commit-install # Setup hooks
make pre-commit-run     # Run hooks

# Docker
make build-docker       # Build image
make build-push         # Build & push

# Security
make security           # Security scan
make security-strict    # Strict mode
```

## 🎯 Common Workflows

### Daily Development

```bash
# Before coding
git pull
make lint-fix

# While coding (hooks run automatically)
git add .
git commit -m "feature: add new functionality"

# Before pushing
make ci-pipeline
git push
```

### Before Production Release

```bash
# Full validation
make ci-pipeline

# Security audit
make security-strict

# Build and test container
make build-docker

# Deploy (manual)
# Configure CD pipeline or deploy manually
```

### Debugging Issues

```bash
# Verbose debugging
./scripts/ci-cd.sh --verbose

# Run specific stage
./scripts/lint.sh --verbose
./scripts/test.sh --verbose
./scripts/security.sh --verbose

# Check individual tools
black --check .
ruff check .
pytest --verbose
```

## 📊 Pipeline Overview

```
🎨 Lint → 🧪 Test → 📊 Coverage → 🔒 Security → 🏗️ Build
```

- **Lint**: Auto-fixable code quality (5-30s)
- **Test**: Full test suite with DB (2-5min)
- **Coverage**: Coverage analysis (30s-1min)
- **Security**: Vulnerability scanning (1-2min)
- **Build**: Docker image build (2-5min)

**Total time**: ~5-15 minutes depending on test suite size

## 🚨 Quick Fixes

### Pre-commit Issues
```bash
# Update hooks
pre-commit autoupdate

# Manual run
pre-commit run --all-files
```

### Test Failures
```bash
# Check services
docker compose -f docker/docker-compose.yml ps

# Restart services
make start
```

### Security Warnings
```bash
# Update dependencies
pip install --upgrade -r requirements.txt

# Check specific issues
safety check --full-report
```

### Build Failures
```bash
# Clean Docker
docker system prune -f

# Rebuild
make build-docker
```

## 🔗 Next Steps

1. **Review** [full documentation](CI-CD-PIPELINE.md)
2. **Configure** cloud deployment in CD pipeline
3. **Customize** pipeline for your needs
4. **Monitor** pipeline metrics and optimization

## 💡 Pro Tips

- Run `make ci-pipeline` before every push
- Use `--fix` flags for auto-fixing issues
- Set up IDE integration for linting tools
- Monitor coverage trends over time
- Regularly update security databases

---

Ready to code! 🎉
