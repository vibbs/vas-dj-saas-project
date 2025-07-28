import logging
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Account, AccountAuthProvider
from .serializers import (
    AccountSerializer,
    AccountCreateSerializer,
    AccountAuthProviderSerializer,
)

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
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        serializer.is_valid(raise_exception=True)
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
