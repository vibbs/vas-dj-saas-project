#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    print("Using settings module:", os.environ['DJANGO_SETTINGS_MODULE'])
    print(f"APP_ENV: {os.environ.get('APP_ENV', 'not set')}")
    if os.environ.get('APP_ENV') == 'prod':
        print("Running in production mode")
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
    else:
        print("Running in development mode")
    print("Running with Python version:", sys.version)
    print("Command line arguments:", sys.argv)
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
