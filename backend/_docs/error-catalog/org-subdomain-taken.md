# Subdomain unavailable

**Type URI:** `https://docs.yourapp.com/problems/org-subdomain-taken`  
**Default Status:** 409  
**I18n Key:** `org.subdomain.taken`

## Description

This subdomain is already in use by another organization.

## Associated Codes

- `VDJ-ORG-SUB-409`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-subdomain-taken",
  "title": "Subdomain unavailable",
  "status": 409,
  "code": "VDJ-ORG-SUB-409",
  "i18n_key": "org.subdomain.taken",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
