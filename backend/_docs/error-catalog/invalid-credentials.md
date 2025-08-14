# Invalid credentials

**Type URI:** `https://docs.yourapp.com/problems/invalid-credentials`  
**Default Status:** 401  
**I18n Key:** `account.invalid_credentials`

## Description

The email or password provided is incorrect.

## Associated Codes

- `VDJ-ACC-CREDS-401`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/invalid-credentials",
  "title": "Invalid credentials",
  "status": 401,
  "code": "VDJ-ACC-CREDS-401",
  "i18n_key": "account.invalid_credentials",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
