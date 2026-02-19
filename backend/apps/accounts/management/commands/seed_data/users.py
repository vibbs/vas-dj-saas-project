"""
User seeder for creating test users.
"""

from apps.accounts.enums import GenderTypes, UserRoleTypes, UserStatusTypes
from apps.accounts.models import Account

from .constants import SEED_USERS


class UserSeeder:
    """Seeder for creating test users with different data levels."""

    def __init__(self, stdout, style):
        self.stdout = stdout
        self.style = style

    def _log_created(self, user_type, email):
        self.stdout.write(self.style.SUCCESS(f"   + Created {user_type}: {email}"))

    def _log_existing(self, user_type, email):
        self.stdout.write(self.style.SUCCESS(f"   = {user_type} exists: {email}"))

    def seed_complete_user(self):
        """Create user with complete profile data."""
        data = SEED_USERS["complete"]
        user, created = Account.objects.get_or_create(
            email=data["email"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "is_active": True,
                "is_email_verified": True,
                "role": UserRoleTypes.USER.value,
                "status": UserStatusTypes.ACTIVE.value,
                "phone": data.get("phone", ""),
                "bio": data.get("bio", ""),
                "gender": GenderTypes.UNKNOWN.value,
                "is_org_admin": True,
                "can_invite_users": True,
                "can_manage_billing": True,
            },
        )
        if created:
            user.set_password(data["password"])
            user.save()
            self._log_created("Account (Complete)", user.email)
        else:
            self._log_existing("Account (Complete)", user.email)
        return user

    def seed_empty_user(self):
        """Create minimal user without org or data."""
        data = SEED_USERS["empty"]
        user, created = Account.objects.get_or_create(
            email=data["email"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "is_active": True,
                "is_email_verified": True,
                "role": UserRoleTypes.USER.value,
                "status": UserStatusTypes.ACTIVE.value,
            },
        )
        if created:
            user.set_password(data["password"])
            user.save()
            self._log_created("Account (Empty)", user.email)
        else:
            self._log_existing("Account (Empty)", user.email)
        return user

    def seed_admin_user(self):
        """Create admin user with staff privileges."""
        data = SEED_USERS["admin"]
        user, created = Account.objects.get_or_create(
            email=data["email"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "is_active": True,
                "is_staff": True,
                "is_email_verified": True,
                "role": UserRoleTypes.ADMIN.value,
                "status": UserStatusTypes.ACTIVE.value,
                "phone": data.get("phone", ""),
                "bio": data.get("bio", ""),
                "is_org_admin": True,
                "is_org_creator": True,
                "can_invite_users": True,
                "can_manage_billing": True,
                "can_delete_org": True,
            },
        )
        if created:
            user.set_password(data["password"])
            user.save()
            self._log_created("Account (Admin)", user.email)
        else:
            self._log_existing("Account (Admin)", user.email)
        return user

    def seed_superadmin_user(self):
        """Create superuser with all privileges."""
        data = SEED_USERS["superadmin"]
        user, created = Account.objects.get_or_create(
            email=data["email"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "is_active": True,
                "is_staff": True,
                "is_superuser": True,
                "is_email_verified": True,
                "role": UserRoleTypes.ADMIN.value,
                "status": UserStatusTypes.ACTIVE.value,
                "phone": data.get("phone", ""),
                "bio": data.get("bio", ""),
                "is_org_admin": True,
                "is_org_creator": True,
                "can_invite_users": True,
                "can_manage_billing": True,
                "can_delete_org": True,
            },
        )
        if created:
            user.set_password(data["password"])
            user.save()
            self._log_created("Account (Superuser)", user.email)
        else:
            self._log_existing("Account (Superuser)", user.email)
        return user

    def seed_all(self):
        """Seed all user types and return them as a dict."""
        return {
            "complete": self.seed_complete_user(),
            "empty": self.seed_empty_user(),
            "admin": self.seed_admin_user(),
            "superadmin": self.seed_superadmin_user(),
        }
