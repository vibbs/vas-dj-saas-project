# Testing Documentation

This document provides comprehensive information about the testing setup for the VAS-DJ SaaS backend.

## Testing Stack

- **pytest** - Main test runner with powerful fixtures and assertions
- **pytest-django** - Django integration providing database fixtures and settings override
- **pytest-cov** - Coverage reporting with HTML and terminal output
- **pytest-xdist** - Parallel test execution for faster test runs
- **factory_boy** - Test data factories for creating consistent test objects
- **freezegun** - Time mocking for deterministic time-based tests

## Test Environment Setup

### Docker Test Environment

The test environment uses a separate Docker Compose configuration (`docker-compose.test.yml`) that provides:

- **Isolated Test Database**: PostgreSQL with tmpfs for fast I/O
- **Separate Redis Instance**: For caching and Celery tests
- **Test-specific Environment**: Optimized settings for testing

### Build and Run Tests

```bash
# Build test environment
make test-build

# Run all tests
make test

# Run with coverage
make test-coverage

# Clean up test environment
make test-clean
```

## Test Organization

### Directory Structure

```
backend/
├── conftest.py                 # Global pytest fixtures
├── pytest.ini                 # Pytest configuration
├── apps/
│   ├── accounts/
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── conftest.py     # App-specific fixtures
│   │       ├── factories.py    # Factory Boy factories
│   │       ├── test_models.py  # Model tests
│   │       └── test_views.py   # API endpoint tests
│   ├── organizations/
│   │   └── tests/              # Same structure
│   └── [other apps]/
└── tests/
    ├── __init__.py
    ├── test_integration.py     # Cross-app integration tests
    └── README.md              # This file
```

### Test Categories (Markers)

Tests are organized using pytest markers:

- `@pytest.mark.unit` - Fast unit tests
- `@pytest.mark.integration` - Cross-app integration tests
- `@pytest.mark.api` - API endpoint tests
- `@pytest.mark.models` - Database model tests
- `@pytest.mark.views` - View and serializer tests
- `@pytest.mark.auth` - Authentication and permissions tests
- `@pytest.mark.slow` - Slow tests (can be excluded for faster runs)

### Running Specific Test Categories

```bash
# Run only unit tests
make test-unit

# Run only API tests
make test-api

# Run fast tests (exclude slow ones)
make test-fast

# Run specific app tests
make test-accounts
make test-organizations
```

## Test Fixtures

### Global Fixtures (`conftest.py`)

- `api_client` - DRF API client
- `django_client` - Django test client
- `user` - Standard user account
- `admin_user` - Admin user account
- `superuser` - Superuser account
- `organization` - Organization instance
- `authenticated_api_client` - Pre-authenticated API client

### App-Specific Fixtures

Each app has its own `conftest.py` with specialized fixtures:

- **Accounts**: Various user types, auth providers, verification states
- **Organizations**: Different organization types, memberships, invitations

## Factory Boy Factories

### Account Factories

```python
# Create a standard user
user = AccountFactory()

# Create an admin user
admin = AdminAccountFactory()

# Create an unverified user
unverified_user = UnverifiedAccountFactory()
```

### Organization Factories

```python
# Create an organization
org = OrganizationFactory()

# Create organization with members
org_with_members = OrganizationMembershipFactory()
```

## Writing Tests

### Basic Test Structure

```python
import pytest
from apps.accounts.tests.factories import AccountFactory

@pytest.mark.django_db
@pytest.mark.unit
class TestAccountModel:
    def test_account_creation(self):
        account = AccountFactory()
        assert account.email
        assert account.is_active
```

### API Testing

```python
@pytest.mark.django_db
@pytest.mark.api
class TestAccountAPI:
    def test_get_user_profile(self, authenticated_api_client, user):
        url = reverse('accounts:users-me')
        response = authenticated_api_client.get(url)
        assert response.status_code == 200
        assert response.data['email'] == user.email
```

### Time-Based Testing

```python
from freezegun import freeze_time

@freeze_time("2024-01-01 12:00:00")
def test_token_expiry(self):
    account = AccountFactory()
    token = account.generate_verification_token()
    # Test with fixed time
```

## Multi-Tenancy Testing

### Tenant Isolation Tests

```python
@pytest.mark.django_db
@pytest.mark.integration
def test_tenant_isolation(self):
    org1 = OrganizationFactory()
    org2 = OrganizationFactory()
    
    user1 = AccountFactory(organization=org1)
    user2 = AccountFactory(organization=org2)
    
    # Verify isolation
    assert not user1.has_access_to(org2)
    assert not user2.has_access_to(org1)
```

## Coverage Reporting

### Running Coverage

```bash
# Run tests with coverage
make test-coverage

# Coverage report saved to htmlcov/index.html
```

### Coverage Configuration

Coverage is configured in `pytest.ini` to:
- Cover all `apps/` code
- Generate HTML reports
- Show missing lines in terminal output

## Parallel Testing

```bash
# Run tests in parallel
make test-parallel

# Or specify number of workers
docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -n 4
```

## Test Data Management

### Database Management

- Tests use `pytest-django`'s database fixture
- Database is reset between test functions
- Transactions are rolled back automatically
- Use `@pytest.mark.django_db(transaction=True)` for transaction tests

### Factory Boy Best Practices

1. **Use factories for all test data creation**
2. **Create minimal factories** - only required fields
3. **Use SubFactory for relationships**
4. **Create specialized factories for different scenarios**

## Debugging Tests

### Verbose Output

```bash
make test-verbose
```

### Debug Specific Test

```bash
# Run specific test with debugging
docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -v -s apps/accounts/tests/test_models.py::TestAccountModel::test_account_creation
```

### PDB Debugging

Add breakpoints in tests:

```python
def test_something(self):
    import pdb; pdb.set_trace()
    # Your test code
```

## Continuous Integration

The test setup is designed to work in CI environments:

- Fast parallel execution
- Isolated test database
- Coverage reporting
- Clear exit codes
- Categorized test selection

## Performance Considerations

1. **Use tmpfs for test database** - Already configured
2. **Run tests in parallel** - Use `make test-parallel`
3. **Exclude slow tests for quick feedback** - Use `make test-fast`
4. **Use factories efficiently** - Create minimal test data
5. **Avoid unnecessary database operations** - Use mocks when appropriate

## Common Test Patterns

### Testing Permissions

```python
def test_user_can_access_own_data(self, user, api_client):
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse('user-detail', args=[user.id]))
    assert response.status_code == 200

def test_user_cannot_access_other_user_data(self, user, api_client):
    other_user = AccountFactory()
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse('user-detail', args=[other_user.id]))
    assert response.status_code == 403
```

### Testing Email Sending

```python
from django.core import mail

def test_verification_email_sent(self):
    user = UnverifiedAccountFactory()
    user.send_verification_email()
    
    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == [user.email]
```

## Troubleshooting

### Common Issues

1. **Tests not found**: Check `python_files`, `python_classes`, `python_functions` in `pytest.ini`
2. **Database errors**: Ensure `@pytest.mark.django_db` decorator is used
3. **Import errors**: Check Python path and app structure
4. **Fixture errors**: Verify fixture names and dependencies

### Test Environment Issues

```bash
# Rebuild test environment
make test-clean
make test-build

# Check test database connection
docker compose -f ./docker/docker-compose.test.yml run --rm web python manage.py check --database default
```

## Contributing

When adding new tests:

1. Follow the established directory structure
2. Use appropriate pytest markers
3. Create factories for new models
4. Add app-specific fixtures when needed
5. Include both positive and negative test cases
6. Test edge cases and error conditions
7. Maintain good test coverage