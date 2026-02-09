from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"

    def ready(self):
        """Initialize the code registry when Django starts up."""
        from .code_registry import REGISTRY

        REGISTRY.load()
