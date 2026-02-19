from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from apps.api_keys.views import ApiKeyViewSet

from .. import views

# Main router for organizations
router = DefaultRouter()
router.register(r"", views.OrganizationViewSet, basename="organization")

# Nested router for invites under organizations
invites_router = routers.NestedDefaultRouter(router, r"", lookup="organization")
invites_router.register(
    r"invites", views.InviteViewSet, basename="organization-invites"
)

# Nested router for memberships under organizations
memberships_router = routers.NestedDefaultRouter(router, r"", lookup="organization")
memberships_router.register(
    r"members", views.MembershipViewSet, basename="organization-members"
)

# Nested router for API keys under organizations
api_keys_router = routers.NestedDefaultRouter(router, r"", lookup="organization")
api_keys_router.register(
    r"api-keys", ApiKeyViewSet, basename="organization-api-keys"
)

urlpatterns = [
    path("", include(router.urls)),
    path("", include(invites_router.urls)),
    path("", include(memberships_router.urls)),
    path("", include(api_keys_router.urls)),
    # Public invite acceptance endpoint (no org_pk required)
    path(
        "invites/accept/",
        views.InviteViewSet.as_view({"post": "accept_invite"}),
        name="invite-accept",
    ),
]
