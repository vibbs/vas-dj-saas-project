#!/usr/bin/env bash
# Database restore script
# Usage: ./scripts/restore.sh <backup_file>
set -euo pipefail

BACKUP_FILE="${1:?Usage: ./scripts/restore.sh <backup_file.sql.gz>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will overwrite the current database!"
read -p "Are you sure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker compose -f docker/docker-compose.yml exec -T db \
  psql -U "${DB_USER:-saas_user}" -d "${DB_NAME:-saas_db}"

echo "Restore complete."
