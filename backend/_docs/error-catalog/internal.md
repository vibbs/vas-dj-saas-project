# Internal Server Error

**Type URI:** `https://docs.yourapp.com/problems/internal`  
**Default Status:** 500  
**I18n Key:** `errors.internal`

## Description

An unexpected server error occurred.

## Associated Codes

- `VDJ-GEN-ERR-500`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/internal",
  "title": "Internal Server Error",
  "status": 500,
  "code": "VDJ-GEN-ERR-500",
  "i18n_key": "errors.internal",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
