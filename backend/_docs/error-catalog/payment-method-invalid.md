# Invalid payment method

**Type URI:** `https://docs.yourapp.com/problems/payment-method-invalid`  
**Default Status:** 400  
**I18n Key:** `billing.payment_method.invalid`

## Description

The provided payment method is invalid or cannot be processed.

## Associated Codes

- `VDJ-BILL-PAY-400`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/payment-method-invalid",
  "title": "Invalid payment method",
  "status": 400,
  "code": "VDJ-BILL-PAY-400",
  "i18n_key": "billing.payment_method.invalid",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
