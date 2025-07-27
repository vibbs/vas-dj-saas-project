# In core/managers.py
from django.db import models


class OrganizationManager(models.Manager):
    def __init__(self, organisation_field="organization"):
        super().__init__()
        self.organisation_field = organisation_field

    def for_organization(self, organization):
        """
        Filter objects for a specific organization.
        """
        return self.filter(**{self.organisation_field: organization})

    def get_queryset(self):
        """
        Override to return a queryset that is filtered by the organization.
        """
        return (
            super()
            .get_queryset()
            .filter(**{self.organisation_field: self._get_current_organization()})
        )
