from decouple import config

from .base import *

DEBUG = config("DEBUG", default=True, cast=bool)

# Media files configuration for development
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
