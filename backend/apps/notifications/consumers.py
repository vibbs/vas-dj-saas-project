"""
WebSocket consumer for real-time notifications.

Users connect to ws://<host>/ws/notifications/ with a JWT token.
They receive notifications in real-time as they are created.
"""

import json
import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer that pushes notifications to authenticated users.

    Group naming: `notifications_{user_id}`
    """

    async def connect(self):
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous:
            await self.close(code=4401)
            return

        self.group_name = f"notifications_{self.user.id}"

        # Join the user's notification group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        logger.info(f"WebSocket connected: user={self.user.email}")

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )
        logger.info(f"WebSocket disconnected: code={close_code}")

    async def receive_json(self, content, **kwargs):
        """Handle messages from the client (e.g., mark-as-read)."""
        action = content.get("action")

        if action == "mark_read":
            notification_id = content.get("notification_id")
            if notification_id:
                await self._mark_notification_read(notification_id)

    async def notification_message(self, event):
        """
        Handle notification events sent to the group.

        Called when another part of the system sends:
            channel_layer.group_send(
                f"notifications_{user_id}",
                {"type": "notification.message", "data": {...}}
            )
        """
        await self.send_json(event["data"])

    async def _mark_notification_read(self, notification_id):
        """Mark a notification as read via the database."""
        from channels.db import database_sync_to_async

        from .models import Notification

        @database_sync_to_async
        def mark_read(nid, user):
            try:
                notif = Notification.objects.get(id=nid, recipient=user)
                notif.mark_as_read()
                return True
            except Notification.DoesNotExist:
                return False

        success = await mark_read(notification_id, self.user)
        if success:
            await self.send_json(
                {"type": "read_confirmation", "notification_id": notification_id}
            )
