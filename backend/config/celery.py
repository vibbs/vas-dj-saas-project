import os

import django
from celery import Celery
from decouple import config

# Set the default Django settings module for the 'celery' program.
if config("APP_ENV", default="dev") == "prod":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

# Setup Django before creating Celery app for django-tenants compatibility
django.setup()

app = Celery("config")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Daily cleanup of expired organization deletions (runs at 2 AM)
    "cleanup-expired-deletions": {
        "task": "apps.organizations.tasks.cleanup_expired_deletions",
        "schedule": crontab(hour=2, minute=0),
        "options": {
            "expires": 3600,  # Task expires after 1 hour if not picked up
        },
    },
    # Add more periodic tasks here as needed
}
