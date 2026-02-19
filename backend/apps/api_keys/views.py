import logging

from django.conf import settings
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ApiKey
from .serializers import (
    ApiKeySerializer,
    ApiKeyUsageSerializer,
    CreateApiKeyResponseSerializer,
    CreateApiKeySerializer,
)

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.api_keys.views")


def _get_organization(view):
    """Get organization from nested URL kwargs or request context."""
    from apps.organizations.models import Organization

    org_pk = view.kwargs.get("organization_pk")
    if org_pk:
        try:
            return Organization.objects.get(pk=org_pk)
        except Organization.DoesNotExist:
            return None
    return getattr(view.request, "org", None)


@extend_schema_view(
    list=extend_schema(tags=["API Keys"]),
    retrieve=extend_schema(tags=["API Keys"]),
)
class ApiKeyViewSet(viewsets.ModelViewSet):
    serializer_class = ApiKeySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        """Get API keys for the current organization."""
        organization = _get_organization(self)
        if organization:
            return ApiKey.objects.filter(organization=organization)
        return ApiKey.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return CreateApiKeySerializer
        return ApiKeySerializer

    @extend_schema(
        tags=["API Keys"],
        request=CreateApiKeySerializer,
        responses=CreateApiKeyResponseSerializer,
    )
    def create(self, request, *args, **kwargs):
        """Create a new API key."""
        serializer = CreateApiKeySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization = _get_organization(self)
        if not organization:
            return Response(
                {"error": "Organization context required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_key, prefix, key_hash = ApiKey.generate_key()

        api_key = ApiKey.objects.create(
            organization=organization,
            created_by=request.user,
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get("description", ""),
            key_prefix=prefix,
            key_hash=key_hash,
            scopes=serializer.validated_data.get("scopes", []),
            expires_at=serializer.validated_data.get("expires_at"),
        )

        # Return the full key only on creation
        response_data = CreateApiKeyResponseSerializer(api_key).data
        response_data["key"] = full_key

        return Response(response_data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=["API Keys"])
    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        """Revoke an API key."""
        api_key = self.get_object()
        api_key.revoke()
        return Response(ApiKeySerializer(api_key).data)

    @extend_schema(tags=["API Keys"])
    @action(detail=True, methods=["post"])
    def regenerate(self, request, pk=None):
        """Regenerate an API key (revokes old, creates new with same config)."""
        old_key = self.get_object()
        old_key.revoke()

        full_key, prefix, key_hash = ApiKey.generate_key()

        new_key = ApiKey.objects.create(
            organization=old_key.organization,
            created_by=request.user,
            name=old_key.name,
            description=old_key.description,
            key_prefix=prefix,
            key_hash=key_hash,
            scopes=old_key.scopes,
            expires_at=old_key.expires_at,
        )

        response_data = CreateApiKeyResponseSerializer(new_key).data
        response_data["key"] = full_key
        return Response(response_data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=["API Keys"], responses=ApiKeyUsageSerializer)
    @action(detail=True, methods=["get"])
    def usage(self, request, pk=None):
        """Get usage stats for an API key."""
        api_key = self.get_object()
        return Response(
            ApiKeyUsageSerializer(
                {
                    "total_requests": api_key.total_requests,
                    "last_used_at": api_key.last_used_at,
                }
            ).data
        )
