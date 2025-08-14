# Member already exists

**Type URI:** `https://docs.yourapp.com/problems/org-member-exists`  
**Default Status:** 409  
**I18n Key:** `org.member.already_exists`

## Description

This user is already a member of the organization.

## Associated Codes

- `VDJ-ORG-MEMBER-409`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-member-exists",
  "title": "Member already exists",
  "status": 409,
  "code": "VDJ-ORG-MEMBER-409",
  "i18n_key": "org.member.already_exists",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
