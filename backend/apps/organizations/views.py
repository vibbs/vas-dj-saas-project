from django.conf import settings
from django.db.models import Count, Prefetch, Q
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import (
    CanCreateOrganization,
    CanDeleteOrganization,
    CanInviteMembers,
    CanManageOrganization,
)

from .models import Invite, Organization, OrganizationMembership
from .serializers import (
    AcceptInviteSerializer,
    CreateInviteSerializer,
    InviteSerializer,
    MembershipUpdateSerializer,
    OrganizationMembershipSerializer,
    OrganizationSerializer,
)


@extend_schema_view(
    list=extend_schema(
        summary="List organizations",
        description="Retrieve a list of all organizations the user has access to.",
        tags=["Organizations"],
    ),
    create=extend_schema(
        summary="Create organization",
        description="Create a new organization.",
        tags=["Organizations"],
    ),
    retrieve=extend_schema(
        summary="Get organization details",
        description="Retrieve detailed information about a specific organization.",
        tags=["Organizations"],
    ),
    update=extend_schema(
        summary="Update organization",
        description="Update organization information.",
        tags=["Organizations"],
    ),
    partial_update=extend_schema(
        summary="Partially update organization",
        description="Partially update organization information.",
        tags=["Organizations"],
    ),
    destroy=extend_schema(
        summary="Delete organization",
        description="Permanently delete an organization.",
        tags=["Organizations"],
    ),
)
class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.

        Different actions require different permissions:
        - create: Requires CanCreateOrganization (blocked in global mode)
        - update/partial_update: Requires CanManageOrganization
        - destroy/soft_delete: Requires CanDeleteOrganization
        - list/retrieve: Requires IsAuthenticated
        """
        if self.action == 'create':
            permission_classes = [IsAuthenticated, CanCreateOrganization]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, CanManageOrganization]
        elif self.action in ['destroy', 'soft_delete']:
            permission_classes = [IsAuthenticated, CanDeleteOrganization]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filter organizations to only those where the user has active membership.
        Superusers can see all organizations.
        Optimized with annotations to prevent N+1 queries.
        """
        user = self.request.user

        # Base queryset with performance optimizations
        queryset = (
            Organization.objects.annotate(
                # Count active members (used by serializer)
                active_member_count=Count(
                    "memberships", filter=Q(memberships__status="active"), distinct=True
                )
            )
            .select_related("created_by")  # Avoid extra query for creator
            .prefetch_related(
                # Prefetch active memberships efficiently
                Prefetch(
                    "memberships",
                    queryset=OrganizationMembership.objects.filter(
                        status="active"
                    ).select_related("user"),
                    to_attr="active_memberships_list",
                )
            )
        )

        # Superusers can see all organizations
        if user.is_superuser:
            return queryset

        # Get all organizations where the user has active membership
        user_org_ids = user.get_active_memberships().values_list(
            "organization_id", flat=True
        )

        return queryset.filter(id__in=user_org_ids, is_active=True).distinct()

    def update(self, request, *args, **kwargs):
        """
        Update organization settings.
        Only ADMIN or OWNER can update organization.
        """
        from apps.core.audit.models import AuditAction, AuditLog

        organization = self.get_object()

        # RBAC check - only ADMIN or OWNER can update
        if not request.user.is_admin_of(organization) and not request.user.is_superuser:
            return Response(
                {"error": "Only organization administrators or owners can update settings"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Perform update
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(organization, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Log what fields are being updated
        updated_fields = list(request.data.keys())

        self.perform_update(serializer)

        # Audit log
        AuditLog.log_event(
            event_type=AuditAction.ORG_UPDATE,
            resource_type='organization',
            resource_id=str(organization.id),
            user=request.user,
            organization=organization,
            outcome='success',
            details={
                'updated_fields': updated_fields,
                'changes': request.data
            }
        )

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Partial update with RBAC checks."""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @extend_schema(
        summary="Get organization stats",
        description="Retrieve statistics and metrics for the organization.",
        responses={200: dict},
        tags=["Organizations"],
    )
    @action(detail=True, methods=["get"])
    def stats(self, request, pk=None):
        organization = self.get_object()
        # Example stats - you can customize based on your needs
        stats = {
            "total_users": organization.memberships.filter(status="active").count(),
            "active_users": organization.memberships.filter(status="active").count(),
            "created_at": organization.created_at,
            "is_on_trial": organization.on_trial,
            "trial_ends_on": organization.trial_ends_on,
        }
        return Response(stats)

    @extend_schema(
        summary="Soft delete organization",
        description="Soft delete the organization (GDPR compliant). Organization will be permanently deleted after 30 days.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "Reason for deletion (optional)",
                    }
                },
            }
        },
        responses={200: dict},
        tags=["Organizations"],
    )
    @action(detail=True, methods=["post"], url_path="soft-delete")
    def soft_delete(self, request, pk=None):
        """
        Soft delete an organization. Only owners can delete organizations.
        """
        organization = self.get_object()
        user = request.user

        # Check if user is owner
        if not user.is_owner_of(organization) and not user.is_superuser:
            return Response(
                {"error": "Only organization owners can delete the organization."},
                status=403,
            )

        # Check if already deleted
        if organization.is_deleted():
            return Response({"error": "Organization is already deleted."}, status=400)

        # Get deletion reason from request
        reason = request.data.get("reason", None)

        # Perform soft delete
        organization.soft_delete(deleted_by=user, reason=reason)

        return Response(
            {
                "message": "Organization has been scheduled for deletion.",
                "organization_id": str(organization.id),
                "deleted_at": organization.deleted_at.isoformat(),
                "scheduled_permanent_deletion": organization.scheduled_permanent_deletion.isoformat(),
                "grace_period_days": 30,
            }
        )

    @extend_schema(
        summary="Restore deleted organization",
        description="Restore a soft-deleted organization (within 30-day grace period).",
        responses={200: dict},
        tags=["Organizations"],
    )
    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        """
        Restore a soft-deleted organization. Only owners and superusers can restore.
        """
        organization = self.get_object()
        user = request.user

        # Check if user is owner or superuser
        if not user.is_owner_of(organization) and not user.is_superuser:
            return Response(
                {"error": "Only organization owners can restore the organization."},
                status=403,
            )

        # Check if organization is deleted
        if not organization.is_deleted():
            return Response({"error": "Organization is not deleted."}, status=400)

        # Check if can be restored (within grace period)
        if not organization.can_be_restored():
            return Response(
                {"error": "Organization cannot be restored. Grace period has expired."},
                status=400,
            )

        # Restore the organization
        success = organization.restore(restored_by=user)

        if success:
            return Response(
                {
                    "message": "Organization has been restored successfully.",
                    "organization_id": str(organization.id),
                    "is_active": organization.is_active,
                }
            )
        else:
            return Response({"error": "Failed to restore organization."}, status=500)

    @extend_schema(
        summary="Export organization data",
        description="Export all organization data for GDPR data portability (right to data portability).",
        responses={202: dict},
        tags=["Organizations", "GDPR"],
    )
    @action(detail=True, methods=["post"], url_path="export-data")
    def export_data(self, request, pk=None):
        """
        Trigger a background task to export all organization data.
        The export will be emailed to the requester when ready.
        """
        organization = self.get_object()
        user = request.user

        # Check if user is owner or admin
        if not user.is_admin_of(organization) and not user.is_superuser:
            return Response(
                {"error": "Only organization admins can export organization data."},
                status=403,
            )

        # Trigger Celery task for data export
        from apps.organizations.tasks import export_organization_data

        task = export_organization_data.delay(str(organization.id), user.email)

        return Response(
            {
                "message": "Data export has been initiated. You will receive an email when the export is ready.",
                "task_id": task.id,
                "organization_id": str(organization.id),
            },
            status=202,
        )

    @extend_schema(
        summary="Check deletion status",
        description="Check if organization is scheduled for deletion and when.",
        responses={200: dict},
        tags=["Organizations"],
    )
    @action(detail=True, methods=["get"], url_path="deletion-status")
    def deletion_status(self, request, pk=None):
        """
        Get deletion status for an organization.
        """
        organization = self.get_object()

        if not organization.is_deleted():
            return Response(
                {
                    "is_deleted": False,
                    "is_active": organization.is_active,
                }
            )

        return Response(
            {
                "is_deleted": True,
                "deleted_at": (
                    organization.deleted_at.isoformat()
                    if organization.deleted_at
                    else None
                ),
                "deleted_by": (
                    organization.deleted_by.email if organization.deleted_by else None
                ),
                "deletion_reason": organization.deletion_reason,
                "scheduled_permanent_deletion": (
                    organization.scheduled_permanent_deletion.isoformat()
                    if organization.scheduled_permanent_deletion
                    else None
                ),
                "can_be_restored": organization.can_be_restored(),
                "days_until_permanent_deletion": (
                    (
                        organization.scheduled_permanent_deletion
                        - organization.deleted_at
                    ).days
                    if organization.scheduled_permanent_deletion
                    and organization.deleted_at
                    else None
                ),
            }
        )


@extend_schema_view(
    list=extend_schema(
        summary="List organization invites",
        description="Retrieve all invites for the organization (admin only).",
        tags=["Invites"],
    ),
    create=extend_schema(
        summary="Create organization invite",
        description="Send an invite to join the organization (admin only).",
        tags=["Invites"],
    ),
    retrieve=extend_schema(
        summary="Get invite details",
        description="Retrieve details about a specific invite.",
        tags=["Invites"],
    ),
    destroy=extend_schema(
        summary="Revoke invite",
        description="Revoke a pending invite (admin only).",
        tags=["Invites"],
    ),
)
class InviteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing organization invites."""

    serializer_class = InviteSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete"]  # No PUT/PATCH on invites

    def get_queryset(self):
        """
        Filter invites based on user permissions.
        Admins can see all invites for their organization.
        Regular users can only see invites sent to their email.
        """
        user = self.request.user
        organization_id = self.kwargs.get("organization_pk")

        if not organization_id:
            # For accept_invite action (no organization_pk)
            return Invite.objects.filter(email__iexact=user.email)

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Invite.objects.none()

        # Check if user is admin of this organization
        if user.is_superuser or user.is_admin_of(organization):
            return Invite.objects.filter(organization=organization).select_related(
                "organization", "invited_by", "accepted_by"
            )

        # Regular users can only see invites sent to their email
        return Invite.objects.filter(
            organization=organization, email__iexact=user.email
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "create":
            return CreateInviteSerializer
        elif self.action == "accept_invite":
            return AcceptInviteSerializer
        return InviteSerializer

    def perform_create(self, serializer):
        """Create invite with organization and invited_by context."""
        organization_id = self.kwargs.get("organization_pk")
        organization = Organization.objects.get(id=organization_id)

        # Security check: Only admins can send invites
        if (
            not self.request.user.is_admin_of(organization)
            and not self.request.user.is_superuser
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only organization admins can send invites")

        # Create the invite
        invite = serializer.save(
            organization=organization,
            invited_by=self.request.user,
        )

        # Send invite email
        self._send_invite_email(invite)

    def perform_destroy(self, instance):
        """Revoke the invite instead of deleting it."""
        # Security check: Only admins can revoke invites
        if (
            not self.request.user.is_admin_of(instance.organization)
            and not self.request.user.is_superuser
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only organization admins can revoke invites")

        # Revoke the invite
        instance.revoke()

    @extend_schema(
        summary="Resend invite",
        description="Resend an invite email with a new token (admin only).",
        responses={200: InviteSerializer},
        tags=["Invites"],
    )
    @action(detail=True, methods=["post"])
    def resend(self, request, organization_pk=None, pk=None):
        """Resend an invite with a new token."""
        invite = self.get_object()

        # Security check: Only admins can resend invites
        if (
            not request.user.is_admin_of(invite.organization)
            and not request.user.is_superuser
        ):
            return Response(
                {"error": "Only organization admins can resend invites"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            invite.resend()
            self._send_invite_email(invite)

            return Response(
                {
                    "message": "Invite resent successfully",
                    "invite": InviteSerializer(invite).data,
                }
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Accept invite",
        description="Accept an invite using a token (authenticated users).",
        request=AcceptInviteSerializer,
        responses={200: OrganizationMembershipSerializer},
        tags=["Invites"],
    )
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def accept_invite(self, request):
        """Accept an invite and create membership."""
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            membership = serializer.save(user=request.user)

            # Log the acceptance
            from apps.core.audit.logger import AuditLogger

            AuditLogger.log_membership_created(
                request=request,
                organization=membership.organization,
                user=request.user,
                membership=membership,
                action="invite_accepted",
            )

            return Response(
                {
                    "message": "Invite accepted successfully",
                    "membership": OrganizationMembershipSerializer(membership).data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _send_invite_email(self, invite):
        """Send invite email notification."""
        from apps.email_service.services import EmailService

        try:
            email_service = EmailService.for_organization(invite.organization)

            # Prepare context for the email template
            context = {
                "organization_name": invite.organization.name,
                "invited_by_name": invite.invited_by.full_name,
                "invite_url": invite.get_accept_url(),
                "role": invite.get_role_display(),
                "message": invite.message or "",
                "expires_at": invite.expires_at,
            }

            # Send the email using the organization_invite template
            email_service.send_email(
                recipient=invite.email,
                template_slug="organization_invite",
                context=context,
                send_async=True,
            )
        except Exception as e:
            # Log error but don't fail the invite creation
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send invite email to {invite.email}: {str(e)}")


@extend_schema_view(
    list=extend_schema(
        summary="List organization members",
        description="Retrieve all members of the organization.",
        tags=["Memberships"],
    ),
    retrieve=extend_schema(
        summary="Get member details",
        description="Retrieve details about a specific member.",
        tags=["Memberships"],
    ),
    update=extend_schema(
        summary="Update member role/status",
        description="Update member role or status (admin only).",
        tags=["Memberships"],
    ),
    partial_update=extend_schema(
        summary="Partially update member",
        description="Partially update member role or status (admin only).",
        tags=["Memberships"],
    ),
    destroy=extend_schema(
        summary="Remove member",
        description="Remove a member from the organization (admin only).",
        tags=["Memberships"],
    ),
)
class MembershipViewSet(viewsets.ModelViewSet):
    """ViewSet for managing organization memberships."""

    serializer_class = OrganizationMembershipSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete"]  # No POST (use invites), no PUT

    def get_queryset(self):
        """
        Filter memberships based on user permissions.
        Users can see all members of organizations they belong to.
        """
        user = self.request.user
        organization_id = self.kwargs.get("organization_pk")

        if not organization_id:
            return OrganizationMembership.objects.none()

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return OrganizationMembership.objects.none()

        # Check if user is member of this organization
        if user.is_superuser or user.has_membership_in(organization):
            return OrganizationMembership.objects.filter(
                organization=organization
            ).select_related("user", "organization", "invited_by")

        return OrganizationMembership.objects.none()

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ["update", "partial_update"]:
            return MembershipUpdateSerializer
        return OrganizationMembershipSerializer

    def perform_update(self, serializer):
        """Update membership with permission checks."""
        membership = self.get_object()

        # Security check: Only admins can update memberships
        if (
            not self.request.user.is_admin_of(membership.organization)
            and not self.request.user.is_superuser
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only organization admins can update memberships")

        # Prevent self-demotion (admins can't demote themselves)
        if membership.user == self.request.user and membership.role in [
            "owner",
            "admin",
        ]:
            new_role = serializer.validated_data.get("role", membership.role)
            if new_role not in ["owner", "admin"]:
                from rest_framework.exceptions import ValidationError

                raise ValidationError(
                    "You cannot demote yourself. Ask another admin to change your role."
                )

        serializer.save()

        # Log the update
        from apps.core.audit.logger import AuditLogger

        AuditLogger.log_membership_updated(
            request=self.request,
            organization=membership.organization,
            user=self.request.user,
            membership=membership,
        )

    def perform_destroy(self, instance):
        """Remove member from organization."""
        # Security check: Only admins can remove members
        if (
            not self.request.user.is_admin_of(instance.organization)
            and not self.request.user.is_superuser
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only organization admins can remove members")

        # Prevent self-removal for owners
        if instance.user == self.request.user and instance.role == "owner":
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                "Owners cannot remove themselves. Transfer ownership first."
            )

        # Prevent removing the last owner
        if instance.role == "owner":
            owner_count = instance.organization.memberships.filter(
                role="owner", status="active"
            ).count()
            if owner_count <= 1:
                from rest_framework.exceptions import ValidationError

                raise ValidationError(
                    "Cannot remove the last owner. Promote another member to owner first."
                )

        # Log the removal before deleting
        from apps.core.audit.logger import AuditLogger

        AuditLogger.log_membership_deleted(
            request=self.request,
            organization=instance.organization,
            user=self.request.user,
            membership=instance,
        )

        # Delete the membership
        instance.delete()

    @extend_schema(
        summary="Suspend member",
        description="Suspend a member's access to the organization (admin only).",
        responses={200: OrganizationMembershipSerializer},
        tags=["Memberships"],
    )
    @action(detail=True, methods=["post"])
    def suspend(self, request, organization_pk=None, pk=None):
        """Suspend a member's access."""
        membership = self.get_object()

        # Security check: Only admins can suspend members
        if (
            not request.user.is_admin_of(membership.organization)
            and not request.user.is_superuser
        ):
            return Response(
                {"error": "Only organization admins can suspend members"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Prevent self-suspension
        if membership.user == request.user:
            return Response(
                {"error": "You cannot suspend yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent suspending the last owner
        if membership.role == "owner":
            owner_count = membership.organization.memberships.filter(
                role="owner", status="active"
            ).count()
            if owner_count <= 1:
                return Response(
                    {"error": "Cannot suspend the last owner"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        membership.status = "suspended"
        membership.save(update_fields=["status", "updated_at"])

        # Log the suspension
        from apps.core.audit.logger import AuditLogger

        AuditLogger.log_membership_updated(
            request=request,
            organization=membership.organization,
            user=request.user,
            membership=membership,
            action="suspended",
        )

        return Response(
            {
                "message": "Member suspended successfully",
                "membership": OrganizationMembershipSerializer(membership).data,
            }
        )

    @extend_schema(
        summary="Reactivate member",
        description="Reactivate a suspended member (admin only).",
        responses={200: OrganizationMembershipSerializer},
        tags=["Memberships"],
    )
    @action(detail=True, methods=["post"])
    def reactivate(self, request, organization_pk=None, pk=None):
        """Reactivate a suspended member."""
        membership = self.get_object()

        # Security check: Only admins can reactivate members
        if (
            not request.user.is_admin_of(membership.organization)
            and not request.user.is_superuser
        ):
            return Response(
                {"error": "Only organization admins can reactivate members"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if membership.status != "suspended":
            return Response(
                {"error": "Member is not suspended"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.status = "active"
        membership.save(update_fields=["status", "updated_at"])

        # Log the reactivation
        from apps.core.audit.logger import AuditLogger

        AuditLogger.log_membership_updated(
            request=request,
            organization=membership.organization,
            user=request.user,
            membership=membership,
            action="reactivated",
        )

        return Response(
            {
                "message": "Member reactivated successfully",
                "membership": OrganizationMembershipSerializer(membership).data,
            }
        )
