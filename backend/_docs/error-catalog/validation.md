# Validation failed

**Type URI:** `https://docs.yourapp.com/problems/validation`  
**Default Status:** 400  
**I18n Key:** `validation.failed`

## Description

The request contains invalid data that failed validation checks.

## Associated Codes

- `VDJ-GEN-VAL-422`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/validation",
  "title": "Validation failed",
  "status": 400,
  "code": "VDJ-GEN-VAL-422",
  "i18n_key": "validation.failed",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
