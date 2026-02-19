"""
Constants for seed data.

All seed data is defined here for:
1. Single source of truth
2. Easy modification
3. Idempotent lookups using unique identifiers
"""

from decimal import Decimal

# User seed data - keyed by user type
SEED_USERS = {
    "complete": {
        "email": "complete@example.com",
        "first_name": "Complete",
        "last_name": "User",
        "password": "Complete123!",
        "phone": "+1-555-0100",
        "bio": "A complete user profile for testing all features.",
    },
    "empty": {
        "email": "empty@example.com",
        "first_name": "Empty",
        "last_name": "User",
        "password": "Empty123!",
    },
    "admin": {
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "password": "Admin123!",
        "phone": "+1-555-0200",
        "bio": "Admin user with staff privileges.",
    },
    "superadmin": {
        "email": "superadmin@example.com",
        "first_name": "Super",
        "last_name": "Admin",
        "password": "SuperAdmin123!",
        "phone": "+1-555-0300",
        "bio": "Superuser with all system privileges.",
    },
}

# Organization seed data - keyed by org type
SEED_ORGANIZATIONS = {
    "complete_org": {
        "slug": "complete-company",
        "name": "Complete Company Inc.",
        "description": "A fully configured company for testing complete user workflows.",
        "sub_domain": "complete-company",
        "plan": "pro",
    },
    "admin_org": {
        "slug": "admin-company",
        "name": "Admin Company LLC",
        "description": "Administrative company for testing admin features.",
        "sub_domain": "admin-company",
        "plan": "enterprise",
    },
}

# Billing plan seed data
SEED_PLANS = {
    "free_trial": {
        "slug": "free-trial",
        "name": "Free Trial",
        "description": "14-day free trial with limited features.",
        "amount": Decimal("0.00"),
        "trial_period_days": 14,
        "features": {
            "max_users": 3,
            "max_projects": 1,
            "storage_gb": 1,
            "support": "community",
        },
    },
    "starter": {
        "slug": "starter",
        "name": "Starter",
        "description": "Perfect for small teams getting started.",
        "amount": Decimal("29.00"),
        "trial_period_days": 0,
        "features": {
            "max_users": 5,
            "max_projects": 5,
            "storage_gb": 10,
            "support": "email",
        },
    },
    "pro": {
        "slug": "pro",
        "name": "Pro",
        "description": "For growing teams that need more power.",
        "amount": Decimal("99.00"),
        "trial_period_days": 0,
        "features": {
            "max_users": 25,
            "max_projects": 25,
            "storage_gb": 100,
            "support": "priority",
            "analytics": True,
        },
    },
    "enterprise": {
        "slug": "enterprise",
        "name": "Enterprise",
        "description": "For large organizations with advanced needs.",
        "amount": Decimal("299.00"),
        "trial_period_days": 0,
        "features": {
            "max_users": -1,  # Unlimited
            "max_projects": -1,
            "storage_gb": 1000,
            "support": "dedicated",
            "analytics": True,
            "sso": True,
            "audit_logs": True,
        },
    },
}
