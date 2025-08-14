# Permission Denied

**Type URI:** `https://docs.yourapp.com/problems/permission-denied`  
**Default Status:** 403  
**I18n Key:** `errors.permission_denied`

## Description

You do not have permission to perform this action.

## Associated Codes

- `VDJ-PERM-DENIED-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/permission-denied",
  "title": "Permission Denied",
  "status": 403,
  "code": "VDJ-PERM-DENIED-403",
  "i18n_key": "errors.permission_denied",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
