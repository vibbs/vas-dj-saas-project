# Account not found

**Type URI:** `https://docs.yourapp.com/problems/account-not-found`  
**Default Status:** 404  
**I18n Key:** `account.not_found`

## Description

The specified user account could not be found.

## Associated Codes

- `VDJ-ACC-NOTFOUND-404`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/account-not-found",
  "title": "Account not found",
  "status": 404,
  "code": "VDJ-ACC-NOTFOUND-404",
  "i18n_key": "account.not_found",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
