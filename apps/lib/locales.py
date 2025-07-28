"""
Locale configuration for the Django SaaS project.

This module defines the supported locales and language configurations
used throughout the application.
"""

from django.utils.translation import gettext_lazy as _

LOCALES = [
    ("en", _("English")),
]

LANGUAGE_CODE_DEFAULT = "en"

LOCALE_PATHS_RELATIVE = [
    "locale",
]