# Subscription already active

**Type URI:** `https://docs.yourapp.com/problems/subscription-already-active`  
**Default Status:** 409  
**I18n Key:** `billing.subscription.already_active`

## Description

An active subscription already exists for this organization.

## Associated Codes

- `VDJ-BILL-SUB-409`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/subscription-already-active",
  "title": "Subscription already active",
  "status": 409,
  "code": "VDJ-BILL-SUB-409",
  "i18n_key": "billing.subscription.already_active",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
