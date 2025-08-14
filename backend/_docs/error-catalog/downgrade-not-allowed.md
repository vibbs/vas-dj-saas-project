# Downgrade not allowed

**Type URI:** `https://docs.yourapp.com/problems/downgrade-not-allowed`  
**Default Status:** 403  
**I18n Key:** `billing.downgrade.not_allowed`

## Description

Cannot downgrade to this plan due to current usage limits.

## Associated Codes

- `VDJ-BILL-DOWN-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/downgrade-not-allowed",
  "title": "Downgrade not allowed",
  "status": 403,
  "code": "VDJ-BILL-DOWN-403",
  "i18n_key": "billing.downgrade.not_allowed",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
