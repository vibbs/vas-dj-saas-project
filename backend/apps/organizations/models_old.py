from django.core.validators import MinLengthValidator
from django.db import models

from .managers import OrganizationManager


class Organization(models.Model):
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(3)],
        help_text="Name of the organization",
    )
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    logo = models.URLField(blank=True, null=True)

    # Base fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    creator_email = models.EmailField()
    creator_name = models.CharField(max_length=255, blank=True)

    # Business metadata
    is_active = models.BooleanField(default=True)
    paid_until = models.DateField(blank=True, null=True)
    on_trial = models.BooleanField(default=False)
    trial_ends_on = models.DateField(blank=True, null=True)
    sub_domain = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique subdomain for the organization",
        validators=[MinLengthValidator(3)],
    )

    # Manager
    objects = OrganizationManager()

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        ordering = ["-created_at"]
