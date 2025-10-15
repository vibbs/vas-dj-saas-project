# Testing Guide

## Overview

This document provides comprehensive guidance on running tests in the VAS-DJ SaaS backend project.

## Test Infrastructure

### Test Database Setup

The project uses **isolated test database** infrastructure:

- **Separate PostgreSQL instance**: `test_db` service (not shared with development `db`)
- **Fast in-memory storage**: Uses tmpfs for zero disk I/O overhead
- **Automatic migrations**: Migrations run automatically at test session start
- **Database reuse**: Test database is reused across runs with `--reuse-db` flag

### Test Configuration

**File**: `pytest.ini`

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
addopts =
    --strict-markers
    --strict-config
    --verbose
    --tb=short
    --reuse-db          # Reuse test database between runs
    --create-db         # Create test database if it doesn't exist
```

**Test Settings**: `config/settings/test.py`

- Separate `SECRET_KEY` for testing
- `DEBUG = False` to catch template errors
- In-memory cache (`LocMemCache`) for speed
- Celery eager execution (synchronous)
- Rate limiting disabled
- Password validators disabled for faster test data creation

### Docker Configuration

**File**: `docker/docker-compose.test.yml`

The test environment includes:
- `test_db`: PostgreSQL 16 with tmpfs storage
- `redis`: For caching tests
- `mailhog`: For email testing
- Isolated network: `test-saas-network`

## Running Tests

### Basic Test Commands

```bash
# Run all tests
make test

# Run tests with verbose output
make test-verbose

# Run tests with coverage report
make test-coverage

# Run tests in parallel (faster)
make test-parallel
```

### Test by Module

```bash
# Run tests by Django app
make test-accounts          # Accounts app tests
make test-organizations     # Organizations app tests
make test-core             # Core app tests
make test-billing          # Billing app tests
make test-email            # Email service tests
```

### Test by Category

```bash
# Run tests by marker
make test-unit             # Unit tests only
make test-integration      # Integration tests only
make test-api              # API endpoint tests
make test-models           # Model tests
make test-views            # View tests
make test-auth             # Authentication tests
make test-fast             # Fast tests only
make test-slow             # Slow/complex tests only
```

### Test Infrastructure Management

```bash
# Build test containers
make test-build

# Clean up test containers and volumes
make test-clean
```

## Test Results Summary (October 2025)

### Module Test Results

| Module | Tests Run | Passed | Failed | Success Rate | Notes |
|--------|-----------|--------|--------|--------------|-------|
| **accounts** | 89 | 89 | 0 | **100%** | ✅ All tests passing |
| **organizations** | 243 | 205 | 38 | **84%** | ⚠️ Mostly tenant context issues |
| **core** | 261 | 254 | 7 | **97%** | ⚠️ Minor tenant middleware issues |
| **feature_flags** | 323 | 221 | 102 | **68%** | ⚠️ Needs review |
| **email_service** | (included in feature_flags run) | - | - | - | - |
| **billing** | N/A | N/A | N/A | N/A | ❌ Import error - needs fixing |

### Overall Statistics

- **Total tests executed**: ~916 tests
- **Overall pass rate**: ~84%
- **Critical modules (accounts, core)**: 97-100% pass rate
- **Django system check**: ✅ 0 issues

### Known Issues

#### 1. Billing Module
**Status**: ❌ Critical

**Error**:
```
ImportError: cannot import name 'SubscriptionPlan' from 'apps.billing.models'
```

**Impact**: All billing tests blocked

**Action Required**: Review billing models implementation

#### 2. Organizations Module
**Status**: ⚠️ Medium Priority

**Issues**:
- 38 failures out of 243 tests (84% pass rate)
- Most failures related to tenant middleware expecting organization context
- Edge case validations failing (long names, invalid subdomains, etc.)

**Sample Failures**:
- `test_organization_with_extremely_long_name`
- `test_organization_invalid_subdomain_formats`
- `test_membership_orphaned_user`
- API endpoint tests expecting organization context in headers

**Action Required**: Review tenant middleware requirements and update tests

#### 3. Core Security Tests
**Status**: ⚠️ Low Priority

**Issues**: 7 failures out of 261 tests (97% pass rate)

**Failures**:
- `test_password_not_returned_in_api_responses` - Minor serializer issue
- `test_sql_injection_in_search_parameters` - Test needs update
- Tenant isolation tests expecting organization headers

**Action Required**: Update tests to match tenant middleware behavior

#### 4. Feature Flags Module
**Status**: ⚠️ Medium Priority

**Issues**: 102 failures out of 323 tests (68% pass rate)

**Common Failures**:
- API tests expecting 200 but getting 404 (tenant context)
- Decorator and mixin tests failing
- Access rule tests failing

**Action Required**: Review feature flags API and tenant integration

## Test Best Practices

### 1. Use Factories for Test Data

```python
from apps.accounts.tests.factories import AccountFactory

def test_user_creation():
    user = AccountFactory()  # Creates user with random data
    assert user.email
```

### 2. Use Fixtures for Common Setup

```python
def test_authenticated_api_call(authenticated_api_client):
    # authenticated_api_client is provided by conftest.py
    response = authenticated_api_client.get('/api/v1/accounts/users/me/')
    assert response.status_code == 200
```

### 3. Mark Tests by Category

```python
import pytest

@pytest.mark.slow
@pytest.mark.integration
def test_complex_workflow():
    # Complex test that takes time
    pass
```

### 4. Use Tenant Context for Organization Tests

```python
def test_organization_api(api_client, organization, user):
    api_client.force_authenticate(user=user)
    # Add organization context to request
    response = api_client.get(
        f'/api/v1/organizations/{organization.id}/',
        headers={'X-Organization-Slug': organization.subdomain}
    )
    assert response.status_code == 200
```

### 5. Test Security Scenarios

```python
@pytest.mark.security
def test_tenant_isolation(api_client, user1, user2):
    api_client.force_authenticate(user=user1)
    # User 1 should not access User 2's data
    response = api_client.get(f'/api/v1/accounts/users/{user2.id}/')
    assert response.status_code in [403, 404]
```

## Continuous Testing

### Pre-commit Testing

Run fast tests before committing:

```bash
make test-fast
```

### Pre-push Testing

Run full test suite before pushing:

```bash
make test-parallel  # Faster with parallel execution
```

### CI/CD Integration

The test suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    make test-build
    make test-coverage
```

## Coverage Goals

- **Overall coverage target**: 80%
- **Critical modules (accounts, core)**: 90%+
- **Security-sensitive code**: 95%+

Check current coverage:

```bash
make test-coverage
# Open htmlcov/index.html in browser
```

## Troubleshooting

### Test Database Connection Issues

```bash
# Clean and rebuild test infrastructure
make test-clean
make test-build
docker compose -f ./docker/docker-compose.test.yml run --rm web python manage.py migrate
```

### Slow Test Execution

```bash
# Use parallel execution
make test-parallel

# Or run only fast tests
make test-fast
```

### Memory Issues

```bash
# Test database uses tmpfs (RAM) - ensure Docker has enough memory allocated
# Recommended: 4GB+ RAM for Docker
```

### Migration Issues

If you encounter migration errors:

```bash
# Manually run migrations on test database
docker compose -f ./docker/docker-compose.test.yml run --rm web python manage.py migrate
```

## Next Steps

1. **Fix billing module import error** - Priority: High
2. **Update organizations tests** - Add tenant context to API tests
3. **Review feature flags tests** - Ensure proper tenant middleware integration
4. **Improve test coverage** - Focus on core business logic
5. **Add performance tests** - Measure API response times under load

## References

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-django Documentation](https://pytest-django.readthedocs.io/)
- [Factory Boy Documentation](https://factoryboy.readthedocs.io/)
- [Django Testing Best Practices](https://docs.djangoproject.com/en/5.2/topics/testing/)
