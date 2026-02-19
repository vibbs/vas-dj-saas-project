import logging
from datetime import timedelta

from django.conf import settings
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    DashboardStatsSerializer,
    RecentActivitySerializer,
    TeamOverviewSerializer,
    UsageMetricsSerializer,
)

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.dashboard.views")


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=["Dashboard"], responses=DashboardStatsSerializer)
    def get(self, request):
        """Get dashboard statistics for the current organization."""
        organization = getattr(request, "org", None)

        stats = {
            "total_members": 0,
            "active_members": 0,
            "pending_invites": 0,
            "total_api_keys": 0,
            "active_api_keys": 0,
            "unread_notifications": 0,
        }

        if organization:
            from apps.organizations.models import Invite, OrganizationMembership

            stats["total_members"] = OrganizationMembership.objects.filter(
                organization=organization, is_active=True
            ).count()

            stats["active_members"] = OrganizationMembership.objects.filter(
                organization=organization,
                is_active=True,
                user__last_login__gte=timezone.now() - timedelta(days=30),
            ).count()

            stats["pending_invites"] = Invite.objects.filter(
                organization=organization, status="pending"
            ).count()

            try:
                from apps.api_keys.models import ApiKey

                stats["total_api_keys"] = ApiKey.objects.filter(
                    organization=organization
                ).count()
                stats["active_api_keys"] = ApiKey.objects.filter(
                    organization=organization, status="active"
                ).count()
            except Exception:
                pass

        try:
            from apps.notifications.models import Notification

            stats["unread_notifications"] = Notification.objects.filter(
                recipient=request.user, is_read=False
            ).count()
        except Exception:
            pass

        return Response(DashboardStatsSerializer(stats).data)


class RecentActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=["Dashboard"], responses=RecentActivitySerializer(many=True))
    def get(self, request):
        """Get recent activity for the current organization."""
        organization = getattr(request, "org", None)
        activities = []

        if organization:
            try:
                from apps.core.audit.models import AuditLog

                recent_logs = AuditLog.objects.filter(
                    organization=organization
                ).order_by("-created_at")[:20]

                for log_entry in recent_logs:
                    activities.append(
                        {
                            "id": str(log_entry.id),
                            "type": log_entry.action,
                            "description": log_entry.description
                            or f"{log_entry.action} by {log_entry.actor.email if log_entry.actor else 'system'}",
                            "actor_name": log_entry.actor.get_full_name()
                            if log_entry.actor
                            else "System",
                            "actor_email": log_entry.actor.email
                            if log_entry.actor
                            else None,
                            "timestamp": log_entry.created_at.isoformat(),
                            "metadata": log_entry.metadata or {},
                        }
                    )
            except Exception as e:
                log.debug(f"Could not fetch audit logs: {e}")

            # Fallback: generate activity from recent membership changes
            if not activities:
                from apps.organizations.models import OrganizationMembership

                recent_members = OrganizationMembership.objects.filter(
                    organization=organization
                ).order_by("-created_at")[:10]

                for member in recent_members:
                    activities.append(
                        {
                            "id": str(member.id),
                            "type": "member_joined",
                            "description": f"{member.user.get_full_name() or member.user.email} joined the organization",
                            "actor_name": member.user.get_full_name()
                            or member.user.email,
                            "actor_email": member.user.email,
                            "timestamp": member.created_at.isoformat(),
                            "metadata": {},
                        }
                    )

        serializer = RecentActivitySerializer(activities, many=True)
        return Response(serializer.data)


class TeamOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=["Dashboard"], responses=TeamOverviewSerializer)
    def get(self, request):
        """Get team overview for the current organization."""
        organization = getattr(request, "org", None)

        overview = {
            "total_members": 0,
            "active_last_7_days": 0,
            "active_last_30_days": 0,
            "admins": 0,
            "members_by_role": {},
        }

        if organization:
            from apps.organizations.models import OrganizationMembership

            memberships = OrganizationMembership.objects.filter(
                organization=organization, is_active=True
            )

            overview["total_members"] = memberships.count()
            overview["active_last_7_days"] = memberships.filter(
                user__last_login__gte=timezone.now() - timedelta(days=7)
            ).count()
            overview["active_last_30_days"] = memberships.filter(
                user__last_login__gte=timezone.now() - timedelta(days=30)
            ).count()
            overview["admins"] = memberships.filter(
                Q(role="owner") | Q(role="admin")
            ).count()

            # Members by role
            role_counts = (
                memberships.values("role").annotate(count=Count("id")).order_by("role")
            )
            overview["members_by_role"] = {
                item["role"]: item["count"] for item in role_counts
            }

        return Response(TeamOverviewSerializer(overview).data)


class UsageMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=["Dashboard"], responses=UsageMetricsSerializer)
    def get(self, request):
        """Get usage metrics for the current organization."""
        organization = getattr(request, "org", None)

        metrics = {
            "api_requests_today": 0,
            "api_requests_this_week": 0,
            "api_requests_this_month": 0,
            "storage_used_mb": 0,
            "active_integrations": 0,
        }

        if organization:
            try:
                from apps.api_keys.models import ApiKey

                keys = ApiKey.objects.filter(
                    organization=organization, status="active"
                )
                metrics["api_requests_this_month"] = sum(
                    k.total_requests for k in keys
                )
                metrics["active_integrations"] = keys.count()
            except Exception:
                pass

        return Response(UsageMetricsSerializer(metrics).data)
