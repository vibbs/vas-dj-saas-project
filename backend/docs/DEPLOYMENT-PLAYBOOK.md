# Deployment Playbook

Zero-downtime deployment guide for the VAS-DJ SaaS platform.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Zero-Downtime Deployment Strategy](#zero-downtime-deployment-strategy)
4. [Database Migrations](#database-migrations)
5. [Rollback Procedures](#rollback-procedures)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Architecture Overview

### Production Stack
```
┌─────────────────┐
│  Load Balancer  │  (ALB/Nginx)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ Web1 │  │ Web2 │  (Gunicorn + Django)
└───┬──┘  └──┬───┘
    │         │
    └────┬────┘
         │
┌────────▼─────────┐
│   PostgreSQL     │  (Primary + Replica)
└──────────────────┘
         │
┌────────▼─────────┐
│   Redis Cluster  │  (Cache + Celery)
└──────────────────┘
         │
┌────────▼─────────┐
│  Celery Workers  │  (Background Tasks)
└──────────────────┘
```

### Deployment Components
- **Gunicorn**: WSGI server (multiple workers)
- **Nginx**: Reverse proxy & static file serving
- **PostgreSQL**: Primary database with read replicas
- **Redis**: Caching + Celery broker
- **Celery**: Background task processing

---

## Pre-Deployment Checklist

### 1. Environment Validation
```bash
# Verify all environment variables are set
python manage.py check --deploy

# Run system checks
make check-system

# Verify database connectivity
python manage.py dbshell
```

### 2. Code Quality & Testing
```bash
# Run full test suite
make test-coverage

# Run security tests
make test-security

# Lint and format
make lint

# Type checking (if using mypy)
mypy apps/
```

### 3. Database Backup
```bash
# Create full database backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup integrity
pg_restore --list backup_*.sql | head -20

# Store backup in S3/GCS
aws s3 cp backup_*.sql s3://vas-dj-backups/$(date +%Y-%m-%d)/
```

### 4. Feature Flags
```bash
# Disable risky features before deployment
python manage.py shell
>>> from apps.feature_flags.models import FeatureFlag
>>> FeatureFlag.objects.filter(key='new_feature').update(is_enabled=False)
```

### 5. Communication
- [ ] Notify team in #deployments Slack channel
- [ ] Update status page (if deploying during business hours)
- [ ] Schedule deployment window (off-peak hours preferred)

---

## Zero-Downtime Deployment Strategy

### Rolling Deployment (Recommended)

#### Step 1: Prepare New Code
```bash
# SSH to deployment server
ssh deploy@prod-web-1

# Pull latest code
cd /var/www/vas-dj-saas
git fetch origin
git checkout production
git pull origin production

# Install dependencies (using UV for speed)
uv pip sync requirements/production.txt

# Collect static files
python manage.py collectstatic --noinput

# Compile translations (if applicable)
python manage.py compilemessages
```

#### Step 2: Database Migrations (Critical Path)
```bash
# Test migrations on staging first
ssh deploy@staging-web-1
python manage.py migrate --plan
python manage.py migrate

# Run migrations on production (with transaction wrapping)
ssh deploy@prod-web-1
python manage.py migrate --verbosity 2 | tee migration_$(date +%Y%m%d_%H%M%S).log

# Verify migration status
python manage.py showmigrations
```

**Migration Best Practices:**
- Always test on staging with production-like data
- Use `RunPython.noop` for reversible data migrations
- Add indexes concurrently: `migrations.AddIndex(..., operation='CONCURRENT')`
- Avoid blocking operations during peak hours

#### Step 3: Rolling Restart (Web Servers)
```bash
# Assuming 4 web servers behind load balancer

# Server 1: Drain connections and restart
ssh deploy@prod-web-1
sudo systemctl reload gunicorn  # Graceful reload
# Wait 30 seconds for health check
curl -f http://localhost:8000/health/ || exit 1

# Server 2: Repeat
ssh deploy@prod-web-2
sudo systemctl reload gunicorn
sleep 30 && curl -f http://localhost:8000/health/ || exit 1

# Server 3: Repeat
ssh deploy@prod-web-3
sudo systemctl reload gunicorn
sleep 30 && curl -f http://localhost:8000/health/ || exit 1

# Server 4: Repeat
ssh deploy@prod-web-4
sudo systemctl reload gunicorn
sleep 30 && curl -f http://localhost:8000/health/ || exit 1
```

**Gunicorn Graceful Reload:**
```bash
# Gunicorn responds to SIGHUP for graceful reload
kill -HUP $(cat /var/run/gunicorn.pid)

# Or via systemd
sudo systemctl reload gunicorn
```

#### Step 4: Celery Workers (Background Tasks)
```bash
# Restart celery workers with warm shutdown
ssh deploy@prod-celery-1
sudo systemctl restart celery-worker
sleep 10

# Restart celery beat (only one instance)
ssh deploy@prod-celery-beat
sudo systemctl restart celery-beat
```

#### Step 5: Clear Caches
```bash
# Clear Redis cache keys (if needed)
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()

# Or selectively clear feature flags cache
>>> cache.delete_pattern('feature_flag:*')
```

---

## Database Migrations

### Migration Safety Guidelines

#### Safe Migrations (Can deploy anytime)
- ✅ Adding new tables
- ✅ Adding nullable columns
- ✅ Adding indexes concurrently (PostgreSQL 11+)
- ✅ Creating new models

#### Risky Migrations (Requires downtime or multi-phase)
- ⚠️ Removing columns (use multi-phase deployment)
- ⚠️ Renaming columns (use multi-phase deployment)
- ⚠️ Adding non-nullable columns (add as nullable first)
- ⚠️ Changing column types (may lock table)

#### Multi-Phase Migration Example

**Phase 1: Add New Column**
```python
# migration_0001_add_new_field.py
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='account',
            name='new_email_verified',
            field=models.BooleanField(null=True, blank=True),
        ),
    ]
```

**Phase 2: Backfill Data**
```python
# migration_0002_backfill_email_verified.py
def backfill_email_verified(apps, schema_editor):
    Account = apps.get_model('accounts', 'Account')
    Account.objects.filter(email_verified_at__isnull=False).update(
        new_email_verified=True
    )
    Account.objects.filter(email_verified_at__isnull=True).update(
        new_email_verified=False
    )

class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(backfill_email_verified, migrations.RunPython.noop),
    ]
```

**Phase 3: Make Non-Nullable**
```python
# migration_0003_make_non_nullable.py
class Migration(migrations.Migration):
    operations = [
        migrations.AlterField(
            model_name='account',
            name='new_email_verified',
            field=models.BooleanField(default=False),
        ),
    ]
```

**Phase 4: Remove Old Column**
```python
# migration_0004_remove_old_field.py
class Migration(migrations.Migration):
    operations = [
        migrations.RemoveField(
            model_name='account',
            name='email_verified_at',
        ),
    ]
```

### Handling Long-Running Migrations
```bash
# Set statement timeout to prevent long locks
ALTER DATABASE vas_dj_saas SET statement_timeout = '30s';

# Create indexes concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_accounts_email ON accounts_account(email);

# Add column with default (no rewrite in PostgreSQL 11+)
ALTER TABLE accounts_account ADD COLUMN is_active BOOLEAN DEFAULT true;
```

---

## Rollback Procedures

### Rollback Decision Criteria
Initiate rollback if:
- Error rate > 5% in last 5 minutes
- Response time p95 > 2 seconds
- Critical feature is broken
- Database corruption detected

### Code Rollback
```bash
# Step 1: Revert to previous git commit
ssh deploy@prod-web-1
cd /var/www/vas-dj-saas
git log --oneline -5  # Find previous commit
git checkout <previous-commit-sha>

# Step 2: Reinstall dependencies
uv pip sync requirements/production.txt

# Step 3: Collect static files
python manage.py collectstatic --noinput

# Step 4: Rolling restart (same as deployment)
sudo systemctl reload gunicorn
```

### Database Rollback
```bash
# Reverse last migration
python manage.py migrate <app_name> <previous_migration_number>

# Example: Rollback accounts app to migration 0034
python manage.py migrate accounts 0034

# Verify rollback
python manage.py showmigrations accounts
```

### Full System Rollback
```bash
# 1. Restore database from backup
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME backup_20250116_140000.sql

# 2. Revert code to previous version
git checkout <stable-commit>

# 3. Restart all services
sudo systemctl restart gunicorn celery-worker celery-beat

# 4. Clear caches
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

---

## Post-Deployment Verification

### 1. Health Checks
```bash
# Application health
curl -f https://api.yourdomain.com/health/
curl -f https://api.yourdomain.com/api/v1/health/

# Database connectivity
python manage.py dbshell -c "SELECT 1;"

# Redis connectivity
redis-cli ping
```

### 2. Smoke Tests
```bash
# Test critical API endpoints
curl -X GET https://api.yourdomain.com/api/v1/accounts/users/me/ \
  -H "Authorization: Bearer $TEST_TOKEN"

curl -X GET https://api.yourdomain.com/api/v1/organizations/ \
  -H "Authorization: Bearer $TEST_TOKEN"

# Test authentication
curl -X POST https://api.yourdomain.com/api/v1/auth/login/ \
  -d '{"email":"test@example.com","password":"testpass"}'
```

### 3. Monitoring Verification
```bash
# Check error rate in last 5 minutes
curl -s "https://api.yourdomain.com/metrics" | grep error_rate

# Check response times
curl -s "https://api.yourdomain.com/metrics" | grep response_time_p95

# Check Celery queue length
python manage.py shell
>>> from celery import current_app
>>> current_app.control.inspect().active()
```

### 4. Sentry Verification
- Check Sentry dashboard for new errors: https://sentry.io/vas-dj-saas/
- Verify no critical errors in last 10 minutes
- Review performance degradation alerts

### 5. Audit Log Verification
```bash
# Verify audit logs are being written
python manage.py shell
>>> from apps.core.models import AuditLog
>>> AuditLog.objects.filter(created_at__gte=now() - timedelta(minutes=5)).count()
```

### 6. User Acceptance Testing
- [ ] Test user login/logout
- [ ] Test organization creation
- [ ] Test critical user flows (depends on your app)
- [ ] Verify email notifications are sent

---

## Deployment Automation (CI/CD)

### GitHub Actions Workflow Example
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches:
      - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Tests
        run: make test-coverage

      - name: Backup Database
        run: |
          pg_dump -h ${{ secrets.DB_HOST }} -U ${{ secrets.DB_USER }} \
            ${{ secrets.DB_NAME }} > backup_$(date +%Y%m%d_%H%M%S).sql

      - name: Deploy Code
        run: |
          ssh deploy@prod-web-1 "cd /var/www/vas-dj-saas && git pull"

      - name: Run Migrations
        run: |
          ssh deploy@prod-web-1 "cd /var/www/vas-dj-saas && \
            python manage.py migrate --verbosity 2"

      - name: Rolling Restart
        run: |
          for server in prod-web-{1..4}; do
            ssh deploy@$server "sudo systemctl reload gunicorn"
            sleep 30
          done

      - name: Smoke Tests
        run: |
          curl -f https://api.yourdomain.com/health/

      - name: Notify Slack
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"🚀 Deployment to production completed!"}'
```

---

## Troubleshooting

### Issue: High Error Rate After Deployment
```bash
# Check application logs
tail -f /var/log/gunicorn/error.log

# Check Django logs
tail -f /var/log/vas-dj-saas/django.log

# Check Sentry for stack traces
open https://sentry.io/vas-dj-saas/

# Rollback if error rate > 5%
git checkout <previous-commit>
sudo systemctl reload gunicorn
```

### Issue: Slow Response Times
```bash
# Check database query performance
SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

# Check Redis connection
redis-cli --stat

# Check Celery queue backlog
celery -A config inspect active_queues
```

### Issue: Migration Failure
```bash
# Check migration status
python manage.py showmigrations

# View failed migration
python manage.py sqlmigrate <app_name> <migration_number>

# Fake migration (if already applied manually)
python manage.py migrate --fake <app_name> <migration_number>

# Rollback migration
python manage.py migrate <app_name> <previous_migration_number>
```

---

## Security Considerations

### Pre-Deployment Security Checks
```bash
# Check for hardcoded secrets
grep -r "SECRET_KEY\|API_KEY\|PASSWORD" . --exclude-dir=.git

# Verify DEBUG=False
python manage.py diffsettings | grep DEBUG

# Check ALLOWED_HOSTS
python manage.py diffsettings | grep ALLOWED_HOSTS

# Run security checks
python manage.py check --deploy
```

### Post-Deployment Security Verification
```bash
# Verify HTTPS is enforced
curl -I http://api.yourdomain.com  # Should redirect to HTTPS

# Verify HSTS headers
curl -I https://api.yourdomain.com | grep Strict-Transport-Security

# Verify CSP headers
curl -I https://api.yourdomain.com | grep Content-Security-Policy

# Test rate limiting
for i in {1..100}; do curl https://api.yourdomain.com/api/v1/auth/login/; done
```

---

## Deployment Checklist (TL;DR)

### Pre-Deployment
- [ ] Run full test suite: `make test-coverage`
- [ ] Backup database: `pg_dump > backup_$(date +%Y%m%d).sql`
- [ ] Test migrations on staging
- [ ] Notify team in Slack
- [ ] Disable risky feature flags

### Deployment
- [ ] Pull latest code: `git pull origin production`
- [ ] Install dependencies: `uv pip sync requirements/production.txt`
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Rolling restart: `sudo systemctl reload gunicorn` (all servers)
- [ ] Restart Celery: `sudo systemctl restart celery-worker celery-beat`

### Post-Deployment
- [ ] Health check: `curl -f https://api.yourdomain.com/health/`
- [ ] Smoke tests: Test critical API endpoints
- [ ] Check Sentry for errors
- [ ] Verify monitoring dashboards (Grafana)
- [ ] Monitor error rate for 15 minutes
- [ ] Re-enable feature flags (if disabled)
- [ ] Update deployment log

### Rollback (If Needed)
- [ ] Revert code: `git checkout <previous-commit>`
- [ ] Rollback migrations: `python manage.py migrate <app> <previous>`
- [ ] Restart services: `sudo systemctl reload gunicorn`
- [ ] Restore database (if needed): `pg_restore backup_*.sql`

---

## Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Gunicorn Deployment](https://docs.gunicorn.org/en/stable/deploy.html)
- [PostgreSQL Backup & Recovery](https://www.postgresql.org/docs/current/backup.html)
- [Celery Deployment](https://docs.celeryproject.org/en/stable/userguide/deployment.html)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-16
**Owner:** DevOps Team
**Review Schedule:** Quarterly
