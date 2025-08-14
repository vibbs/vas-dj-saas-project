# Subscription not found

**Type URI:** `https://docs.yourapp.com/problems/subscription-not-found`  
**Default Status:** 404  
**I18n Key:** `billing.subscription.not_found`

## Description

The specified subscription could not be found.

## Associated Codes

- `VDJ-BILL-SUB-404`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/subscription-not-found",
  "title": "Subscription not found",
  "status": 404,
  "code": "VDJ-BILL-SUB-404",
  "i18n_key": "billing.subscription.not_found",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
