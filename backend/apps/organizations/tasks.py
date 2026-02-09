# organizations/tasks.py

import logging

from celery import shared_task
from django.utils import timezone

from apps.core.audit.models import AuditLog

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def schedule_permanent_deletion(self, organization_id):
    """
    Background task to permanently delete an organization after 30-day grace period.
    This task is scheduled to run automatically 30 days after soft delete.
    """
    from apps.organizations.models import Organization

    try:
        organization = Organization.objects.get(id=organization_id)

        # Verify that the organization is still soft-deleted
        if not organization.is_deleted():
            logger.warning(
                f"Organization {organization_id} was restored before permanent deletion. Cancelling deletion."
            )
            return f"Organization {organization_id} was restored. Deletion cancelled."

        # Verify that we're past the scheduled deletion date
        if timezone.now() < organization.scheduled_permanent_deletion:
            logger.warning(
                f"Attempted to permanently delete organization {organization_id} before scheduled time. Retrying later."
            )
            # Reschedule for the correct time
            raise self.retry(eta=organization.scheduled_permanent_deletion)

        # Perform permanent deletion
        org_name = organization.name
        logger.info(
            f"Permanently deleting organization: {org_name} ({organization_id})"
        )
        organization.permanently_delete()

        logger.info(
            f"Successfully deleted organization: {org_name} ({organization_id})"
        )
        return f"Organization {org_name} ({organization_id}) permanently deleted."

    except Organization.DoesNotExist:
        logger.warning(
            f"Organization {organization_id} not found. May have been manually deleted."
        )
        return f"Organization {organization_id} not found."

    except Exception as e:
        logger.error(
            f"Error permanently deleting organization {organization_id}: {str(e)}"
        )
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2**self.request.retries))


@shared_task
def cleanup_expired_deletions():
    """
    Periodic task to clean up organizations that have passed their deletion date.
    This runs daily to catch any missed deletions.
    Should be scheduled in Celery Beat:

    CELERY_BEAT_SCHEDULE = {
        'cleanup-expired-deletions': {
            'task': 'apps.organizations.tasks.cleanup_expired_deletions',
            'schedule': crontab(hour=2, minute=0),  # Run at 2 AM daily
        },
    }

    In Global Mode: Skips platform organization
    """
    from django.conf import settings

    from apps.organizations.models import Organization

    # Get platform org slug if in global mode
    is_global_mode = getattr(settings, "GLOBAL_MODE_ENABLED", False)
    platform_slug = getattr(settings, "GLOBAL_SCOPE_ORG_SLUG", "platform")

    # Find all organizations that are past their scheduled deletion date
    expired_orgs = Organization.objects.filter(
        deleted_at__isnull=False, scheduled_permanent_deletion__lte=timezone.now()
    )

    # In global mode, exclude platform organization
    if is_global_mode:
        expired_orgs = expired_orgs.exclude(slug=platform_slug)

    deleted_count = 0
    error_count = 0
    skipped_count = 0

    for org in expired_orgs:
        try:
            # Double-check: Skip protected platform organization
            if org.extended_properties.get("is_global_scope", False):
                logger.warning(
                    f"Skipping deletion of protected platform organization: {org.name}"
                )
                skipped_count += 1
                continue

            org_name = org.name
            org_id = str(org.id)
            logger.info(f"Cleaning up expired organization: {org_name} ({org_id})")
            org.permanently_delete()
            deleted_count += 1
            logger.info(
                f"Successfully deleted expired organization: {org_name} ({org_id})"
            )
        except Exception as e:
            error_count += 1
            logger.error(f"Error deleting expired organization {org.id}: {str(e)}")

    result = {
        "deleted_count": deleted_count,
        "error_count": error_count,
        "skipped_count": skipped_count,
        "timestamp": timezone.now().isoformat(),
    }

    # Log cleanup results for audit
    AuditLog.log_event(
        event_type="data_deletion",
        resource_type="organization",
        resource_id="bulk_cleanup",
        user=None,
        organization=None,
        outcome="success" if error_count == 0 else "partial_failure",
        details=result,
    )

    logger.info(
        f"Cleanup task completed. Deleted: {deleted_count}, Errors: {error_count}, Skipped: {skipped_count}"
    )
    return result


@shared_task
def export_organization_data(organization_id, requester_email):
    """
    Export all data for an organization (GDPR data portability).
    Generates a comprehensive JSON export of all organization data.
    """
    import json

    from apps.organizations.models import Organization

    try:
        organization = Organization.objects.get(id=organization_id)

        # Compile all organization data
        export_data = {
            "organization": {
                "id": str(organization.id),
                "name": organization.name,
                "slug": organization.slug,
                "description": organization.description,
                "sub_domain": organization.sub_domain,
                "plan": organization.plan,
                "created_at": organization.created_at.isoformat(),
                "updated_at": organization.updated_at.isoformat(),
            },
            "members": [
                {
                    "id": str(membership.user.id),
                    "email": membership.user.email,
                    "first_name": membership.user.first_name,
                    "last_name": membership.user.last_name,
                    "role": membership.role,
                    "joined_at": membership.created_at.isoformat(),
                }
                for membership in organization.memberships.select_related("user").all()
            ],
            "invites": [
                {
                    "email": invite.email,
                    "role": invite.role,
                    "status": invite.status,
                    "invited_at": invite.created_at.isoformat(),
                }
                for invite in organization.invites.all()
            ],
            "audit_logs": [
                {
                    "event_type": log.event_type,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "user_email": log.user_email,
                    "outcome": log.outcome,
                    "details": log.details,
                    "timestamp": log.created_at.isoformat(),
                }
                for log in AuditLog.objects.filter(organization=organization).order_by(
                    "-created_at"
                )[:1000]
            ],
            "exported_at": timezone.now().isoformat(),
            "requester": requester_email,
        }

        # Save export to file (could also upload to S3)
        export_filename = f"org_export_{organization.slug}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.json"
        export_path = f"/tmp/{export_filename}"  # In production, use S3

        with open(export_path, "w") as f:
            json.dump(export_data, f, indent=2)

        # Send export to requester via email
        from apps.accounts.models import Account
        from apps.email_service.services import send_email

        requester = Account.objects.filter(email=requester_email).first()
        if requester:
            context = {
                "organization": organization,
                "export_url": f"/exports/{export_filename}",  # Should be S3 URL in production
                "subject": f"Data Export for {organization.name}",
            }

            send_email(
                organization=organization,
                recipient=requester,
                template_slug="data_export",
                context=context,
            )

        # Log the export for audit purposes
        AuditLog.log_event(
            event_type="data_export",
            resource_type="organization",
            resource_id=str(organization.id),
            user=requester,
            organization=organization,
            outcome="success",
            details={
                "export_filename": export_filename,
                "requester_email": requester_email,
            },
        )

        logger.info(
            f"Data export completed for organization {organization.name} ({organization_id})"
        )
        return {
            "status": "success",
            "export_path": export_path,
            "export_filename": export_filename,
        }

    except Organization.DoesNotExist:
        logger.error(f"Organization {organization_id} not found for data export.")
        return {"status": "error", "message": "Organization not found"}

    except Exception as e:
        logger.error(f"Error exporting organization data {organization_id}: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def anonymize_user_data(user_id, reason=None):
    """
    Anonymize user data (GDPR right to erasure).
    Replaces PII with anonymized data but keeps records for audit purposes.
    """
    import hashlib

    from apps.accounts.models import Account

    try:
        user = Account.objects.get(id=user_id)
        original_email = user.email

        # Generate anonymized identifier
        anonymized_id = hashlib.sha256(
            f"{user_id}{timezone.now().isoformat()}".encode()
        ).hexdigest()[:16]

        # Anonymize user data
        user.email = f"deleted_{anonymized_id}@anonymized.local"
        user.first_name = "Deleted"
        user.last_name = "User"
        user.phone = ""
        user.bio = ""
        user.avatar = None
        user.date_of_birth = None
        user.is_active = False
        user.save()

        # Delete auth providers
        user.auth_providers.all().delete()

        # Log the anonymization for audit purposes
        AuditLog.log_event(
            event_type="data_deletion",
            resource_type="user",
            resource_id=str(user.id),
            user=None,  # User is being deleted
            organization=None,
            outcome="success",
            details={
                "action": "anonymize",
                "original_email": original_email,
                "reason": reason,
            },
        )

        logger.info(f"User data anonymized: {original_email} -> {user.email}")
        return {
            "status": "success",
            "original_email": original_email,
            "anonymized_email": user.email,
        }

    except Account.DoesNotExist:
        logger.error(f"User {user_id} not found for anonymization.")
        return {"status": "error", "message": "User not found"}

    except Exception as e:
        logger.error(f"Error anonymizing user data {user_id}: {str(e)}")
        return {"status": "error", "message": str(e)}
