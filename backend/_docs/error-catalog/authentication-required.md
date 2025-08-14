# Authentication Required

**Type URI:** `https://docs.yourapp.com/problems/authentication-required`  
**Default Status:** 401  
**I18n Key:** `errors.authentication_required`

## Description

Authentication credentials were not provided or are invalid.

## Associated Codes

- `VDJ-AUTH-LOGIN-401`
- `VDJ-AUTH-TOKEN-401`
- `VDJ-AUTH-EXPIRED-401`
- `VDJ-AUTH-INVALID-401`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/authentication-required",
  "title": "Authentication Required",
  "status": 401,
  "code": "VDJ-AUTH-LOGIN-401",
  "i18n_key": "errors.authentication_required",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
