# Invite already exists

**Type URI:** `https://docs.yourapp.com/problems/org-invite-conflict`  
**Default Status:** 409  
**I18n Key:** `org.invite.already_exists`

## Description

An invitation for this email address already exists in the organization.

## Associated Codes

- `VDJ-ORG-INVITE-409`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-invite-conflict",
  "title": "Invite already exists",
  "status": 409,
  "code": "VDJ-ORG-INVITE-409",
  "i18n_key": "org.invite.already_exists",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
