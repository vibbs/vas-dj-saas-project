# Local Data Setup Guide

This guide explains how to set up local development data for testing the VAS-DJ SaaS backend.

## Overview

The `setup_local_data` management command provides a quick and secure way to populate your local database with:
- **Superuser account** (for Django admin access)
- **Test organization** (sample company for testing)
- **Demo user account** (pre-configured test user)
- **Organization membership** (links demo user to test organization)

## Quick Start

### Full Setup (Recommended for first-time setup)

```bash
make setup-local-data
```

This will:
1. Check if a superuser exists (if not, prompt you to create one interactively)
2. Create a test organization ("Test Company")
3. Create a demo user (`demo@example.com`)
4. Link the demo user to the test organization as owner

### Quick Setup (Skip Superuser)

If you already have a superuser and only need dummy data:

```bash
make setup-local-data-quick
```

### Reset and Recreate

To delete existing test data and start fresh:

```bash
make setup-local-data-reset
```

## What Gets Created

### 1. Superuser (Interactive)

- **Created only if**: No superuser exists in the database
- **Prompts for**:
  - Email address
  - First name
  - Last name
  - Password (with confirmation)
- **Automatically set**:
  - `is_staff=True`
  - `is_superuser=True`
  - `is_email_verified=True` (skip verification for local dev)

**Example prompt:**
```
👤 Superuser Setup
   No superuser found. Creating one...

   Email address: admin@example.com
   First name: Admin
   Last name: User
   Password: ********
   Password (again): ********
   ✓ Superuser created: admin@example.com
```

### 2. Test Organization

- **Name**: Test Company
- **Slug**: `test-company`
- **Subdomain**: `test-company`
- **Plan**: `free_trial`
- **Status**: `on_trial=True`
- **Description**: "Test organization for local development"

### 3. Demo User

- **Email**: `demo@example.com`
- **Password**: `Demo123456!`
- **First Name**: Demo
- **Last Name**: User
- **Status**:
  - `is_active=True`
  - `is_email_verified=True`
  - Email verification skipped for local development

### 4. Organization Membership

- **User**: demo@example.com
- **Organization**: Test Company
- **Role**: `owner`
- **Status**: `active`

## Command Options

### Available Flags

```bash
# Skip superuser creation (only create dummy data)
python manage.py setup_local_data --skip-superuser

# Skip dummy data creation (only create superuser)
python manage.py setup_local_data --skip-dummy

# Reset existing test data before creating new
python manage.py setup_local_data --reset
```

### Docker Usage

All Makefile targets use Docker Compose automatically:

```bash
# Using Makefile (recommended)
make setup-local-data

# Direct Docker Compose command
docker compose -f ./docker/docker-compose.yml run --rm web python manage.py setup_local_data

# Using django-admin (if running locally without Docker)
python manage.py setup_local_data
```

## Security Features

### 1. Production Safety

The command **only runs when `DEBUG=True`**:

```python
if not settings.DEBUG:
    raise CommandError("❌ This command can only be run when DEBUG=True")
```

This prevents accidental execution in production environments.

### 2. Interactive Superuser Creation

- No hardcoded credentials
- Password validation (minimum 8 characters)
- Confirmation prompt for password
- Email format validation

### 3. Idempotent Design

Safe to run multiple times:
- Checks if superuser exists before prompting
- Checks if test organization exists before creating
- Checks if demo user exists before creating
- Uses `get_or_create()` for all data creation

### 4. Transaction Safety

All dummy data creation is wrapped in `@transaction.atomic`:
- Either all data is created successfully, or none is
- Prevents partial data corruption
- Ensures data consistency

## Example Output

### First Run (No existing data)

```bash
$ make setup-local-data

🔧 Setting up local development data...

=== Local Data Setup ===

👤 Superuser Setup
   No superuser found. Creating one...

   Email address: admin@example.com
   First name: Admin
   Last name: User
   Password: ********
   Password (again): ********
   ✓ Superuser created: admin@example.com

🏢 Dummy Data Setup
   ✓ Created organization: Test Company
   ✓ Created demo user: demo@example.com (password: Demo123456!)
   ✓ Created membership: demo@example.com -> Test Company (owner)

📋 Summary:
   Organization: Test Company
   Subdomain: test-company
   Plan: free_trial
   User: demo@example.com
   Password: Demo123456!
   Role: owner

✅ Local data setup completed successfully!
```

### Subsequent Runs (Data already exists)

```bash
$ make setup-local-data

🔧 Setting up local development data...

=== Local Data Setup ===

👤 Superuser Setup
   ✓ Superuser already exists: admin@example.com

🏢 Dummy Data Setup
   ✓ Test organization already exists: Test Company
   ✓ Demo user already exists: demo@example.com
   ✓ Membership exists: demo@example.com -> Test Company (owner)

📋 Summary:
   Organization: Test Company
   Subdomain: test-company
   Plan: free_trial
   User: demo@example.com
   Password: Demo123456!
   Role: owner

✅ Local data setup completed successfully!
```

### Reset Run

```bash
$ make setup-local-data-reset

🔧 Resetting and recreating local data...

=== Local Data Setup ===

🗑️  Resetting test data...
   Deleted 1 organization(s)
   Deleted demo user
   Reset complete

👤 Superuser Setup
   ✓ Superuser already exists: admin@example.com

🏢 Dummy Data Setup
   ✓ Created organization: Test Company
   ✓ Created demo user: demo@example.com (password: Demo123456!)
   ✓ Created membership: demo@example.com -> Test Company (owner)

✅ Local data setup completed successfully!
```

## Testing with Demo Data

### Login to Django Admin

1. Navigate to http://localhost:8000/admin/
2. Use the superuser credentials you created

### Login as Demo User (API)

Use the demo user credentials to test API endpoints:

```bash
# Login endpoint
curl -X POST http://localhost:8000/api/v1/accounts/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123456!"
  }'
```

### Access Test Organization

The demo user is the owner of "Test Company", so you can test:
- Organization management endpoints
- User invitation flows
- Role-based permissions
- Multi-tenant data isolation

## Troubleshooting

### "This command can only be run when DEBUG=True"

**Problem**: Trying to run in production mode.

**Solution**: Check your `.env` file:
```bash
DEBUG=True
```

### "Email must be provided" / "Email already exists"

**Problem**: Duplicate email or invalid format.

**Solution**:
- Ensure email has valid format (`user@domain.com`)
- Use `--reset` flag to delete existing test data
- Check database for existing users: `python manage.py shell`

### Database Connection Error

**Problem**: Database is not running.

**Solution**:
```bash
# Start Docker containers
make start

# Or build and start
make build
make start
```

### Orphan Containers Warning

**Problem**: Old test containers still running.

**Solution**:
```bash
# Clean up old containers
docker compose down --remove-orphans

# Or clean everything
make clean
```

## Best Practices

### 1. Run After Fresh Database

For a clean slate:

```bash
# Reset database
make clean
make build
make migrate

# Set up local data
make setup-local-data
```

### 2. Use in CI/CD

Add to your test setup scripts:

```bash
# In your CI pipeline (after migrations)
python manage.py setup_local_data --skip-superuser
```

### 3. Customize for Your Needs

The command source is at:
```
backend/apps/accounts/management/commands/setup_local_data.py
```

You can:
- Add more test organizations
- Create additional users with different roles
- Customize organization settings
- Add sample data for other models

### 4. Security Reminder

🔒 **Never commit** `.env` files with real credentials to git.

## Related Documentation

- [User Registration Flow](../features/user-registration-flow.md)
- [Organization Management](../features/organization-management.md)
- [Pre-Commit Guide](./PRE-COMMIT-GUIDE.md)
- [Django Admin Setup](../guides/django-admin.md)

## Command Reference

| Make Target | Description | Use Case |
|------------|-------------|----------|
| `make setup-local-data` | Full setup (superuser + dummy data) | First-time setup |
| `make setup-local-data-quick` | Skip superuser creation | Already have admin user |
| `make setup-local-data-reset` | Delete and recreate test data | Start fresh |

## Implementation Details

### File Location
```
backend/apps/accounts/management/commands/setup_local_data.py
```

### Key Functions

- `_create_superuser()`: Interactive superuser creation with validation
- `_create_dummy_data()`: Create test organization, demo user, and membership
- `_reset_test_data()`: Delete existing test data for clean slate

### Dependencies

- `apps.accounts.models.Account`: User model
- `apps.organizations.models.Organization`: Organization model
- `apps.organizations.models.OrganizationMembership`: Membership model

### Database Transactions

Uses `@transaction.atomic` decorator to ensure:
- All-or-nothing data creation
- Rollback on errors
- Data consistency

---

**Last Updated**: October 18, 2025
**Author**: VAS-DJ Development Team
**Status**: Production Ready
