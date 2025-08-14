# Invalid invitation

**Type URI:** `https://docs.yourapp.com/problems/org-invite-invalid`  
**Default Status:** 400  
**I18n Key:** `org.invite.invalid`

## Description

The organization invitation is invalid or has expired.

## Associated Codes

- `VDJ-ORG-INVITE-400`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/org-invite-invalid",
  "title": "Invalid invitation",
  "status": 400,
  "code": "VDJ-ORG-INVITE-400",
  "i18n_key": "org.invite.invalid",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
