# Organization access denied

**Type URI:** `https://docs.yourapp.com/problems/org-access-denied`  
**Default Status:** 403  
**I18n Key:** `org.access_denied`

## Description

You do not have access to this organization.

## Associated Codes

- `VDJ-ORG-ACCESS-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-access-denied",
  "title": "Organization access denied",
  "status": 403,
  "code": "VDJ-ORG-ACCESS-403",
  "i18n_key": "org.access_denied",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
