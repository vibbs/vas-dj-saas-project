# Service Unavailable

**Type URI:** `https://docs.yourapp.com/problems/service-unavailable`  
**Default Status:** 503  
**I18n Key:** `errors.service_unavailable`

## Description

The service is temporarily unavailable.

## Associated Codes

- `VDJ-GEN-UNAVAIL-503`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/service-unavailable",
  "title": "Service Unavailable",
  "status": 503,
  "code": "VDJ-GEN-UNAVAIL-503",
  "i18n_key": "errors.service_unavailable",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
