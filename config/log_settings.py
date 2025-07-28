"""
Logging configuration for Django SaaS project.
"""

import logging
import logging.config
import logging.handlers
from django.conf import settings

config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(levelname)s %(asctime)s %(name)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": settings.LOG_LEVEL,
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
        "syslog": {
            "class": "logging.handlers.SysLogHandler",
            "formatter": "default",
            "facility": logging.handlers.SysLogHandler.LOG_LOCAL7,
            "level": logging.DEBUG,
        },
    },
    "loggers": {
        "d": {
            "handlers": ["console"],
            "level": settings.LOG_LEVEL,
            "propogate": True,
        },
        settings.LOG_APP_PREFIX: {
            "handlers": ["console"],
            "level": settings.LOG_LEVEL,
            "propagate": False,
        },
        "django": {
            "handlers": ["console"],
            "propogate": True,
            "level": settings.LOG_LEVEL,
        },
        "django.server": {
            "handlers": ["console"],
            "level": settings.LOG_LEVEL,
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": settings.LOG_LEVEL,
            "propagate": True,
        },
    },
}

logging.config.dictConfig(config)
logging.captureWarnings(True)
