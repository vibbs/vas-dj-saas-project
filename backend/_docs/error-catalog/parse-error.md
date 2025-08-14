# Parse Error

**Type URI:** `https://docs.yourapp.com/problems/parse-error`  
**Default Status:** 400  
**I18n Key:** `errors.parse_error`

## Description

Malformed request data that could not be parsed.

## Associated Codes

- `VDJ-GEN-BAD-400`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/parse-error",
  "title": "Parse Error",
  "status": 400,
  "code": "VDJ-GEN-BAD-400",
  "i18n_key": "errors.parse_error",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
