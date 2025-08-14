# Account already exists

**Type URI:** `https://docs.yourapp.com/problems/account-already-exists`  
**Default Status:** 409  
**I18n Key:** `account.already_exists`

## Description

An account with this email address already exists.

## Associated Codes

- `VDJ-ACC-EXISTS-409`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/account-already-exists",
  "title": "Account already exists",
  "status": 409,
  "code": "VDJ-ACC-EXISTS-409",
  "i18n_key": "account.already_exists",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
