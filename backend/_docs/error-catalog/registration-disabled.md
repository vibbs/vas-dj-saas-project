# Registration disabled

**Type URI:** `https://docs.yourapp.com/problems/registration-disabled`  
**Default Status:** 403  
**I18n Key:** `account.registration_disabled`

## Description

Account registration is currently disabled.

## Associated Codes

- `VDJ-ACC-REG-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/registration-disabled",
  "title": "Registration disabled",
  "status": 403,
  "code": "VDJ-ACC-REG-403",
  "i18n_key": "account.registration_disabled",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
