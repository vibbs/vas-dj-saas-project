# Member limit exceeded

**Type URI:** `https://docs.yourapp.com/problems/org-member-limit-exceeded`  
**Default Status:** 403  
**I18n Key:** `org.member.limit_exceeded`

## Description

Organization has reached the maximum number of allowed members.

## Associated Codes

- `VDJ-ORG-LIMIT-403`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-member-limit-exceeded",
  "title": "Member limit exceeded",
  "status": 403,
  "code": "VDJ-ORG-LIMIT-403",
  "i18n_key": "org.member.limit_exceeded",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
