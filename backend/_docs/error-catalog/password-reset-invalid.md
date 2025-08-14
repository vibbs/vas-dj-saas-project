# Password reset invalid

**Type URI:** `https://docs.yourapp.com/problems/password-reset-invalid`  
**Default Status:** 400  
**I18n Key:** `account.password_reset_invalid`

## Description

The password reset token is invalid or has expired.

## Associated Codes

- `VDJ-ACC-RESET-400`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/password-reset-invalid",
  "title": "Password reset invalid",
  "status": 400,
  "code": "VDJ-ACC-RESET-400",
  "i18n_key": "account.password_reset_invalid",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
