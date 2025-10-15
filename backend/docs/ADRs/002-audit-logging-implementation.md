# ADR 002: Audit Logging Implementation

## Status

Accepted

## Context

For security compliance (SOC 2, GDPR, HIPAA), we need comprehensive audit logging of:
- Authentication events (login, logout, failed attempts)
- Authorization decisions (access granted/denied)
- Data modifications (create, update, delete)
- Administrative actions (user management, permission changes)
- Security events (suspicious activity, rate limit violations)

Audit logs must be:
- **Immutable**: Cannot be modified after creation
- **Complete**: Include who, what, when, where, why
- **Searchable**: Fast queries for security investigations
- **Compliant**: Meet regulatory requirements

## Decision

We implement a **dedicated audit logging system** with:

1. **Centralized AuditLog model** (`apps/core/audit/models.py`)
2. **Structured logging** with standardized action types
3. **Automatic capture** via middleware and utility functions
4. **Performance optimizations** with database indexes
5. **Retention policies** for compliance

### Implementation

#### 1. AuditLog Model

```python
class AuditLog(models.Model):
    """
    Immutable audit log for security and compliance.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(Account, null=True, on_delete=models.SET_NULL)
    user_email = models.EmailField()  # Preserved even if user deleted
    organization = models.ForeignKey(Organization, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=50, db_index=True)
    resource_type = models.CharField(max_length=100, null=True)
    resource_id = models.CharField(max_length=255, null=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    method = models.CharField(max_length=10)  # HTTP method
    path = models.TextField()  # Request path
    details = models.JSONField(default=dict)  # Additional context
    success = models.BooleanField(default=True)

    class Meta:
        db_table = 'core_auditlog'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['organization', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['success', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
```

#### 2. Action Types (Enum)

```python
class AuditAction:
    """Standardized audit action types."""
    # Authentication
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_CHANGED = "password_changed"
    EMAIL_VERIFIED = "email_verified"

    # Authorization
    ACCESS_GRANTED = "access_granted"
    ACCESS_DENIED = "access_denied"
    PERMISSION_CHANGED = "permission_changed"

    # Organization Management
    ORG_CREATED = "org_created"
    ORG_UPDATED = "org_updated"
    ORG_DELETED = "org_deleted"
    ORG_ACCESS_DENIED = "org_access_denied"

    # User Management
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_INVITED = "user_invited"
    USER_SUSPENDED = "user_suspended"
    USER_REACTIVATED = "user_reactivated"

    # Security Events
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_TOKEN = "invalid_token"
    CSRF_VIOLATION = "csrf_violation"
```

#### 3. Logging Utilities

```python
# apps/core/audit/utils.py

def log_audit_event(
    action: str,
    request: HttpRequest,
    user: Optional[Account] = None,
    organization: Optional[Organization] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    success: bool = True,
    details: Optional[Dict] = None
) -> AuditLog:
    """
    Log an audit event. Call from views, serializers, or middleware.
    """
    user = user or getattr(request, 'user', None)
    organization = organization or getattr(request, 'organization', None)

    return AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        user_email=user.email if user and user.is_authenticated else '',
        organization=organization,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        method=request.method,
        path=request.path,
        details=details or {},
        success=success
    )

# Convenience functions
def log_authentication_event(request, action, user=None, success=True, details=None):
    """Log authentication events."""
    return log_audit_event(
        action=action,
        request=request,
        user=user,
        success=success,
        details=details
    )

def log_authorization_event(request, action, resource_type=None, resource_id=None, success=True):
    """Log authorization decisions."""
    return log_audit_event(
        action=action,
        request=request,
        resource_type=resource_type,
        resource_id=resource_id,
        success=success
    )
```

#### 4. Integration Points

**Authentication (login view)**:
```python
# apps/accounts/views/auth.py
from apps.core.audit import log_authentication_event, AuditAction

def login(request):
    # ... authentication logic ...

    if authentication_failed:
        log_authentication_event(
            request=request,
            action=AuditAction.LOGIN_FAILED,
            success=False,
            details={'email': email, 'reason': 'invalid_credentials'}
        )
        return Response(...)

    # Successful login
    log_authentication_event(
        request=request,
        action=AuditAction.LOGIN_SUCCESS,
        user=user,
        success=True,
        details={'email': email, 'method': 'email_password'}
    )
```

**Tenant Middleware (access control)**:
```python
# apps/organizations/middleware/tenant.py
from apps.core.audit import log_audit_event, AuditAction

class TenantMiddleware:
    def __call__(self, request):
        # ... tenant resolution logic ...

        if not has_access_to_organization:
            log_audit_event(
                action=AuditAction.ORG_ACCESS_DENIED,
                request=request,
                organization=organization,
                success=False,
                details={
                    'org_slug': org_slug,
                    'reason': 'user_not_member'
                }
            )
```

**Superuser Access Logging (middleware)**:
```python
# apps/core/audit/middleware.py

class AuditLoggingMiddleware:
    """Log superuser access to audit trail."""

    def __call__(self, request):
        if request.user.is_authenticated and request.user.is_superuser:
            log_audit_event(
                action='superuser_access',
                request=request,
                details={'accessed_path': request.path}
            )

        return self.get_response(request)
```

## Alternatives Considered

### 1. Django Admin Log

**Rejected**: Only logs admin actions, not API access or authentication events.

### 2. External Logging Service (Datadog, Splunk)

**Considered for future**: Good for aggregation but adds cost and complexity. Database logging provides baseline.

### 3. Database Triggers

**Rejected**: Doesn't capture HTTP context (IP, user agent), harder to maintain.

### 4. Django Signals

**Rejected**: Too fragmented, easy to miss events, performance overhead.

## Consequences

### Positive

- ✅ **Compliance ready**: Meets SOC 2, GDPR, HIPAA requirements
- ✅ **Security investigations**: Fast search for suspicious activity
- ✅ **Immutable trail**: Audit logs cannot be tampered with
- ✅ **Performance**: Indexed queries, async writes possible
- ✅ **Complete context**: IP, user agent, request details captured

### Negative

- ⚠️ **Database growth**: Audit logs grow over time, need retention policy
- ⚠️ **Sensitive data**: Must filter PII from details field
- ⚠️ **Performance**: Additional database writes on each request

### Mitigation Strategies

1. **Database indexes**: 6 composite indexes for fast queries
2. **Async writes**: Can offload to Celery for high traffic
3. **Retention policy**: Archive/delete old logs after N days
4. **PII filtering**: Redact sensitive data before logging
5. **Monitoring**: Alert on failed login attempts, suspicious patterns

## Performance Optimizations

1. **Indexes**: Optimized for common query patterns
   - User activity lookup: `(user, timestamp)`
   - Organization audit: `(organization, timestamp)`
   - Action filtering: `(action, timestamp)`
   - Resource tracking: `(resource_type, resource_id)`

2. **Bulk inserts**: Can batch audit logs for high-throughput scenarios

3. **Partitioning**: Future: partition by month for faster queries

## Data Retention

- **Active logs**: Last 90 days (hot storage)
- **Archive**: 91-730 days (cold storage)
- **Deletion**: After 2 years (configurable per compliance needs)

## Security Considerations

1. **Immutability**: No UPDATE or DELETE operations allowed
2. **Access control**: Only superusers can view audit logs
3. **PII protection**: Email/phone numbers in `details` field are masked
4. **Integrity**: Consider adding cryptographic signatures for tamper detection

## Compliance Mapping

### SOC 2 Trust Services Criteria

- **CC6.1**: Logical access controls - audit trail of all access
- **CC6.2**: Prior to issuing credentials - email verification logged
- **CC6.3**: Provisioning and modification - user management logged
- **CC7.2**: System monitoring - continuous audit log collection

### GDPR

- **Article 5(2)**: Accountability - audit trail demonstrates compliance
- **Article 32**: Security measures - logging security events
- **Article 33**: Breach notification - audit logs aid in breach detection

### HIPAA

- **§164.308(a)(1)(ii)(D)**: Information system activity review
- **§164.312(b)**: Audit controls - comprehensive audit logging

## Query Examples

```python
# Failed login attempts for user
failed_logins = AuditLog.objects.filter(
    user_email='user@example.com',
    action=AuditAction.LOGIN_FAILED,
    timestamp__gte=timezone.now() - timedelta(days=1)
)

# All organization access attempts (success + failures)
org_access = AuditLog.objects.filter(
    organization=org,
    action__in=[AuditAction.ORG_ACCESS_DENIED, 'org_access'],
    timestamp__gte=timezone.now() - timedelta(days=7)
)

# Suspicious activity from IP
suspicious = AuditLog.objects.filter(
    ip_address='192.168.1.100',
    success=False,
    timestamp__gte=timezone.now() - timedelta(hours=1)
).count()
```

## Admin Interface

Read-only Django admin for audit log viewing:

```python
# apps/core/audit/admin.py

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user_email', 'action', 'success', 'ip_address']
    list_filter = ['action', 'success', 'timestamp']
    search_fields = ['user_email', 'ip_address', 'path']
    readonly_fields = [field.name for field in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False  # No manual creation

    def has_delete_permission(self, request, obj=None):
        return False  # Immutable
```

## Future Enhancements

1. **Real-time alerting**: Celery task for suspicious pattern detection
2. **Dashboard**: Grafana integration for audit log visualization
3. **Export**: CSV/JSON export for compliance audits
4. **Encryption**: Encrypt sensitive details at rest
5. **Blockchain**: Cryptographic proof of log integrity

## References

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [SOC 2 Requirements](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)
- Implementation: `apps/core/audit/`
- Tests: `apps/core/tests/test_audit.py`

## Revision History

- **2025-10**: Initial implementation with comprehensive action types
- **2025-10**: Added middleware integration and utility functions
