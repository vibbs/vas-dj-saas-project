import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import Account, AccountAuthProvider
from apps.accounts.serializers import (
    AccountAuthProviderSerializer,
    AccountCreateSerializer,
    AccountSerializer,
)
from apps.core.exceptions.client_errors import ValidationException
from apps.organizations.models import OrganizationMembership

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.accounts.views")
User = get_user_model()


@extend_schema_view(
    list=extend_schema(
        summary="List all accounts",
        description="Retrieve a paginated list of all user accounts in the organization.",
        tags=["Accounts"],
    ),
    create=extend_schema(
        summary="Create new account",
        description="Create a new user account with email and password.",
        request=AccountCreateSerializer,
        responses={201: AccountSerializer},
        tags=["Accounts"],
    ),
    retrieve=extend_schema(
        summary="Get account details",
        description="Retrieve detailed information about a specific user account.",
        tags=["Accounts"],
    ),
    update=extend_schema(
        summary="Update account",
        description="Update user account information.",
        tags=["Accounts"],
    ),
    partial_update=extend_schema(
        summary="Partially update account",
        description="Partially update user account information.",
        tags=["Accounts"],
    ),
    destroy=extend_schema(
        summary="Delete account",
        description="Permanently delete a user account.",
        tags=["Accounts"],
    ),
)
class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter accounts to only those in organizations where the user is a member.
        Superusers can see all accounts.
        Optimized with prefetch_related to prevent N+1 queries.
        """
        user = self.request.user

        # Base queryset with performance optimizations
        queryset = Account.objects.prefetch_related(
            # Prefetch active memberships with organization details
            Prefetch(
                "organization_memberships",
                queryset=OrganizationMembership.objects.filter(
                    status="active"
                ).select_related("organization"),
                to_attr="active_memberships_list",
            ),
            # Prefetch auth providers
            "auth_providers",
        )

        # Superusers can see all accounts
        if user.is_superuser:
            return queryset

        # Get all organizations where the user has active membership
        user_org_ids = user.get_active_memberships().values_list(
            "organization_id", flat=True
        )

        # Return accounts that have memberships in any of those organizations
        return queryset.filter(
            organization_memberships__organization_id__in=user_org_ids,
            organization_memberships__status="active",
        ).distinct()

    def get_serializer_class(self):
        if self.action == "create":
            return AccountCreateSerializer
        return AccountSerializer

    @extend_schema(
        summary="Get current user profile",
        description="Retrieve the profile information of the currently authenticated user.",
        responses={200: AccountSerializer},
        tags=["Accounts"],
    )
    @action(detail=False, methods=["get"])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        summary="Update current user profile",
        description="Update the profile information of the currently authenticated user.",
        request=AccountSerializer,
        responses={200: AccountSerializer},
        tags=["Accounts"],
    )
    @action(detail=False, methods=["patch"])
    def update_profile(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            issues = []
            for field_name, field_errors in serializer.errors.items():
                if not isinstance(field_errors, list):
                    field_errors = [field_errors]

                for error in field_errors:
                    issue = {
                        "message": str(error),
                        "path": (
                            [field_name] if field_name != "non_field_errors" else []
                        ),
                        "type": "field_validation",
                    }
                    issues.append(issue)

            raise ValidationException(detail="Validation failed", issues=issues)

        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        summary="Get user's auth providers",
        description="Retrieve all authentication providers linked to a user account.",
        responses={200: AccountAuthProviderSerializer(many=True)},
        tags=["Accounts"],
    )
    @action(detail=True, methods=["get"])
    def auth_providers(self, request, pk=None):
        user = self.get_object()
        providers = AccountAuthProvider.objects.filter(user=user)
        serializer = AccountAuthProviderSerializer(providers, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Change password",
        description="Change the current user's password. Requires the current password for verification and validates the new password meets security requirements.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "old_password": {
                        "type": "string",
                        "description": "Current password for verification"
                    },
                    "new_password": {
                        "type": "string",
                        "description": "New password (must meet security requirements)"
                    }
                },
                "required": ["old_password", "new_password"]
            }
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "example": "Password changed successfully"
                    }
                }
            }
        },
        tags=["Accounts"],
    )
    @action(detail=False, methods=["post"])
    def change_password(self, request):
        """
        Change user password.

        Requires:
        - old_password: Current password for verification
        - new_password: New password (must meet security requirements)

        Returns: 200 OK on success

        Security features:
        - Validates current password
        - Enforces Django password validators
        - Logs password change in audit log
        """
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        from apps.core.audit.models import AuditAction, AuditLog

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        # Validation - check required fields
        if not old_password or not new_password:
            issues = []
            if not old_password:
                issues.append({
                    "message": "Current password is required",
                    "path": ["old_password"],
                    "type": "field_validation"
                })
            if not new_password:
                issues.append({
                    "message": "New password is required",
                    "path": ["new_password"],
                    "type": "field_validation"
                })
            raise ValidationException(
                detail="Both old_password and new_password are required",
                issues=issues
            )

        # Verify current password
        if not request.user.check_password(old_password):
            raise ValidationException(
                detail="Current password is incorrect",
                issues=[
                    {
                        "message": "The current password you entered is incorrect",
                        "path": ["old_password"],
                        "type": "password_validation"
                    }
                ]
            )

        # Validate new password using Django validators
        try:
            validate_password(new_password, request.user)
        except DjangoValidationError as e:
            raise ValidationException(
                detail="New password does not meet security requirements",
                issues=[
                    {
                        "message": str(error),
                        "path": ["new_password"],
                        "type": "password_validation"
                    }
                    for error in e.messages
                ]
            )

        # Change password
        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        # Audit log
        AuditLog.log_event(
            event_type=AuditAction.PASSWORD_CHANGE,
            resource_type="user",
            resource_id=str(request.user.id),
            user=request.user,
            organization=request.user.get_primary_organization(),
            outcome="success",
            details={"action": "password_changed"}
        )

        return Response({
            "message": "Password changed successfully. Please login again with your new password."
        })
