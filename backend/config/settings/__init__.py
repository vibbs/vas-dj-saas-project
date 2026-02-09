# settings/__init__.py
import os

if os.environ.get("APP_ENV") == "prod":
    from config.settings.production import *
else:
    from config.settings.development import *  # Default to development settings
