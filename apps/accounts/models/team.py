from django.db import models
from apps.accounts.enums import TeamRoleTypes
from apps.accounts.models.account import Account
from django.conf import settings
from apps.organizations.models import BaseFields


class Team(BaseFields, models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="teams")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.user.name})"

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        ordering = ["name"]
        unique_together = ("organization", "user", "slug")


class TeamMembership(BaseFields, models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships"
    )
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="members")
    role = models.CharField(
        max_length=50,
        choices=[(tag, tag.value) for tag in TeamRoleTypes],
        default=TeamRoleTypes.MEMBER,
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Team Membership"
        verbose_name_plural = "Team Memberships"
        unique_together = ("organization", "user", "team")

    def __str__(self):
        return f"{self.team.name} - {self.user} ({self.role})"
