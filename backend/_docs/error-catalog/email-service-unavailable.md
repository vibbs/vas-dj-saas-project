# Email service unavailable

**Type URI:** `https://docs.yourapp.com/problems/email-service-unavailable`  
**Default Status:** 503  
**I18n Key:** `email.service.unavailable`

## Description

Email service is temporarily unavailable.

## Associated Codes

- `VDJ-EMAIL-SRV-503`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/email-service-unavailable",
  "title": "Email service unavailable",
  "status": 503,
  "code": "VDJ-EMAIL-SRV-503",
  "i18n_key": "email.service.unavailable",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
