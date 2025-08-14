# Error Catalog

This documentation provides details about all error types in the VAS-DJ SaaS API.
All errors follow the RFC 7807 "Problem Details for HTTP APIs" specification.

## Error Structure

All error responses have the following structure:

```json
{
  "type": "https://docs.yourapp.com/problems/example",
  "title": "Example Error",
  "status": 400,
  "code": "VDJ-GEN-EXAMPLE-400",
  "i18n_key": "errors.example",
  "detail": "Detailed explanation of the specific error instance",
  "instance": "/api/v1/endpoint",
  "issues": [...],  // For validation errors
  "meta": {...}     // Additional metadata
}
```

## Available Error Types

- [Account already exists](./account-already-exists.md) - An account with this email address already exists.
- [Account inactive](./account-inactive.md) - This account has been deactivated.
- [Account not found](./account-not-found.md) - The specified user account could not be found.
- [Authentication Required](./authentication-required.md) - Authentication credentials were not provided or are invalid.
- [Downgrade not allowed](./downgrade-not-allowed.md) - Cannot downgrade to this plan due to current usage limits.
- [Invalid email recipient](./email-invalid-recipient.md) - The email address provided is invalid.
- [Email not verified](./email-not-verified.md) - Email address must be verified before accessing this resource.
- [Email rate limit exceeded](./email-rate-limit-exceeded.md) - Too many emails sent. Please try again later.
- [Email send failed](./email-send-failed.md) - Failed to send email due to a server error.
- [Email service unavailable](./email-service-unavailable.md) - Email service is temporarily unavailable.
- [Email template not found](./email-template-not-found.md) - The specified email template could not be found.
- [Internal Server Error](./internal.md) - An unexpected server error occurred.
- [Invalid credentials](./invalid-credentials.md) - The email or password provided is incorrect.
- [Invoice not found](./invoice-not-found.md) - The specified invoice could not be found.
- [Method Not Allowed](./method-not-allowed.md) - The HTTP method is not allowed for this endpoint.
- [Not Found](./not-found.md) - The requested resource was not found.
- [Organization access denied](./org-access-denied.md) - You do not have access to this organization.
- [Invite already exists](./org-invite-conflict.md) - An invitation for this email address already exists in the organization.
- [Invalid invitation](./org-invite-invalid.md) - The organization invitation is invalid or has expired.
- [Member already exists](./org-member-exists.md) - This user is already a member of the organization.
- [Member limit exceeded](./org-member-limit-exceeded.md) - Organization has reached the maximum number of allowed members.
- [Organization not found](./org-not-found.md) - The specified organization could not be found.
- [Organization owner required](./org-owner-required.md) - This action requires organization owner permissions.
- [Subdomain unavailable](./org-subdomain-taken.md) - This subdomain is already in use by another organization.
- [Parse Error](./parse-error.md) - Malformed request data that could not be parsed.
- [Password reset invalid](./password-reset-invalid.md) - The password reset token is invalid or has expired.
- [Payment failed](./payment-failed.md) - Payment could not be processed. Please check your payment method.
- [Invalid payment method](./payment-method-invalid.md) - The provided payment method is invalid or cannot be processed.
- [Permission Denied](./permission-denied.md) - You do not have permission to perform this action.
- [Plan not found](./plan-not-found.md) - The specified billing plan could not be found.
- [Profile update failed](./profile-update-failed.md) - Unable to update user profile due to validation errors.
- [Rate Limit Exceeded](./rate-limit-exceeded.md) - Too many requests. Please try again later.
- [Registration disabled](./registration-disabled.md) - Account registration is currently disabled.
- [Service Unavailable](./service-unavailable.md) - The service is temporarily unavailable.
- [Subscription already active](./subscription-already-active.md) - An active subscription already exists for this organization.
- [Subscription not found](./subscription-not-found.md) - The specified subscription could not be found.
- [Trial period expired](./trial-expired.md) - The trial period has expired. Please upgrade to continue using the service.
- [Unsupported Media Type](./unsupported-media-type.md) - The media type of the request data is not supported.
- [Validation failed](./validation.md) - The request contains invalid data that failed validation checks.
