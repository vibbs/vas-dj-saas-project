"""
Celery tasks for account management.
"""

import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from apps.accounts.models import Account

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def cleanup_unverified_accounts(self):
    """
    Delete unverified accounts that are older than 24 hours.

    Runs daily at 2 AM via Celery Beat.

    Criteria for deletion:
    - status = 'PENDING'
    - is_email_verified = False
    - created_at < 24 hours ago

    Returns:
        str: Summary of deleted accounts
    """
    try:
        cutoff = timezone.now() - timedelta(hours=24)

        # Find accounts to delete
        accounts_to_delete = Account.objects.filter(
            status='PENDING',
            is_email_verified=False,
            created_at__lt=cutoff
        )

        # Log for monitoring
        count = accounts_to_delete.count()
        emails = list(accounts_to_delete.values_list('email', flat=True))

        logger.info(f"Cleanup task: Found {count} unverified accounts to delete")

        if count > 0:
            # Delete accounts (this will cascade delete related objects)
            accounts_to_delete.delete()

            logger.info(f"Cleanup task: Successfully deleted {count} unverified accounts")
            return f"Deleted {count} unverified accounts: {', '.join(emails)}"
        else:
            logger.info("Cleanup task: No unverified accounts to delete")
            return "No unverified accounts to delete"

    except Exception as exc:
        logger.error(f"Cleanup task failed: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
