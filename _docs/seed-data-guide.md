# Seed Data Guide

This guide explains how to set up and use seed data for local development in the VAS-DJ SaaS project.

## Overview

The seed data system provides pre-configured test data for development, including:
- Test users with different permission levels
- Organizations with various subscription plans
- Billing plans and invoices
- Onboarding progress states
- Audit log entries

> **Safety Note:** Seed data commands only work when `DEBUG=True` to prevent accidental use in production.

---

## Quick Start

### Option 1: Basic Setup (Interactive)

```bash
cd backend
make setup-local-data
```

This creates:
- A superuser (prompts for credentials)
- One test organization ("Test Organization")
- One demo user (`demo@example.com` / `demo123!`)

### Option 2: Full Seed Data (Recommended for Development)

```bash
cd backend
make setup-seed-data
```

This creates comprehensive test data including multiple users, organizations, billing plans, and sample invoices.

### Option 3: Docker with Auto-Seeding

```bash
cd backend
make start-with-seed
```

Starts all services and automatically seeds data on first run.

---

## Available Commands

| Command | Description |
|---------|-------------|
| `make setup-local-data` | Interactive setup with superuser prompt |
| `make setup-local-data-quick` | Skip superuser, create basic dummy data only |
| `make setup-local-data-reset` | Delete existing test data, then recreate |
| `make setup-seed-data` | Full seed data with all test users and organizations |
| `make setup-seed-data-reset` | Reset and re-seed all comprehensive data |
| `make start-with-seed` | Start Docker services with auto-seeding |
| `make start-with-seed-detached` | Same as above, but in background |

### Direct Django Commands

```bash
# Basic setup
python manage.py setup_local_data

# Full seed data
python manage.py setup_local_data --full

# Skip superuser creation
python manage.py setup_local_data --skip-superuser

# Reset and seed
python manage.py setup_local_data --reset --full

# Auto mode (non-interactive, for Docker)
python manage.py setup_local_data --auto --full
```

---

## Test User Credentials

After running `make setup-seed-data`, the following test accounts are available:

### Complete User (Full Profile)
| Field | Value |
|-------|-------|
| Email | `complete@example.com` |
| Password | `Complete123!` |
| Role | Organization Owner |
| Organization | complete-company |
| Plan | Pro ($99/month) |
| Profile | Full (phone, bio, etc.) |
| Onboarding | 100% complete |

**Best for:** Testing the full user experience, dashboard features, billing UI.

### Empty User (Minimal Profile)
| Field | Value |
|-------|-------|
| Email | `empty@example.com` |
| Password | `Empty123!` |
| Role | Regular User |
| Organization | None |
| Profile | Minimal (name only) |
| Onboarding | 0% complete |

**Best for:** Testing onboarding flows, empty states, profile completion prompts.

### Admin User (Staff Privileges)
| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `Admin123!` |
| Role | Staff / Admin |
| Organization | admin-company |
| Plan | Enterprise ($299/month) |
| Permissions | `is_staff=True` |

**Best for:** Testing admin features, role-based access control.

### Super Admin (Full System Access)
| Field | Value |
|-------|-------|
| Email | `superadmin@example.com` |
| Password | `SuperAdmin123!` |
| Role | Superuser |
| Organization | admin-company |
| Permissions | `is_superuser=True` |

**Best for:** Testing Django admin, system-wide features.

---

## Test Organizations

| Organization | Slug | Plan | Owner |
|--------------|------|------|-------|
| Complete Company | `complete-company` | Pro | complete@example.com |
| Admin Company | `admin-company` | Enterprise | admin@example.com |

---

## Billing Plans

The seed data creates four billing plan tiers:

| Plan | Price | Billing | Max Users | Features |
|------|-------|---------|-----------|----------|
| Free Trial | $0 | 14-day trial | 3 | Basic features |
| Starter | $29/month | Monthly | 5 | Core features |
| Pro | $99/month | Monthly | 25 | Analytics, priority support |
| Enterprise | $299/month | Monthly | Unlimited | SSO, audit logs, SLA |

---

## Resetting Data

To start fresh with clean seed data:

```bash
# Reset and re-seed everything
make setup-seed-data-reset

# Or manually:
python manage.py setup_local_data --reset --full --skip-superuser
```

This will:
1. Delete all users with `@example.com` emails
2. Delete organizations with test slugs
3. Recreate all seed data from scratch

---

## Architecture

The seed data system is organized as a modular package:

```
backend/apps/accounts/management/commands/
├── setup_local_data.py          # Main management command
└── seed_data/
    ├── __init__.py              # Module exports
    ├── constants.py             # All seed data definitions
    ├── users.py                 # UserSeeder class
    ├── organizations.py         # OrganizationSeeder class
    ├── billing.py               # BillingSeeder class
    ├── onboarding.py            # OnboardingSeeder class
    └── audit_logs.py            # AuditLogSeeder class
```

### Adding New Seed Data

1. **Add constants** to `seed_data/constants.py`:
   ```python
   SEED_NEW_FEATURE = {
       "key": {
           "field1": "value1",
           "field2": "value2",
       }
   }
   ```

2. **Create a seeder class** in `seed_data/new_feature.py`:
   ```python
   class NewFeatureSeeder:
       @staticmethod
       def seed_item(key: str) -> Model:
           data = SEED_NEW_FEATURE.get(key)
           if not data:
               raise ValueError(f"Unknown key: {key}")
           return Model.objects.create(**data)

       @staticmethod
       def seed_all() -> list[Model]:
           return [
               NewFeatureSeeder.seed_item(key)
               for key in SEED_NEW_FEATURE.keys()
           ]
   ```

3. **Export from `__init__.py`**:
   ```python
   from .new_feature import NewFeatureSeeder
   ```

4. **Call from `setup_local_data.py`** in the `_seed_comprehensive_data` method.

---

## Troubleshooting

### "This command can only be run in DEBUG mode"
Ensure `DEBUG=True` in your `.env` file or environment.

### Seed data not appearing
1. Check that migrations have been applied: `make migrate`
2. Verify the database is running: `make start`
3. Check for errors in the command output

### "User already exists" errors
Use the reset flag: `make setup-seed-data-reset`

### Docker auto-seed not working
Ensure `AUTO_SEED_DATA=true` is set in your `docker-compose.yml` or environment.

---

## Best Practices

1. **Use `complete@example.com`** for most development testing - it has full data
2. **Use `empty@example.com`** when testing empty states and onboarding
3. **Reset periodically** to ensure clean test data
4. **Don't modify seed users manually** - use reset instead
5. **Add new test scenarios** to the seed data module for team consistency

---

## Related Documentation

- [Project Reference](.claude/docs/project-reference.md) - Full project documentation
- [Backend Makefile](../backend/Makefile) - All available make commands
- [Docker Setup](../backend/docker/docker-compose.yml) - Container configuration
