"""
Core models for multi-tenant SaaS architecture.

This module provides base model classes that support organization-scoped
multi-tenancy with automatic audit fields and UUID primary keys.
"""

import uuid

from django.conf import settings
from django.db import models

from apps.core.managers import OrganizationManager


class TenantAwareModel(models.Model):
    """
    Abstract base model for organization-scoped multi-tenancy.
    
    All models inheriting from this will automatically be scoped to
    an organization, supporting the multi-tenant architecture.
    """
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="%(class)s_set",
        null=True,
        blank=True,
        help_text="Organization this record belongs to. Can be null for global records."
    )

    class Meta:
        abstract = True


class BaseFields(TenantAwareModel):
    """
    Abstract base model with common audit fields and UUID primary key.
    
    Provides automatic creation/update timestamps, user tracking,
    UUID primary keys, and extensible JSON properties for all models.
    """
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_%(class)s_set",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_%(class)s_set",
    )
    extended_properties = models.JSONField(default=dict, blank=True)

    objects = OrganizationManager()

    class Meta:
        abstract = True
        ordering = ["-created_at"]
        get_latest_by = "created_at"
