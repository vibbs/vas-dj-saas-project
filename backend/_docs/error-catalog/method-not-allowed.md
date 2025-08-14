# Method Not Allowed

**Type URI:** `https://docs.yourapp.com/problems/method-not-allowed`  
**Default Status:** 405  
**I18n Key:** `errors.method_not_allowed`

## Description

The HTTP method is not allowed for this endpoint.

## Associated Codes

- `VDJ-GEN-BAD-405`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/method-not-allowed",
  "title": "Method Not Allowed",
  "status": 405,
  "code": "VDJ-GEN-BAD-405",
  "i18n_key": "errors.method_not_allowed",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
