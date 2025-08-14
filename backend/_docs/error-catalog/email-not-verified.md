# Email not verified

**Type URI:** `https://docs.yourapp.com/problems/email-not-verified`  
**Default Status:** 403  
**I18n Key:** `account.email_not_verified`

## Description

Email address must be verified before accessing this resource.

## Associated Codes

- `VDJ-ACC-EMAIL-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/email-not-verified",
  "title": "Email not verified",
  "status": 403,
  "code": "VDJ-ACC-EMAIL-403",
  "i18n_key": "account.email_not_verified",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
