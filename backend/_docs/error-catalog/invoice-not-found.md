# Invoice not found

**Type URI:** `https://docs.yourapp.com/problems/invoice-not-found`  
**Default Status:** 404  
**I18n Key:** `billing.invoice.not_found`

## Description

The specified invoice could not be found.

## Associated Codes

- `VDJ-BILL-INV-404`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/invoice-not-found",
  "title": "Invoice not found",
  "status": 404,
  "code": "VDJ-BILL-INV-404",
  "i18n_key": "billing.invoice.not_found",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
