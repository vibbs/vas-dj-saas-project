#!/bin/bash
set -e

# Docker entrypoint script for Django application
# Handles database waiting, migrations, and optional seed data

echo "=== Django Entrypoint ==="

# Configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
MAX_RETRIES=30
RETRY_INTERVAL=2

# Wait for database to be ready
echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
retries=0
while ! nc -z "${DB_HOST}" "${DB_PORT}"; do
    retries=$((retries + 1))
    if [ $retries -ge $MAX_RETRIES ]; then
        echo "Error: Database not available after ${MAX_RETRIES} attempts"
        exit 1
    fi
    echo "  Attempt ${retries}/${MAX_RETRIES} - waiting ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done
echo "PostgreSQL is ready!"

# Run migrations
echo ""
echo "Running database migrations..."
python manage.py migrate --noinput
echo "Migrations complete!"

# Seed data (only in development mode with AUTO_SEED_DATA enabled)
if [ "${DEBUG}" = "True" ] || [ "${DEBUG}" = "true" ] || [ "${DEBUG}" = "1" ]; then
    if [ "${AUTO_SEED_DATA}" = "True" ] || [ "${AUTO_SEED_DATA}" = "true" ] || [ "${AUTO_SEED_DATA}" = "1" ]; then
        echo ""
        echo "Seeding development data..."
        python manage.py setup_local_data --auto --full --skip-superuser || {
            echo "Warning: Seed data command encountered an error (data may already exist)"
            echo "This is normal if the database already has seed data."
        }
        echo "Seed data complete!"
    else
        echo ""
        echo "Skipping seed data (AUTO_SEED_DATA not enabled)"
        echo "To enable: set AUTO_SEED_DATA=true in environment"
    fi
else
    echo ""
    echo "Skipping seed data (not in DEBUG mode)"
fi

echo ""
echo "=== Starting Application ==="

# Execute the main command (passed as arguments)
exec "$@"
