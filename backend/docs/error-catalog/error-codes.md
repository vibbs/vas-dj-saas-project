# Error Code Catalog

## Overview

This document catalogs all standardized error codes used in the VAS-DJ SaaS API. All API errors follow [RFC 7807 (Problem Details for HTTP APIs)](https://tools.ietf.org/html/rfc7807) format.

## Error Response Format

```json
{
  "type": "https://api.example.com/errors/authentication/invalid-credentials",
  "title": "Invalid Credentials",
  "status": 401,
  "detail": "The email or password you entered is incorrect.",
  "instance": "/api/v1/auth/login/",
  "timestamp": "2025-10-15T12:34:56Z",
  "request_id": "abc123",
  "code": "AUTH001"
}
```

## Error Code Structure

Format: `{MODULE}{NUMBER}`

- **AUTH**: Authentication errors (001-099)
- **AUTHZ**: Authorization errors (100-199)
- **ACCT**: Account management errors (200-299)
- **ORG**: Organization errors (300-399)
- **BILL**: Billing errors (400-499)
- **VALID**: Validation errors (500-599)
- **SYS**: System errors (900-999)

## Authentication Errors (AUTH001-099)

### AUTH001: Invalid Credentials
- **Status**: 401 Unauthorized
- **Title**: Invalid Credentials
- **Detail**: The email or password you entered is incorrect
- **Causes**: Wrong password, non-existent email
- **Solution**: Verify credentials and try again

### AUTH002: Email Not Verified
- **Status**: 403 Forbidden
- **Title**: Email Not Verified
- **Detail**: Please verify your email address before logging in
- **Causes**: User hasn't clicked verification link
- **Solution**: Check email for verification link or request new one

### AUTH003: Account Inactive
- **Status**: 403 Forbidden
- **Title**: Account Inactive
- **Detail**: Your account has been deactivated
- **Causes**: Account suspended or deleted
- **Solution**: Contact support to reactivate account

### AUTH004: Invalid Token
- **Status**: 401 Unauthorized
- **Title**: Invalid Token
- **Detail**: The authentication token is invalid or has expired
- **Causes**: Expired JWT, malformed token, blacklisted token
- **Solution**: Refresh token or re-authenticate

### AUTH005: Token Expired
- **Status**: 401 Unauthorized
- **Title**: Token Expired
- **Detail**: Your session has expired. Please log in again
- **Causes**: JWT access token exceeded lifetime (15 minutes)
- **Solution**: Use refresh token to get new access token

### AUTH006: Missing Authentication
- **Status**: 401 Unauthorized
- **Title**: Authentication Required
- **Detail**: This endpoint requires authentication
- **Causes**: No Authorization header provided
- **Solution**: Include `Authorization: Bearer {token}` header

### AUTH007: Email Verification Token Invalid
- **Status**: 400 Bad Request
- **Title**: Invalid Verification Token
- **Detail**: The email verification token is invalid or has expired
- **Causes**: Token used twice, expired (>7 days), or malformed
- **Solution**: Request new verification email

### AUTH008: Password Reset Token Invalid
- **Status**: 400 Bad Request
- **Title**: Invalid Reset Token
- **Detail**: The password reset token is invalid or has expired
- **Causes**: Token used twice, expired (>1 hour), or malformed
- **Solution**: Request new password reset email

### AUTH009: Account Locked
- **Status**: 429 Too Many Requests
- **Title**: Account Temporarily Locked
- **Detail**: Too many failed login attempts. Please try again in 15 minutes
- **Causes**: Rate limiting triggered (>5 failed attempts)
- **Solution**: Wait for lockout period to expire

## Authorization Errors (AUTHZ100-199)

### AUTHZ100: Permission Denied
- **Status**: 403 Forbidden
- **Title**: Permission Denied
- **Detail**: You don't have permission to perform this action
- **Causes**: Insufficient role permissions
- **Solution**: Contact organization admin for access

### AUTHZ101: Organization Access Denied
- **Status**: 403 Forbidden
- **Title**: Organization Access Denied
- **Detail**: You don't have access to this organization
- **Causes**: Not a member of organization, membership suspended
- **Solution**: Request invite from organization owner

### AUTHZ102: Admin Access Required
- **Status**: 403 Forbidden
- **Title**: Admin Access Required
- **Detail**: This action requires administrator privileges
- **Causes**: User role is 'member', not 'admin' or 'owner'
- **Solution**: Contact organization owner for admin role

### AUTHZ103: Owner Access Required
- **Status**: 403 Forbidden
- **Title**: Owner Access Required
- **Detail**: Only the organization owner can perform this action
- **Causes**: Attempting to delete organization, transfer ownership, etc.
- **Solution**: Must be organization owner

### AUTHZ104: Suspended Membership
- **Status**: 403 Forbidden
- **Title**: Membership Suspended
- **Detail**: Your membership in this organization has been suspended
- **Causes**: Admin suspended user access
- **Solution**: Contact organization admin

## Account Management Errors (ACCT200-299)

### ACCT200: Email Already Registered
- **Status**: 400 Bad Request
- **Title**: Email Already Registered
- **Detail**: An account with this email address already exists
- **Causes**: Duplicate registration attempt
- **Solution**: Log in with existing account or use password reset

### ACCT201: Invalid Email Format
- **Status**: 400 Bad Request
- **Title**: Invalid Email Format
- **Detail**: Please provide a valid email address
- **Causes**: Malformed email (missing @, invalid domain)
- **Solution**: Check email format and try again

### ACCT202: Weak Password
- **Status**: 400 Bad Request
- **Title**: Password Too Weak
- **Detail**: Password must be at least 8 characters and include numbers/symbols
- **Causes**: Password doesn't meet security requirements
- **Solution**: Choose a stronger password

### ACCT203: Password Mismatch
- **Status**: 400 Bad Request
- **Title**: Password Confirmation Mismatch
- **Detail**: The password and confirmation password don't match
- **Causes**: Typo in password confirmation field
- **Solution**: Ensure both passwords match

### ACCT204: User Not Found
- **Status**: 404 Not Found
- **Title**: User Not Found
- **Detail**: No user found with the provided identifier
- **Causes**: Invalid user ID, user deleted
- **Solution**: Verify user ID

### ACCT205: Profile Update Failed
- **Status**: 400 Bad Request
- **Title**: Profile Update Failed
- **Detail**: Unable to update user profile
- **Causes**: Invalid data, missing required fields
- **Solution**: Check request data and try again

## Organization Errors (ORG300-399)

### ORG300: Organization Not Found
- **Status**: 404 Not Found
- **Title**: Organization Not Found
- **Detail**: No organization found with the provided identifier
- **Causes**: Invalid org ID, org deleted, wrong subdomain
- **Solution**: Verify organization identifier

### ORG301: Subdomain Already Taken
- **Status**: 400 Bad Request
- **Title**: Subdomain Already Taken
- **Detail**: This subdomain is already in use
- **Causes**: Duplicate subdomain in registration
- **Solution**: Choose a different subdomain

### ORG302: Invalid Subdomain Format
- **Status**: 400 Bad Request
- **Title**: Invalid Subdomain Format
- **Detail**: Subdomain must be 3-63 characters, lowercase letters and numbers only
- **Causes**: Special characters, too short/long, uppercase
- **Solution**: Follow subdomain format rules

### ORG303: Reserved Subdomain
- **Status**: 400 Bad Request
- **Title**: Reserved Subdomain
- **Detail**: This subdomain is reserved and cannot be used
- **Causes**: Attempting to use www, api, admin, etc.
- **Solution**: Choose a different subdomain

### ORG304: Member Limit Reached
- **Status**: 403 Forbidden
- **Title**: Member Limit Reached
- **Detail**: Your plan allows a maximum of {limit} members
- **Causes**: Attempting to invite user beyond plan limit
- **Solution**: Upgrade plan or remove inactive members

### ORG305: Cannot Remove Last Owner
- **Status**: 400 Bad Request
- **Title**: Cannot Remove Last Owner
- **Detail**: Organizations must have at least one owner
- **Causes**: Attempting to demote only owner or delete their membership
- **Solution**: Promote another member to owner first

### ORG306: Invite Already Sent
- **Status**: 400 Bad Request
- **Title**: Invite Already Sent
- **Detail**: An invite has already been sent to this email address
- **Causes**: Duplicate invite attempt
- **Solution**: Resend existing invite or wait for response

### ORG307: Invite Expired
- **Status**: 400 Bad Request
- **Title**: Invite Expired
- **Detail**: This invitation has expired
- **Causes**: Invite older than 7 days
- **Solution**: Request new invite from organization

### ORG308: Invite Already Accepted
- **Status**: 400 Bad Request
- **Title**: Invite Already Accepted
- **Detail**: This invitation has already been accepted
- **Causes**: Attempting to accept invite twice
- **Solution**: Log in to access organization

### ORG309: User Already Member
- **Status**: 400 Bad Request
- **Title**: User Already Member
- **Detail**: This user is already a member of the organization
- **Causes**: Inviting existing member
- **Solution**: Update existing membership instead

## Billing Errors (BILL400-499)

### BILL400: Payment Required
- **Status**: 402 Payment Required
- **Title**: Payment Required
- **Detail**: This feature requires an active subscription
- **Causes**: Free plan accessing paid features
- **Solution**: Upgrade to paid plan

### BILL401: Trial Expired
- **Status**: 403 Forbidden
- **Title**: Trial Period Expired
- **Detail**: Your trial period has ended. Please subscribe to continue
- **Causes**: 14-day trial expired
- **Solution**: Add payment method and subscribe

### BILL402: Subscription Inactive
- **Status**: 403 Forbidden
- **Title**: Subscription Inactive
- **Detail**: Your subscription is currently inactive
- **Causes**: Payment failed, subscription cancelled
- **Solution**: Update payment method or resubscribe

### BILL403: Invalid Plan
- **Status**: 400 Bad Request
- **Title**: Invalid Plan
- **Detail**: The requested plan does not exist
- **Causes**: Invalid plan ID
- **Solution**: Choose valid plan (free, starter, pro, enterprise)

### BILL404: Downgrade Not Allowed
- **Status**: 400 Bad Request
- **Title**: Downgrade Not Allowed
- **Detail**: Cannot downgrade while using premium features
- **Causes**: Using features not available in target plan
- **Solution**: Remove premium features before downgrading

## Validation Errors (VALID500-599)

### VALID500: Missing Required Field
- **Status**: 400 Bad Request
- **Title**: Missing Required Field
- **Detail**: The field '{field_name}' is required
- **Causes**: Required field not provided in request
- **Solution**: Include all required fields

### VALID501: Invalid Field Format
- **Status**: 400 Bad Request
- **Title**: Invalid Field Format
- **Detail**: The field '{field_name}' has an invalid format
- **Causes**: Wrong data type, invalid format
- **Solution**: Check field format and try again

### VALID502: Field Too Long
- **Status**: 400 Bad Request
- **Title**: Field Too Long
- **Detail**: The field '{field_name}' exceeds maximum length of {max_length}
- **Causes**: Input exceeds max_length constraint
- **Solution**: Shorten input to meet requirements

### VALID503: Invalid Choice
- **Status**: 400 Bad Request
- **Title**: Invalid Choice
- **Detail**: '{value}' is not a valid choice for '{field_name}'
- **Causes**: Value not in allowed choices
- **Solution**: Use one of the allowed values

### VALID504: Unique Constraint Violation
- **Status**: 400 Bad Request
- **Title**: Unique Constraint Violation
- **Detail**: A record with this value already exists
- **Causes**: Duplicate unique field (email, subdomain)
- **Solution**: Use a different value

## System Errors (SYS900-999)

### SYS900: Internal Server Error
- **Status**: 500 Internal Server Error
- **Title**: Internal Server Error
- **Detail**: An unexpected error occurred. Please try again later
- **Causes**: Unhandled exception, database error
- **Solution**: Contact support if persists

### SYS901: Service Unavailable
- **Status**: 503 Service Unavailable
- **Title**: Service Unavailable
- **Detail**: The service is temporarily unavailable
- **Causes**: Maintenance, database down
- **Solution**: Try again in a few minutes

### SYS902: Database Error
- **Status**: 500 Internal Server Error
- **Title**: Database Error
- **Detail**: Unable to complete database operation
- **Causes**: Connection lost, timeout, deadlock
- **Solution**: Retry request

### SYS903: External Service Error
- **Status**: 502 Bad Gateway
- **Title**: External Service Error
- **Detail**: An external service is currently unavailable
- **Causes**: Payment gateway, email service down
- **Solution**: Try again later

### SYS904: Rate Limit Exceeded
- **Status**: 429 Too Many Requests
- **Title**: Rate Limit Exceeded
- **Detail**: You have exceeded the rate limit. Please try again in {retry_after} seconds
- **Causes**: Too many requests in short time
- **Solution**: Wait for rate limit reset

## Error Handling Examples

### Client-Side Error Handling

```javascript
// JavaScript/TypeScript example
try {
  const response = await fetch('/api/v1/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();

    switch (error.code) {
      case 'AUTH001':
        showError('Invalid email or password');
        break;
      case 'AUTH002':
        showError('Please verify your email first');
        redirectTo('/verify-email');
        break;
      case 'AUTH009':
        showError('Too many attempts. Try again in 15 minutes');
        break;
      default:
        showError(error.detail || 'Login failed');
    }
  }
} catch (err) {
  showError('Network error. Please check your connection');
}
```

### Server-Side Error Creation

```python
# Python/Django example
from apps.core.exceptions import AuthenticationError

def login(request):
    if not authenticate(email, password):
        raise AuthenticationError(
            code='AUTH001',
            detail='The email or password you entered is incorrect'
        )
```

## Monitoring & Alerting

### Error Rate Monitoring

Monitor error rates by code to identify issues:

- **AUTH009** spike: Possible brute force attack
- **SYS900** spike: System instability
- **ORG304** spike: Many users hitting plan limits

### Sentry Integration

All errors are automatically sent to Sentry with:
- Error code
- Request context
- User information (non-PII)
- Stack trace

## Revision History

- **2025-10**: Initial error catalog creation
- **2025-10**: Added RFC 7807 compliance
