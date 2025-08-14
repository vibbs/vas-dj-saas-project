# Invalid email recipient

**Type URI:** `https://docs.yourapp.com/problems/email-invalid-recipient`  
**Default Status:** 400  
**I18n Key:** `email.recipient.invalid`

## Description

The email address provided is invalid.

## Associated Codes

- `VDJ-EMAIL-REC-400`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/email-invalid-recipient",
  "title": "Invalid email recipient",
  "status": 400,
  "code": "VDJ-EMAIL-REC-400",
  "i18n_key": "email.recipient.invalid",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
