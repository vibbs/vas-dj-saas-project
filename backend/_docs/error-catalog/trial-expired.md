# Trial period expired

**Type URI:** `https://docs.yourapp.com/problems/trial-expired`  
**Default Status:** 403  
**I18n Key:** `billing.trial.expired`

## Description

The trial period has expired. Please upgrade to continue using the service.

## Associated Codes

- `VDJ-BILL-TRIAL-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/trial-expired",
  "title": "Trial period expired",
  "status": 403,
  "code": "VDJ-BILL-TRIAL-403",
  "i18n_key": "billing.trial.expired",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
