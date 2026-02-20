"""
OAuth provider implementations for server-side token verification.

Each provider verifies the access_token or id_token directly with the
provider's API, extracting the verified user profile (email, name, avatar,
provider_user_id). This prevents clients from spoofing provider data.
"""

import logging
from dataclasses import dataclass

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass
class OAuthUserInfo:
    """Verified user information from an OAuth provider."""

    provider: str
    provider_user_id: str
    email: str
    first_name: str
    last_name: str
    avatar: str


class OAuthProviderError(Exception):
    """Raised when OAuth token verification fails."""

    pass


class BaseOAuthProvider:
    """Base class for OAuth providers."""

    provider_name: str = ""

    def verify_token(self, token: str) -> OAuthUserInfo:
        raise NotImplementedError


class GoogleOAuthProvider(BaseOAuthProvider):
    """
    Verifies Google OAuth tokens.

    Accepts either:
    - An ID token (JWT) — verified via Google's tokeninfo endpoint
    - An access token — verified via Google's userinfo endpoint
    """

    provider_name = "google"
    TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    def verify_token(self, token: str) -> OAuthUserInfo:
        # Try as ID token first, fall back to access token
        user_info = self._verify_id_token(token)
        if not user_info:
            user_info = self._verify_access_token(token)

        if not user_info:
            raise OAuthProviderError("Invalid Google token")

        return user_info

    def _verify_id_token(self, id_token: str) -> OAuthUserInfo | None:
        try:
            resp = requests.get(
                self.TOKENINFO_URL,
                params={"id_token": id_token},
                timeout=10,
            )
            if resp.status_code != 200:
                return None

            data = resp.json()

            # Verify audience matches our client ID
            client_id = getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", None)
            if client_id and data.get("aud") != client_id:
                logger.warning("Google ID token audience mismatch")
                return None

            if not data.get("email_verified", "false") == "true":
                logger.warning("Google email not verified")
                return None

            return OAuthUserInfo(
                provider="google",
                provider_user_id=data["sub"],
                email=data["email"],
                first_name=data.get("given_name", ""),
                last_name=data.get("family_name", ""),
                avatar=data.get("picture", ""),
            )
        except Exception as e:
            logger.debug(f"Google ID token verification failed: {e}")
            return None

    def _verify_access_token(self, access_token: str) -> OAuthUserInfo | None:
        try:
            resp = requests.get(
                self.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
            if resp.status_code != 200:
                return None

            data = resp.json()

            if not data.get("email_verified", False):
                logger.warning("Google email not verified")
                return None

            return OAuthUserInfo(
                provider="google",
                provider_user_id=data["sub"],
                email=data["email"],
                first_name=data.get("given_name", ""),
                last_name=data.get("family_name", ""),
                avatar=data.get("picture", ""),
            )
        except Exception as e:
            logger.debug(f"Google access token verification failed: {e}")
            return None


class GitHubOAuthProvider(BaseOAuthProvider):
    """
    Verifies GitHub OAuth tokens.

    Uses the GitHub API to fetch the authenticated user's profile and
    primary verified email.
    """

    provider_name = "github"
    USER_URL = "https://api.github.com/user"
    EMAILS_URL = "https://api.github.com/user/emails"

    def verify_token(self, token: str) -> OAuthUserInfo:
        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            }

            # Fetch user profile
            user_resp = requests.get(self.USER_URL, headers=headers, timeout=10)
            if user_resp.status_code != 200:
                raise OAuthProviderError("Invalid GitHub token")

            user_data = user_resp.json()

            # Fetch verified email
            email = user_data.get("email")
            if not email:
                email = self._fetch_primary_email(headers)

            if not email:
                raise OAuthProviderError(
                    "No verified email found on GitHub account"
                )

            # Parse name
            full_name = user_data.get("name", "") or ""
            parts = full_name.split(" ", 1)
            first_name = parts[0] if parts else ""
            last_name = parts[1] if len(parts) > 1 else ""

            return OAuthUserInfo(
                provider="github",
                provider_user_id=str(user_data["id"]),
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar=user_data.get("avatar_url", ""),
            )

        except OAuthProviderError:
            raise
        except Exception as e:
            logger.error(f"GitHub token verification failed: {e}")
            raise OAuthProviderError("Failed to verify GitHub token")

    def _fetch_primary_email(self, headers: dict) -> str | None:
        """Fetch the user's primary verified email from the GitHub emails API."""
        try:
            resp = requests.get(self.EMAILS_URL, headers=headers, timeout=10)
            if resp.status_code != 200:
                return None

            emails = resp.json()
            # Find primary verified email
            for entry in emails:
                if entry.get("primary") and entry.get("verified"):
                    return entry["email"]

            # Fall back to any verified email
            for entry in emails:
                if entry.get("verified"):
                    return entry["email"]

            return None
        except Exception:
            return None


# Provider registry
_PROVIDERS = {
    "google": GoogleOAuthProvider,
    "github": GitHubOAuthProvider,
}


def get_oauth_provider(provider_name: str) -> BaseOAuthProvider:
    """Get an OAuth provider instance by name."""
    provider_class = _PROVIDERS.get(provider_name)
    if not provider_class:
        raise OAuthProviderError(f"Unsupported OAuth provider: {provider_name}")
    return provider_class()
