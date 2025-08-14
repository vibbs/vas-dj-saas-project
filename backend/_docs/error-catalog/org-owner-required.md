# Organization owner required

**Type URI:** `https://docs.yourapp.com/problems/org-owner-required`  
**Default Status:** 403  
**I18n Key:** `org.owner_required`

## Description

This action requires organization owner permissions.

## Associated Codes

- `VDJ-ORG-OWNER-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-owner-required",
  "title": "Organization owner required",
  "status": 403,
  "code": "VDJ-ORG-OWNER-403",
  "i18n_key": "org.owner_required",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
