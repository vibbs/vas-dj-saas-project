# create-django-app

Create a new Django app in the apps directory with proper configuration.

## Parameters

- `new_app_name` (required): Name of the new Django app to create

## Steps

1. Create apps directory if it doesn't exist:
   ```bash
   mkdir -p apps
   ```

2. Create Django app using Docker Compose:
   ```bash
   docker compose -f ./docker/docker-compose.yml run --rm web python manage.py startapp {{new_app_name}} apps/{{new_app_name}}
   ```

3. Update apps.py configuration:
   ```python
   # Write to apps/{{new_app_name}}/apps.py
   from django.apps import AppConfig


   class {{new_app_name|title}}Config(AppConfig):
       default_auto_field = "django.db.models.BigAutoField"
       name = "apps.{{new_app_name}}"
   ```

4. Add app to INSTALLED_APPS in config/settings/base.py:
   ```python
   # Add "apps.{{new_app_name}}" to the end of INSTALLED_APPS list
   ```

5. Build the project:
   ```bash
   make build
   ```

6. Check the project status:
   ```bash
   make check-system
   ```

## Usage

```bash
claude code create-django-app my_new_app
```

This will create a fully configured Django app named `my_new_app` in the `apps/my_new_app` directory, properly configured and ready to use.