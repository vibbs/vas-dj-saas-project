# CORS Configuration Fix - Complete Summary

## Problem
Cross-Origin Resource Sharing (CORS) errors when making POST requests from `http://localhost:3000` to `http://localhost:8000/api/v1/auth/register/`

## Root Causes Identified

### 1. ❌ Missing `CORS_ALLOW_METHODS`
**Issue**: Django CORS Headers by default only allows safe methods (GET, HEAD, OPTIONS). POST requests were being blocked.

**Solution**: Added explicit method configuration in `config/settings/base.py`:
```python
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
```

### 2. ❌ Missing `CSRF_TRUSTED_ORIGINS`
**Issue**: Django 4.0+ requires this setting for cross-origin POST, PUT, PATCH, and DELETE requests. Without it, requests are blocked even if CORS headers are correct.

**Solution**: Added in `config/settings/base.py`:
```python
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:3000,http://localhost:3001",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)
```

And added to `.env`:
```properties
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### 3. ✅ Cookie SameSite Settings (UPDATED FIX)
**Initial Issue**: Originally set to `SameSite=None` which broke Django admin because `SameSite=None` requires `Secure=True`, but development uses HTTP.

**Final Solution**: Use `SameSite=Lax` which works for both same-origin (Django admin) and cross-origin API requests when combined with `CSRF_TRUSTED_ORIGINS`.

Added in `config/settings/base.py`:
```python
# CSRF Cookie Configuration
# Note: For cross-origin requests, CSRF protection is handled via CSRF_TRUSTED_ORIGINS
# SameSite=Lax works for both same-origin (admin) and allows CORS for API requests
CSRF_COOKIE_SAMESITE = "Lax"  # Lax allows cookies in top-level navigation and same-origin requests
CSRF_COOKIE_SECURE = False  # Set to True in production with HTTPS
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF token for API requests
SESSION_COOKIE_SAMESITE = "Lax"  # Lax for session cookies
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
```

**Why Lax works for CORS**: 
- Django's `CSRF_TRUSTED_ORIGINS` setting handles CSRF validation for cross-origin POST requests
- `SameSite=Lax` allows cookies to be sent in cross-origin requests initiated by top-level navigation
- CORS headers (`access-control-allow-origin`, `access-control-allow-credentials`) handle the actual cross-origin access

**⚠️ IMPORTANT**: In production with HTTPS, set `CSRF_COOKIE_SECURE = True` and `SESSION_COOKIE_SECURE = True`

## Verification

### Backend Configuration ✅
Run this command to verify settings:
```bash
docker compose -f docker/docker-compose.yml exec web python manage.py shell -c "
from django.conf import settings
print('CORS_ALLOWED_ORIGINS:', settings.CORS_ALLOWED_ORIGINS)
print('CSRF_TRUSTED_ORIGINS:', settings.CSRF_TRUSTED_ORIGINS)
print('CORS_ALLOW_METHODS:', settings.CORS_ALLOW_METHODS)
print('CSRF_COOKIE_SAMESITE:', settings.CSRF_COOKIE_SAMESITE)
print('SESSION_COOKIE_SAMESITE:', settings.SESSION_COOKIE_SAMESITE)
print('CORS_ALLOW_CREDENTIALS:', settings.CORS_ALLOW_CREDENTIALS)
"
```

Expected output:
```
CORS_ALLOWED_ORIGINS: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
CSRF_TRUSTED_ORIGINS: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
CORS_ALLOW_METHODS: ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CSRF_COOKIE_SAMESITE: Lax
SESSION_COOKIE_SAMESITE: Lax
CORS_ALLOW_CREDENTIALS: True
```

### API Test ✅
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "organization_name": "Test Org"
  }' \
  -v 2>&1 | grep -i "access-control"
```

Should see:
```
< access-control-allow-origin: http://localhost:3000
< access-control-allow-credentials: true
```

## Frontend Requirements

### Critical: Use `credentials: 'include'`
Your frontend MUST include `credentials: 'include'` in the fetch options:

```javascript
// ✅ CORRECT
fetch('http://localhost:8000/api/v1/auth/register/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include', // ← CRITICAL for CORS with cookies
    body: JSON.stringify(formData)
})

// ❌ WRONG - will cause CORS errors
fetch('http://localhost:8000/api/v1/auth/register/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    // Missing credentials: 'include'
    body: JSON.stringify(formData)
})
```

### For axios users:
```javascript
axios.post('http://localhost:8000/api/v1/auth/register/', data, {
    withCredentials: true // ← CRITICAL for CORS with cookies
})
```

## Test Page

A test page has been created at `/Users/vibbsdod/Desktop/workspace/vibe-projects/vas-dj-saas-project/backend/test-cors.html`

To test:
1. Start a local server: `python3 -m http.server 3002`
2. Open: http://localhost:3002/test-cors.html
3. Click "Create Organization" button
4. Should see success message with organization details

## Files Modified

1. **config/settings/base.py**
   - Added `CSRF_TRUSTED_ORIGINS`
   - Added `CORS_ALLOW_METHODS`
   - Added `CSRF_COOKIE_SAMESITE`, `CSRF_COOKIE_SECURE`, `CSRF_COOKIE_HTTPONLY`
   - Added `SESSION_COOKIE_SAMESITE`, `SESSION_COOKIE_SECURE`

2. **.env**
   - Added `CSRF_TRUSTED_ORIGINS` variable

## Next Steps for Frontend Developer

1. **Verify your fetch/axios configuration includes credentials**
   ```javascript
   credentials: 'include'  // for fetch
   withCredentials: true   // for axios
   ```

2. **Check browser console for any remaining errors**

3. **If using a framework (React, Vue, etc.), ensure your HTTP client is configured globally**
   ```javascript
   // For axios
   axios.defaults.withCredentials = true;
   
   // For fetch wrapper
   const api = {
     post: (url, data) => fetch(url, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       credentials: 'include',
       body: JSON.stringify(data)
     })
   };
   ```

4. **Clear browser cache and cookies** if you're still seeing issues

5. **Restart your frontend dev server** to ensure no cached configurations

## Production Considerations

When deploying to production with HTTPS:

```python
# config/settings/production.py
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "None"

# Update CORS and CSRF origins to production domains
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://yourdomain.com",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="https://yourdomain.com",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)
```

## Troubleshooting

### If you still get CORS errors:

1. **Check browser DevTools → Network tab**
   - Look for the OPTIONS preflight request
   - Verify it returns 200 OK
   - Check response headers include `access-control-allow-origin`

2. **Check browser DevTools → Console**
   - Look for specific CORS error messages
   - Look for "Provisional headers are shown" (indicates request didn't complete)

3. **Verify backend is receiving requests**
   ```bash
   docker compose -f docker/docker-compose.yml logs --follow web
   ```

4. **Test with curl to isolate frontend vs backend issues**

5. **Ensure Docker container restarted after config changes**
   ```bash
   docker compose -f docker/docker-compose.yml restart web
   ```

## Summary

✅ **Backend CORS configuration is now correct**
✅ **API endpoints are responding with proper CORS headers**
✅ **Test page successfully creates organizations**

🔍 **Next step**: Verify your frontend code includes `credentials: 'include'` in fetch requests or `withCredentials: true` in axios requests.
