from .base import *
from decouple import config

DEBUG = config("DEBUG", default=False, cast=bool)

# Production-specific settings
SECRET_KEY = config("SECRET_KEY")
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="", cast=lambda v: [s.strip() for s in v.split(",") if s.strip()])
