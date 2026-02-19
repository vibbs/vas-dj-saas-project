import logging

from django.conf import settings
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, NotificationPreference
from .serializers import (
    NotificationPreferenceSerializer,
    NotificationSerializer,
    UnreadCountSerializer,
)

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.notifications.views")


@extend_schema_view(
    list=extend_schema(tags=["Notifications"]),
    retrieve=extend_schema(tags=["Notifications"]),
    destroy=extend_schema(tags=["Notifications"]),
)
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Filter by read status
        is_read = self.request.query_params.get("is_read")
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == "true")

        return queryset

    @extend_schema(tags=["Notifications"])
    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        return Response(NotificationSerializer(notification).data)

    @extend_schema(tags=["Notifications"])
    @action(detail=True, methods=["post"])
    def unread(self, request, pk=None):
        """Mark a notification as unread."""
        notification = self.get_object()
        notification.is_read = False
        notification.read_at = None
        notification.save(update_fields=["is_read", "read_at", "updated_at"])
        return Response(NotificationSerializer(notification).data)

    @extend_schema(tags=["Notifications"])
    @action(detail=False, methods=["post"])
    def read_all(self, request):
        """Mark all notifications as read."""
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True, read_at=timezone.now())
        return Response({"marked_read": count})

    @extend_schema(tags=["Notifications"], responses=UnreadCountSerializer)
    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Get unread notification count."""
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({"count": count})


@extend_schema_view(
    get=extend_schema(tags=["Notifications"]),
    put=extend_schema(tags=["Notifications"]),
    patch=extend_schema(tags=["Notifications"]),
)
class NotificationPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get notification preferences."""
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(prefs)
        return Response(serializer.data)

    def put(self, request):
        """Update notification preferences."""
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(prefs, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """Partially update notification preferences."""
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(
            prefs, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
