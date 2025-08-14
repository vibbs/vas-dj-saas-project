# Payment failed

**Type URI:** `https://docs.yourapp.com/problems/payment-failed`  
**Default Status:** 402  
**I18n Key:** `billing.payment.failed`

## Description

Payment could not be processed. Please check your payment method.

## Associated Codes

- `VDJ-BILL-PAY-402`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/payment-failed",
  "title": "Payment failed",
  "status": 402,
  "code": "VDJ-BILL-PAY-402",
  "i18n_key": "billing.payment.failed",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
