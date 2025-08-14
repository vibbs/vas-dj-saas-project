# Plan not found

**Type URI:** `https://docs.yourapp.com/problems/plan-not-found`  
**Default Status:** 404  
**I18n Key:** `billing.plan.not_found`

## Description

The specified billing plan could not be found.

## Associated Codes

- `VDJ-BILL-PLAN-404`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/plan-not-found",
  "title": "Plan not found",
  "status": 404,
  "code": "VDJ-BILL-PLAN-404",
  "i18n_key": "billing.plan.not_found",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
