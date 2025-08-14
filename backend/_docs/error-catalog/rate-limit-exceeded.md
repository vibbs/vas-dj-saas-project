# Rate Limit Exceeded

**Type URI:** `https://docs.yourapp.com/problems/rate-limit-exceeded`  
**Default Status:** 429  
**I18n Key:** `errors.rate_limit_exceeded`

## Description

Too many requests. Please try again later.

## Associated Codes

- `VDJ-GEN-RATE-429`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "code": "VDJ-GEN-RATE-429",
  "i18n_key": "errors.rate_limit_exceeded",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
