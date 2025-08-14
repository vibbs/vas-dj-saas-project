# Account inactive

**Type URI:** `https://docs.yourapp.com/problems/account-inactive`  
**Default Status:** 403  
**I18n Key:** `account.inactive`

## Description

This account has been deactivated.

## Associated Codes

- `VDJ-ACC-INACTIVE-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/account-inactive",
  "title": "Account inactive",
  "status": 403,
  "code": "VDJ-ACC-INACTIVE-403",
  "i18n_key": "account.inactive",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
