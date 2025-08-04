"""
Logging configuration for VAS-DJ SaaS project.
"""

import logging
import logging.config
import logging.handlers

from django.conf import settings

from apps.lib.log_utils import TransactionIDFilter

APP_ENV = settings.APP_ENV.lower()
LOG_LEVEL = settings.LOG_LEVEL.upper()
LOG_APP_PREFIX = settings.LOG_APP_PREFIX.lower()

# Use different formatters based on environment
if APP_ENV == "prod":
    try:
        from pythonjsonlogger import jsonlogger

        json_formatter = {
            "()": jsonlogger.JsonFormatter,
            "fmt": "%(asctime)s %(levelname)s %(name)s %(transaction_id)s %(message)s",
            "rename_fields": {
                "asctime": "timestamp",
                "levelname": "level",
                "name": "logger",
                "transaction_id": "transaction_id",
                "message": "message",
            },
        }
    except ImportError:
        raise ImportError(
            "Install python-json-logger for prod log formatting: pip install python-json-logger"
        )

    formatter_name = "json"
    formatter_config = {"json": json_formatter}

else:
    # Use color logs in development if available
    try:
        from rich.logging import RichHandler

        handler_class = "rich.logging.RichHandler"
        formatter_name = "rich"
        formatter_config = {
            "rich": {
                "format": "[%(levelname)s] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            }
        }
    except ImportError:
        handler_class = "logging.StreamHandler"
        formatter_name = "default"
        formatter_config = {
            "default": {
                "format": "%(levelname)s %(asctime)s %(name)s %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            }
        }

config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": formatter_config,
    "filters": {
        "transaction_id_filter": {
            "()": TransactionIDFilter,
        },
    },
    "handlers": {
        "console": {
            "level": LOG_LEVEL,
            "class": handler_class if APP_ENV == "dev" else "logging.StreamHandler",
            "formatter": formatter_name,
        },
        "syslog": {
            "class": "logging.handlers.SysLogHandler",
            "formatter": formatter_name,
            "facility": logging.handlers.SysLogHandler.LOG_LOCAL7,
            "level": logging.DEBUG,
        },
    },
    "loggers": {
        # "d": {
        #     "handlers": ["console"],
        #     "level": LOG_LEVEL,
        #     "propagate": True,
        #     "filters": ["transaction_id_filter"],
        # },
        LOG_APP_PREFIX: {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
            "filters": ["transaction_id_filter"],
        },
        "django": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": True,
            "filters": ["transaction_id_filter"],
        },
        "django.server": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
            "filters": ["transaction_id_filter"],
        },
        "django.request": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": True,
            "filters": ["transaction_id_filter"],
        },
        "*": {
            "handlers": ["console", "syslog"],
            "level": LOG_LEVEL,
            "propagate": False,
            "filters": ["transaction_id_filter"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": LOG_LEVEL,
        "propagate": True,
        "filters": ["transaction_id_filter"],
    },
}

logging.config.dictConfig(config)
logging.captureWarnings(True)
