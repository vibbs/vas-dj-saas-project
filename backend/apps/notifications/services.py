"""
Service layer for creating and broadcasting notifications.

Usage:
    from apps.notifications.services import send_notification

    send_notification(
        recipient=user,
        title="New member joined",
        message="Alice joined your team",
        category="team",
    )
"""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification, NotificationCategory, NotificationPriority

logger = logging.getLogger(__name__)


def send_notification(
    recipient,
    title: str,
    message: str,
    category: str = NotificationCategory.SYSTEM,
    priority: str = NotificationPriority.MEDIUM,
    organization=None,
    action_url: str = "",
    metadata: dict | None = None,
):
    """
    Create a notification and broadcast it to the user's WebSocket channel.

    Args:
        recipient: Account instance
        title: Notification title
        message: Notification body
        category: One of NotificationCategory choices
        priority: One of NotificationPriority choices
        organization: Optional Organization instance
        action_url: Optional URL for the notification action
        metadata: Optional JSON metadata
    """
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        category=category,
        priority=priority,
        organization=organization,
        action_url=action_url,
        metadata=metadata or {},
    )

    # Broadcast to WebSocket
    _broadcast_notification(notification)

    return notification


def _broadcast_notification(notification: Notification):
    """Send notification to the user's WebSocket channel group."""
    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return

        group_name = f"notifications_{notification.recipient_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "notification.message",
                "data": {
                    "type": "new_notification",
                    "notification": {
                        "id": str(notification.id),
                        "title": notification.title,
                        "message": notification.message,
                        "category": notification.category,
                        "priority": notification.priority,
                        "action_url": notification.action_url,
                        "created_at": notification.created_at.isoformat(),
                        "is_read": notification.is_read,
                    },
                },
            },
        )
    except Exception as e:
        logger.warning(f"Failed to broadcast notification: {e}")
