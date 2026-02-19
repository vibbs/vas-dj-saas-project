import hashlib
import secrets
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class ApiKeyScope(models.TextChoices):
    READ = "read", "Read"
    WRITE = "write", "Write"
    ADMIN = "admin", "Admin"
    BILLING = "billing", "Billing"
    MEMBERS = "members", "Members"


class ApiKeyStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    REVOKED = "revoked", "Revoked"
    EXPIRED = "expired", "Expired"


class ApiKey(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="api_keys",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_api_keys",
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")

    # The key prefix is stored for display (e.g., "vdj_sk_abc1")
    key_prefix = models.CharField(max_length=12)
    # The full key hash for authentication
    key_hash = models.CharField(max_length=128, unique=True)

    scopes = models.JSONField(
        default=list,
        help_text="List of API key scopes",
    )
    status = models.CharField(
        max_length=10,
        choices=ApiKeyStatus.choices,
        default=ApiKeyStatus.ACTIVE,
    )

    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    # Usage tracking
    total_requests = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["key_hash"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.key_prefix}...)"

    @staticmethod
    def generate_key():
        """Generate a new API key with prefix."""
        raw_key = secrets.token_urlsafe(32)
        full_key = f"vdj_sk_{raw_key}"
        prefix = full_key[:12]
        key_hash = hashlib.sha256(full_key.encode()).hexdigest()
        return full_key, prefix, key_hash

    @staticmethod
    def hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode()).hexdigest()

    @property
    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() >= self.expires_at

    @property
    def is_active(self):
        return self.status == ApiKeyStatus.ACTIVE and not self.is_expired

    def revoke(self):
        self.status = ApiKeyStatus.REVOKED
        self.revoked_at = timezone.now()
        self.save(update_fields=["status", "revoked_at", "updated_at"])

    def record_usage(self):
        self.last_used_at = timezone.now()
        self.total_requests += 1
        self.save(update_fields=["last_used_at", "total_requests", "updated_at"])
