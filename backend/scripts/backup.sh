#!/usr/bin/env bash
# Database backup script
# Usage: ./scripts/backup.sh [output_dir]
set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${TIMESTAMP}.sql.gz"

mkdir -p "$OUTPUT_DIR"

echo "Creating database backup..."
docker compose -f docker/docker-compose.yml exec -T db \
  pg_dump -U "${DB_USER:-saas_user}" -d "${DB_NAME:-saas_db}" --clean --if-exists \
  | gzip > "${OUTPUT_DIR}/${FILENAME}"

echo "Backup saved to ${OUTPUT_DIR}/${FILENAME}"
echo "Size: $(du -h "${OUTPUT_DIR}/${FILENAME}" | cut -f1)"

# Keep only the last 10 backups
ls -t "${OUTPUT_DIR}"/backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
echo "Cleanup complete. Keeping last 10 backups."
