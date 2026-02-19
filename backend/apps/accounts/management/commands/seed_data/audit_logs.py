"""
Audit log seeder for creating activity history.
"""

from datetime import timedelta

from django.utils import timezone

from apps.core.audit.models import AuditAction, AuditLog


class AuditLogSeeder:
    """Seeder for audit log entries."""

    def __init__(self, stdout, style):
        self.stdout = stdout
        self.style = style

    def _log_created(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   + Created {entity_type}: {identifier}"))

    def _log_existing(self, entity_type, identifier):
        self.stdout.write(self.style.SUCCESS(f"   = {entity_type} exists: {identifier}"))

    def seed_audit_logs(self, user, organization):
        """
        Seed realistic audit log entries for a user's activity history.

        Args:
            user: Account instance
            organization: Organization instance (can be None)

        Returns:
            Number of audit logs created
        """
        now = timezone.now()

        # Define audit events to create
        audit_events = [
            {
                "action": AuditAction.LOGIN_SUCCESS,
                "resource_type": "auth",
                "details": {"method": "password", "device": "Desktop Chrome"},
                "offset": timedelta(days=7),
            },
            {
                "action": AuditAction.USER_CREATE,
                "resource_type": "user",
                "resource_id": user.id,
                "details": {"registration_method": "email"},
                "offset": timedelta(days=7),
            },
            {
                "action": AuditAction.EMAIL_VERIFICATION,
                "resource_type": "user",
                "resource_id": user.id,
                "details": {"verified": True},
                "offset": timedelta(days=6, hours=23),
            },
            {
                "action": AuditAction.USER_UPDATE,
                "resource_type": "user",
                "resource_id": user.id,
                "details": {"fields_updated": ["first_name", "last_name", "bio"]},
                "offset": timedelta(days=5),
            },
            {
                "action": AuditAction.LOGIN_SUCCESS,
                "resource_type": "auth",
                "details": {"method": "password", "device": "Mobile Safari"},
                "offset": timedelta(days=3),
            },
            {
                "action": AuditAction.LOGIN_SUCCESS,
                "resource_type": "auth",
                "details": {"method": "password", "device": "Desktop Chrome"},
                "offset": timedelta(hours=2),
            },
        ]

        # Add organization-specific events if org exists
        if organization:
            audit_events.extend(
                [
                    {
                        "action": AuditAction.ORG_CREATE,
                        "resource_type": "organization",
                        "resource_id": organization.id,
                        "details": {"org_name": organization.name, "plan": organization.plan},
                        "offset": timedelta(days=6),
                    },
                    {
                        "action": AuditAction.BILLING_UPDATE,
                        "resource_type": "subscription",
                        "details": {"plan": organization.plan, "action": "subscription_created"},
                        "offset": timedelta(days=4),
                    },
                ]
            )

        logs_created = 0
        for event in audit_events:
            event_time = now - event.get("offset", timedelta(0))

            # Check for existing similar log (idempotency check)
            # We check for logs with same user, action, and within 1 hour window
            existing = AuditLog.objects.filter(
                user=user,
                action=event["action"],
                timestamp__gte=event_time - timedelta(hours=1),
                timestamp__lte=event_time + timedelta(hours=1),
            ).exists()

            if not existing:
                AuditLog.objects.create(
                    user=user,
                    user_email=user.email,
                    organization=organization,
                    organization_slug=organization.slug if organization else "",
                    action=event["action"],
                    resource_type=event.get("resource_type", ""),
                    resource_id=event.get("resource_id"),
                    ip_address="127.0.0.1",
                    user_agent="Seed Data Generator / 1.0",
                    details=event.get("details", {}),
                    success=True,
                )
                logs_created += 1

        if logs_created > 0:
            self._log_created("AuditLogs", f"{logs_created} entries for {user.email}")
        else:
            self._log_existing("AuditLogs", f"all entries for {user.email}")

        return logs_created
