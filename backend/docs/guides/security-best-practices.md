# Security Best Practices

## Overview

This document outlines security best practices for developing and maintaining the VAS-DJ SaaS backend application.

## Critical Security Principles

### 1. Defense in Depth

Apply multiple layers of security:
- Application-level access control
- Database query filtering
- Network segmentation
- Rate limiting
- Input validation

### 2. Principle of Least Privilege

Users and processes should have minimum necessary permissions:
- Default role: `member` (read-only for most resources)
- Explicit permission grants for write operations
- Superuser access logged and monitored

### 3. Secure by Default

Security features enabled by default:
- `DEBUG = False` in production
- HTTPS enforcement (`SECURE_SSL_REDIRECT = True`)
- Secure cookies (`SESSION_COOKIE_SECURE = True`)
- HSTS headers (`SECURE_HSTS_SECONDS = 31536000`)
- CSRF protection enabled

## Tenant Isolation

### Critical: Always Filter by Organization

**NEVER write queries like this:**

```python
# ❌ VULNERABLE - Returns ALL users across ALL organizations
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
```

**ALWAYS write:**

```python
# ✅ SECURE - Filters by user's organizations
class AccountViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        if self.request.user.is_superuser:
            return Account.objects.all()

        user_org_ids = self.request.user.get_active_memberships().values_list(
            'organization_id', flat=True
        )
        return Account.objects.filter(
            organization_memberships__organization_id__in=user_org_ids
        ).distinct()
```

### Tenant Isolation Checklist

- [ ] Override `get_queryset()` in all ViewSets
- [ ] Filter by `request.user.get_active_memberships()`
- [ ] Handle superuser access explicitly
- [ ] Use `.distinct()` to avoid duplicate results
- [ ] Write tenant isolation tests

### Testing Tenant Isolation

```python
@pytest.mark.security
def test_user_cannot_access_other_org_data(api_client, user1, user2):
    """Ensure users cannot access data from other organizations."""
    api_client.force_authenticate(user=user1)

    # User1 should NOT access User2's data
    response = api_client.get(f'/api/v1/accounts/users/{user2.id}/')
    assert response.status_code in [403, 404]
```

## Authentication Security

### Password Security

1. **Strong password requirements** (enforced by Django validators):
   - Minimum 8 characters
   - Cannot be entirely numeric
   - Cannot be too similar to user information
   - Cannot be a common password

2. **Password hashing** (Argon2):
   ```python
   PASSWORD_HASHERS = [
       'django.contrib.auth.hashers.Argon2PasswordHasher',
       'django.contrib.auth.hashers.PBKDF2PasswordHasher',
   ]
   ```

3. **Never log passwords**:
   ```python
   # ❌ NEVER do this
   logger.info(f"User {email} logged in with password {password}")

   # ✅ Log without sensitive data
   logger.info(f"User {email} logged in successfully")
   ```

### Timing Attack Protection

**NEVER use standard string comparison for tokens:**

```python
# ❌ VULNERABLE to timing attacks
if token == expected_token:
    return True
```

**ALWAYS use constant-time comparison:**

```python
# ✅ SECURE - constant time comparison
import hmac
if hmac.compare_digest(str(token), str(expected_token)):
    return True
```

**Example: Email verification**

```python
# apps/accounts/models/account.py
def verify_email(self, token: str) -> bool:
    # ✅ Use hmac.compare_digest
    if not hmac.compare_digest(str(self.email_verification_token), str(token)):
        return False

    # Check expiration
    if self.email_verification_token_created_at:
        expiry = self.email_verification_token_created_at + timedelta(days=7)
        if timezone.now() > expiry:
            return False

    # Mark as verified
    self.is_email_verified = True
    self.email_verification_token = None
    self.save(update_fields=['is_email_verified', 'email_verification_token'])
    return True
```

### Token Security

1. **Use cryptographically strong tokens**:
   ```python
   import secrets

   # ✅ 512-bit token (64 bytes)
   token = secrets.token_urlsafe(64)
   ```

2. **Single-use tokens**:
   ```python
   # Clear token after use
   user.email_verification_token = None
   user.save(update_fields=['email_verification_token'])
   ```

3. **Token expiration**:
   ```python
   TOKEN_EXPIRY_DAYS = 7
   expiry = token_created_at + timedelta(days=TOKEN_EXPIRY_DAYS)
   if timezone.now() > expiry:
       raise ValidationError("Token has expired")
   ```

### JWT Security

1. **Short access token lifetime**:
   ```python
   SIMPLE_JWT = {
       'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
       'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
       'ROTATE_REFRESH_TOKENS': True,
       'BLACKLIST_AFTER_ROTATION': True,
   }
   ```

2. **Token blacklisting** (logout):
   ```python
   from rest_framework_simplejwt.tokens import RefreshToken

   def logout(request):
       refresh_token = request.data.get('refresh')
       token = RefreshToken(refresh_token)
       token.blacklist()  # Prevents token reuse
   ```

## Input Validation

### SQL Injection Protection

**NEVER use string interpolation in queries:**

```python
# ❌ VULNERABLE to SQL injection
Account.objects.raw(f"SELECT * FROM accounts WHERE email = '{email}'")
```

**ALWAYS use parameterized queries:**

```python
# ✅ SECURE - Django ORM handles escaping
Account.objects.filter(email=email)

# ✅ If you must use raw SQL, use parameters
Account.objects.raw(
    "SELECT * FROM accounts WHERE email = %s",
    [email]
)
```

### XSS Protection

1. **Django templates auto-escape** by default:
   ```django
   {# ✅ Auto-escaped #}
   <p>{{ user.name }}</p>

   {# ❌ DANGEROUS - bypasses escaping #}
   <p>{{ user.name|safe }}</p>
   ```

2. **DRF serializers handle JSON escaping**:
   ```python
   # ✅ Safe - DRF escapes output
   class AccountSerializer(serializers.ModelSerializer):
       class Meta:
           model = Account
           fields = ['first_name', 'last_name', 'email']
   ```

3. **Validate HTML input**:
   ```python
   import bleach

   def clean_html(html_content):
       return bleach.clean(
           html_content,
           tags=['p', 'br', 'strong', 'em'],
           strip=True
       )
   ```

### CSRF Protection

1. **Enabled by default** in Django
2. **Enforce for state-changing operations**:
   ```python
   # ✅ CSRF token required for POST/PUT/DELETE
   @method_decorator(csrf_protect)
   def post(self, request):
       # ... handle POST ...
   ```

3. **API authentication bypass**:
   ```python
   # DRF with JWT authentication doesn't need CSRF
   # But session authentication DOES need CSRF
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': [
           'rest_framework_simplejwt.authentication.JWTAuthentication',
           # CSRF required for session auth
           'rest_framework.authentication.SessionAuthentication',
       ]
   }
   ```

## Rate Limiting

### Global Rate Limiting

```python
# config/settings/base.py
MIDDLEWARE = [
    # ...
    'apps.core.middleware.rate_limiting.RateLimitMiddleware',
]

RATE_LIMITING = {
    'ENABLED': True,
    'REDIS_URL': config('REDIS_URL', default='redis://localhost:6379/1'),
    'DEFAULT_RATE': '100/hour',
    'LOGIN_RATE': '5/minute',
    'API_RATE': '1000/hour',
}
```

### Endpoint-Specific Rate Limiting

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
def login(request):
    """Login endpoint - 5 attempts per minute per IP."""
    # ... login logic ...
```

### Rate Limit Testing

```python
@pytest.mark.rate_limiting
def test_login_rate_limiting(api_client):
    """Test that login is rate limited."""
    for i in range(6):  # Exceed 5/minute limit
        response = api_client.post('/api/v1/auth/login/', {
            'email': 'test@example.com',
            'password': 'wrong'
        })

        if i < 5:
            assert response.status_code in [400, 401]
        else:
            assert response.status_code == 429  # Too Many Requests
```

## Sensitive Data Protection

### Environment Variables

**NEVER commit secrets to version control:**

```python
# ❌ NEVER hard-code secrets
SECRET_KEY = "django-insecure-123456"
DATABASE_PASSWORD = "mypassword123"

# ✅ Use environment variables
from decouple import config
SECRET_KEY = config('SECRET_KEY')
DATABASE_PASSWORD = config('DB_PASSWORD')
```

### .env File Security

1. **Add to .gitignore**:
   ```gitignore
   .env
   .env.local
   .env.production
   ```

2. **Provide .env.example**:
   ```bash
   # .env.example (committed to repo)
   SECRET_KEY=generate-a-secret-key-here
   DB_PASSWORD=your-database-password
   SENTRY_DSN=your-sentry-dsn
   ```

3. **Generate strong secrets**:
   ```python
   # Generate SECRET_KEY
   python3 -c 'import secrets; print(secrets.token_urlsafe(50))'
   ```

### Logging Sensitive Data

**Filter sensitive data from logs:**

```python
# ❌ NEVER log sensitive data
logger.info(f"User {email} logged in with token {token}")

# ✅ Log without sensitive data
logger.info(f"User {email} logged in successfully", extra={
    'user_id': user.id,
    'ip_address': get_client_ip(request)
})
```

**Sentry PII filtering:**

```python
# config/settings/production.py
def filter_sensitive_data(event, hint):
    """Remove PII from Sentry events."""
    if 'request' in event:
        if 'headers' in event['request']:
            event['request']['headers'].pop('Authorization', None)
            event['request']['headers'].pop('Cookie', None)

        if 'data' in event['request']:
            for key in ['password', 'token', 'secret']:
                event['request']['data'].pop(key, None)

    return event

sentry_sdk.init(
    dsn=SENTRY_DSN,
    before_send=filter_sensitive_data
)
```

## Audit Logging

### Log Security Events

```python
from apps.core.audit import log_audit_event, AuditAction

# ✅ Log failed login attempts
if authentication_failed:
    log_audit_event(
        action=AuditAction.LOGIN_FAILED,
        request=request,
        success=False,
        details={'email': email, 'reason': 'invalid_credentials'}
    )

# ✅ Log successful actions
log_audit_event(
    action=AuditAction.USER_CREATED,
    request=request,
    user=user,
    resource_type='Account',
    resource_id=user.id,
    success=True
)

# ✅ Log access denied events
log_audit_event(
    action=AuditAction.ACCESS_DENIED,
    request=request,
    resource_type='Organization',
    resource_id=org.id,
    success=False,
    details={'reason': 'user_not_member'}
)
```

### What to Log

**DO log:**
- ✅ Authentication events (login, logout, failures)
- ✅ Authorization decisions (access granted/denied)
- ✅ Data modifications (create, update, delete)
- ✅ Permission changes
- ✅ Security events (rate limits, suspicious activity)

**DON'T log:**
- ❌ Passwords
- ❌ API tokens/secrets
- ❌ Credit card numbers
- ❌ Social security numbers
- ❌ Full PII without business justification

## Production Security Checklist

### Before Deployment

- [ ] `DEBUG = False` in production
- [ ] Strong `SECRET_KEY` from environment variable
- [ ] Database credentials in environment variables
- [ ] HTTPS enforced (`SECURE_SSL_REDIRECT = True`)
- [ ] Secure cookies (`SESSION_COOKIE_SECURE = True`)
- [ ] HSTS headers configured
- [ ] CORS properly configured (not `allow_all`)
- [ ] Rate limiting enabled
- [ ] Sentry error tracking configured
- [ ] Audit logging enabled
- [ ] Database backups configured
- [ ] Security headers middleware enabled
- [ ] Password validators enabled
- [ ] JWT token expiration configured

### Regular Security Tasks

- [ ] Review audit logs weekly
- [ ] Update dependencies monthly (security patches)
- [ ] Rotate secrets every 90 days
- [ ] Review user permissions quarterly
- [ ] Conduct security testing before major releases
- [ ] Monitor Sentry for security exceptions
- [ ] Review failed login attempts

### Security Monitoring

```python
# Alert on suspicious patterns
from apps.core.audit.models import AuditLog

# Failed login attempts from same IP
failed_logins = AuditLog.objects.filter(
    action=AuditAction.LOGIN_FAILED,
    ip_address=ip,
    timestamp__gte=timezone.now() - timedelta(minutes=5)
).count()

if failed_logins > 5:
    # Send alert to security team
    alert_security_team(f"Suspicious login attempts from {ip}")
```

## Common Vulnerabilities to Avoid

### 1. Insecure Direct Object References (IDOR)

```python
# ❌ VULNERABLE - Anyone can access any user
def get_user(request, user_id):
    user = Account.objects.get(id=user_id)
    return Response(UserSerializer(user).data)

# ✅ SECURE - Check permissions
def get_user(request, user_id):
    user = Account.objects.get(id=user_id)

    # Check if user belongs to same organization
    if not request.user.get_active_memberships().filter(
        organization__in=user.get_active_memberships().values('organization')
    ).exists():
        raise PermissionDenied

    return Response(UserSerializer(user).data)
```

### 2. Mass Assignment

```python
# ❌ VULNERABLE - User could set is_superuser=True
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'  # Exposes ALL fields!

# ✅ SECURE - Explicit field list
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['first_name', 'last_name', 'email']
        read_only_fields = ['id', 'created_at', 'is_superuser']
```

### 3. Information Disclosure

```python
# ❌ VULNERABLE - Reveals if email exists
if Account.objects.filter(email=email).exists():
    return Response({"error": "Email already registered"})
else:
    return Response({"error": "Invalid credentials"})

# ✅ SECURE - Generic error message
return Response({"error": "Invalid email or password"})
```

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Documentation](https://docs.djangoproject.com/en/5.2/topics/security/)
- [DRF Security Best Practices](https://www.django-rest-framework.org/topics/security/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)

## Security Contacts

- **Security issues**: Report to security@example.com
- **Vulnerability disclosure**: Follow responsible disclosure policy
- **Security team**: Available 24/7 for critical issues

## Revision History

- **2025-10**: Initial security best practices documentation
- **2025-10**: Added tenant isolation security fixes
- **2025-10**: Added audit logging best practices
