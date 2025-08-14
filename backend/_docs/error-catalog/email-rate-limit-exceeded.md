# Email rate limit exceeded

**Type URI:** `https://docs.yourapp.com/problems/email-rate-limit-exceeded`  
**Default Status:** 429  
**I18n Key:** `email.rate_limit.exceeded`

## Description

Too many emails sent. Please try again later.

## Associated Codes

- `VDJ-EMAIL-RATE-429`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/email-rate-limit-exceeded",
  "title": "Email rate limit exceeded",
  "status": 429,
  "code": "VDJ-EMAIL-RATE-429",
  "i18n_key": "email.rate_limit.exceeded",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
